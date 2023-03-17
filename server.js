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

const getRecipesQuery = async function () {
  const result = await query('SELECT * FROM Recipe;', [])

  let status = 200
  let msg = 'healthy'

  if (result === undefined || result.length === 0) {
    status = 500
    msg = 'unhealthy'
  }

  return { status, msg, result }
}

const queryMealDBByName = async function (name) {
  const result = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name)
  return result
}

const querySpoonacularByIngredients = async function (ingredients, maxNumber) {

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
  .get('/getRecipes', async function (req, res) {
    const results = await getRecipesQuery()
    res.status(200).json({ recipes: results.result })
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
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
