// Made by Kartik

const express = require('express');
const app = express()
const client_routes = require('./routes/client_routes_refactored')
const service_routes = require('./routes/service_routes')
const payment_routes = require('./routes/payment_routes')
const ticket_routes = require('./routes/ticket_routes')
const otp_routes = require("./routes/otp_routes");
const email_verification_routes = require("./routes/email_verification_routes");

//  Importing Middlewares
const {generalLimiter, OTPLimiter, authLimiter} = require('./middlewares/rateLimiter');

// Middlewares
app.use(express.json())
app.use(generalLimiter);

app.set('trust proxy', true);


// In Express.js
app.use('/uploads', express.static('uploads'));
app.use('/uploads/pujas', express.static('uploads/pujas'));
app.use('/uploads/category', express.static('uploads/category'));
app.use('/uploads/priest', express.static('uploads/priest'));


// Defining Routes
app.get('/', (req, res)=> {
    res.send("Awesome!")
})

// For client App!
app.use('/api/client', client_routes);

// For Employees App!
app.use('/api/service', service_routes);

// For Payment Procsssing
app.use('/api/payment', payment_routes);

// For Support Tickets
app.use('/api/tickets', ticket_routes);

// For OTP Services
app.use("/api/otp", otp_routes);

// For Email Verification
app.use("/api/verify-email", email_verification_routes);

module.exports = app;

// /api/verify-email/verify-email/  