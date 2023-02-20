const { query, healthQuery } = require('../server.js')

describe('healthQuery', function () {
    it ('should return a status between 200 & 399', async function () {
        const result = await healthQuery()
        expect(result.status).toBeGreaterThanOrEqual(200)
        expect(result.status).toBeLessThanOrEqual(399)
    })
})

describe('getRecipesQuery', function () {
    it ('should return a status between 200 & 399', async function () {
        const result = await getRecipesQuery()
        expect(result.status).toBeGreaterThanOrEqual(200)
        expect(result.status).toBeLessThanOrEqual(399)
    })
})