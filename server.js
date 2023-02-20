require('dotenv').config()

const express = require('express')
const path = require('path')
const assert = require('assert')
const { Pool } = require('pg')

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
    const result = await query('SELECT * FROM Recipe', [])

    let status = 200
    let msg = 'healthy'

    if (result=== undefined || result.length === 0) {
        status = 500
        msg = 'unhealthy'
    }

    return { status, msg }
}

const getRecipesQuery = async function () {
    const result = await query('SELECT * FROM Recipe', [])
    
    let status = 200
    let msg = 'healthy'

    if (result=== undefined || result.length === 0) {
        status = 500
        msg = 'unhealthy'
    }

    return { status, msg, result }
}

module.exports = {
    query,
    healthQuery,
    getRecipesQuery
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
        result = await healthQuery()
        res.status(result.status).send(result.msg)
    })
    .get('/about', function (req, res) {
        res.render('pages/about')
    })
    .get('/contact', function (req, res) {
        res.render('pages/contact')
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))