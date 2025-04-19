// Wrote By Anonymous
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "pujaharghar",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

})

const pool_promise = pool.promise();

module.exports = pool_promise
