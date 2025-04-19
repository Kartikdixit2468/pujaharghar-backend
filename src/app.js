// Made by Kartik

const express = require('express');
const app = express()
const client_routes = require('./routes/client_routes')
const service_routes = require('./routes/service_routes')

// Middlewares
app.use(express.json())


// Defining Routes
app.get('/', (req, res)=> {
    res.send("Awesome!")
})

// For client App!
app.use('/api/client', client_routes);

// For Employees App!
app.use('/api/service', service_routes);


module.exports = app;
