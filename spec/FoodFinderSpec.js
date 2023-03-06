const { query, healthQuery, getRecipesQuery, queryMealDBByName } = require('../server.js')

const baseUrl = 'http://localhost:5163'
describe('healthQuery', function () {
  it('should return a status between 200 & 399', async function () {
    const result = await healthQuery()
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
  })
})

describe('getRecipesQuery', function () {
  it('should return a status between 200 & 399', async function () {
    const result = await getRecipesQuery()
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
  })
})

describe('GET /', function () {
  it('should return a status between 200 & 399', async function () {
    const result = await fetch(baseUrl)
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
  })
})
describe('getRecipes Fetch', function () {
  it('should return a status between 200 & 399 and give a list of recipes', async function () {
    const result = await fetch(baseUrl + '/getRecipes')
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
    const body = await result.json()
    expect(body.recipes).toBeDefined()
    expect(body.recipes.length).toBeGreaterThan(0)
  })
})
describe('QueryMealDBByName', function () {
  it('should return a status between 200 & 399 and give a list of recipes', async function () {
    const result = await queryMealDBByName('chicken')
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
    const json = await result.json()
    expect(json.meals).toBeDefined()
  })
})

describe('GET /finder', function () {
  it('should return a status between 200 & 399 and give a list of recipes', async function () {
    const result = await fetch(baseUrl + '/finder')
    expect(result.status).toBeGreaterThanOrEqual(200)
    expect(result.status).toBeLessThanOrEqual(399)
    const body = await result.text()
  })
})
