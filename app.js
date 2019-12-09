////////////////////////////////////////////////////////////////////
/* Config */
////////////////////////////////////////////////////////////////////
require('dotenv').config({
    path: 'variables.env'
})
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
/* Server Setup */
////////////////////////////////////////////////////////////////////
const express = require('express')
const helmet = require('helmet')
const slowDown = require('express-slow-down')

// App
const app = express()
const port = process.env.PORT || 5000

// JSON parsing
app.use(express.json({
    limit: '2mb',
    type: 'application/json'
}))

// Security
app.use(helmet()) // Use Helmet security
app.use(helmet.noCache()) // Stop Caching
app.use(helmet.frameguard()) // Stop iFrame Clickjacking
app.disable('x-powered-by') // Remove headers used by scanners
app.use(helmet.noSniff()) // Add Content-Type-Options
app.enable('trust proxy') // Allow app to run behind nginx
app.use((req, res, next) => { // Prevent XSS
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-XSS-Protection", "1")
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    next()
})
if (process.env.SECURE) { // Redirect all HTTP traffic to HTTPS
    app.use(function (req, res, next) {
        if (req.protocol.includes('http://')) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''))
        }
        next()
    })
}
app.use(function (req, res, next) { // CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization");
    next()
})
const limiter = slowDown({ // Prevent DDOS
    windowMs: 60 * 1000, // in a 1 minute window,
    delayAfter: 100, // allow 100 requests,
    delayMs: 100 // then delay 100ms cumulative on additional requests
})
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
/* Database */
////////////////////////////////////////////////////////////////////
const mongoose = require('mongoose')

// Schemas & Models
require('./models/User')

// Connection
mongoose.connect(process.env.DATABASE, {
    server: {
        socketOptions: {
            socketTimeoutMS: 0,
            connectionTimeout: 0
        }
    }
})
mongoose.connection.on('error', (e) => {
    console.error(e.message)
})
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
/* Logging */
////////////////////////////////////////////////////////////////////
const chalk = require('chalk')

// Request Handler Logging
const log = (q, s, n) => {
    console.log(
        chalk.bgBlack.white(q.baseUrl), // URL of API used
        chalk.bgCyan.black(q.path), // Path queried
        chalk.bgYellow.black(q.method), // Method used (GET, POST, etc)
        chalk.bgRed.white(q.ip), // IP of user
        chalk.bgGreen.black(new Date())) // Timestamp
    n()
}

// Color Coding for console logs
console.info = (...args) => console.log(chalk.bgCyan.black(...args))
console.error = (...args) => console.log(chalk.green.bgRed(...args))
console.success = (...args) => console.log(chalk.bgGreen.blue(...args))
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
/* Routes */
////////////////////////////////////////////////////////////////////
const user = require('./routes/user')

app.post('/v1/login', limiter, log, user.auth) // JWT
app.post('/v1/signup', limiter, log, user.create) // C
app.post('/v1/me', limiter, log, user.read) // R
app.post('/v1/update', limiter, log, user.update) // U
app.post('/v1/delete', limiter, log, user.delete) // D

app.get('/v1/status', limiter, log, (q, s) => s.sendStatus(200))
app.get('/', limiter, log, (q, s) => s.redirect('https://github.com/pshah123/crud-boilerplate'))
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
/* Run Server */
////////////////////////////////////////////////////////////////////
http.listen(port, () => {
    console.success('[SERVER] Started on port', port)
})
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////