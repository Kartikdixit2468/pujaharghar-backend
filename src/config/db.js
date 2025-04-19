// Wrote By Anonymous
const mysql = require("mysql2");
require("dotenv").config();


const pool = mysql.createPool({
  host: "localhost",
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const pool_promise = pool.promise();

module.exports = pool_promise;
