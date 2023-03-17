// const fetch = require('node-fetch')
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import assert from 'assert'
import pg from 'pg'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { Pool } = pg
dotenv.config()

const PORT = process.env.PORT || 5163

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const query = async function (sql, params) {
  assert.strictEqual(typeof sql, 'string',
    'Expected src to be a string')

  let client
  let results = []
  try {
    client = await pool.connect()
    const response = await client.query(sql, params)
    if (response && response.rows) {
      results = response.rows
    }
  } catch (err) {
    console.error(err)
  }
  if (client) client.release()
  return results
}

const removeDuplicateRecipes = function (recipes) {
  const uniqueRecipes = []
  for (const recipe of recipes) {
    let counter = 0
    for (const recipe2 of recipes) {
      if (recipe.recipe_name === recipe2.recipe_name) {
        counter++
      }
    }
    if (counter === 1) {
      uniqueRecipes.push(recipe)
    }
  }
  return uniqueRecipes
}

const healthQuery = async function () {
  const result = await query('SELECT * FROM Recipe LIMIT 1;', [])

  let status = 200
  let msg = 'healthy'

  if (result === undefined || result.length === 0) {
    status = 500
    msg = 'unhealthy'
  }

  return { status, msg }
}

const getRecipesQuery = async function (ingredients, name) {
  let finalList = []
  if (ingredients[0] !== 'none') {
    const mealDbResults = await queryMealDBByIngredients(ingredients)
    for (const recipe of mealDbResults) {
      finalList.push(recipe)
    }
  }
  const localDbResults = await query('SELECT * FROM Recipe;', [])
  const recipes = []
  for (const recipe of localDbResults) {
    const newRecipe = {}
    newRecipe.ingredients = []
    newRecipe.recipe_name = recipe.recipe_name
    const recipeIngredients = await query('SELECT * FROM IngredientList INNER JOIN Ingredient ON ' +
      'IngredientList.ingredient_id = Ingredient.ingredient_id WHERE recipe_id = $1;', [recipe.recipe_id])
    for (const ingredient of recipeIngredients) {
      newRecipe.ingredients.push(ingredient.ingredient_name.toLowerCase())
    }
    recipes.push(newRecipe)
  }
  for (const recipe of recipes) {
    for (const ingredient of ingredients) {
      for (const recipeIngredient of recipe.ingredients) {
        if (recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())) {
          finalList.push(recipe)
        }
      }
    }
  }
  if (name !== undefined) {
    const results = await queryMealDBByName(name)
    const jsonResults = await results.json()
    if (jsonResults.meals !== null) {
      for (const recipe of jsonResults.meals) {
        const displayRecipe = {}
        displayRecipe.recipe_name = recipe.strMeal
        displayRecipe.recipe_link = recipe.strSource
        finalList.push(displayRecipe)
      }
    }
  }
  finalList = removeDuplicateRecipes(finalList)
  return finalList
}

const queryMealDBByName = async function (name) {
  const result = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name)
  return result
}

const queryMealDBByIngredients = async function (ingredients) {
  const finalList = []
  for (const ingredient of ingredients) {
    const result = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?i=' + ingredient)
    const json = await result.json()
    if (json.meals !== null) {
      for (const recipe of json.meals) {
        const displayRecipe = {}
        const result = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + recipe.idMeal)
        const json = await result.json()
        if (json.meals !== null) {
          displayRecipe.recipe_name = json.meals[0].strMeal
          displayRecipe.recipe_link = json.meals[0].strSource
          finalList.push(displayRecipe)
        }
      }
    }
  }
  return finalList
}

export {
  query,
  healthQuery,
  getRecipesQuery,
  queryMealDBByName
}

express()
  .use(express.static(path.join(__dirname, 'public/')))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', function (req, res) {
    res.render('pages/index')
  })
  .get('/health', async function (req, res) {
    const result = await healthQuery()
    res.status(result.status).send(result.msg)
  })
  .get('/about', function (req, res) {
    res.render('pages/about')
  })
  .get('/contact', function (req, res) {
    res.render('pages/contact')
  })
  .get('/finder', async function (req, res) {
    res.render('pages/finder', { recipes: [] })
  })
  .get('/finder/:search', async function (req, res) {
    const results = await getRecipesQuery()
    let response
    if (req.params.search !== undefined || req.params.search !== null) {
      const recipes = []
      response = await queryMealDBByName(req.params.search)
      const json = await response.json()
      if (json.meals !== null) {
        for (let i = 0; i < json.meals.length; i++) {
          const recipe = {}
          recipe.recipe_name = json.meals[i].strMeal
          recipe.recipe_link = json.meals[i].strSource
          recipes.push(recipe)
        }
      }
      for (let i = 0; i < results.result.length; i++) {
        const recipe = {}
        if (results.result[i].recipe_name.toLowerCase().includes(req.params.search.toLowerCase())) {
          recipe.recipe_name = results.result[i].recipe_name
          recipes.push(recipe)
        }
      }
      res.render('pages/finder', { recipes })
    } else {
      res.render('pages/finder', { recipes: results.result })
    }
  })
  .get('/addRecipe', function (req, res) {
    res.render('pages/addRecipe')
  })
  .get('/getRecipes/:ingredients/:name', async function (req, res) {
    const ingredients = req.params.ingredients.split(',')
    const results = await getRecipesQuery(ingredients, req.params.name)
    res.status(200).json({ recipes: results })
  })
  .post('/newRecipe', async function (req, res) {
    const { name, ingredients, steps } = req.body
    if (name === null || name === '' || ingredients === null || ingredients === '' || steps === null || steps === '') {
      res.status(400).send('Bad Request')
      res.end()
    } else {
      const sql = 'INSERT INTO Recipe (name) VALUES ($1);'
      const params = [name]
      const recipeResult = await query(sql, params)
      const sql2 = 'INSERT INTO Ingredient (ingredient_name) VALUES ($1);'
      for (let i = 0; i < ingredients.length; i++) {
        const params2 = [ingredients[i].name]
        const ingredientResult = await query(sql2, params2)
      }
      const sql3 = 'INSERT INTO StepList (recipe_id, step_text) VALUES ($1, $2);'
      const params3 = [recipeResult[0].id, steps]
      const stepResult = await query(sql3, params3)

      const sql4 = 'INSERT INTO IngredientList (recipe_id, ingredient_id, amount) VALUES ($1, $2, $3);'
      for (let i = 0; i < ingredients.length; i++) {
        const params4 = [recipeResult[0].id, i + 1, ingredients[i]]
        const ingredientListResult = await query(sql4, params4)
      }
      res.status(200).json({ recipeResult })
    }
  })
  .post('/newContactRequest', function (req, res) {
    const { firstName, lastName, email, subject, message } = req.body
    const sql = 'INSERT INTO contact_message (first_name, last_name, email, subject, message) VALUES ($1, $2, $3, $4, $5);'
    const params = [firstName, lastName, email, subject, message]
    const result = query(sql, params)
    res.status(200).json({ result })
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
