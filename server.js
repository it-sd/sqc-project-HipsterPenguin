const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5163

express()
    .use(express.static(path.join(__dirname, 'public/')))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', function (req, res) {
        res.render('pages/index')
    })
    .get('/health', function (req, res) {
        res.send('Healthy')
        res.sendStatus(200)
    })
    .get('/about', function (req, res) {
        res.render('pages/about')
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))