const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

const createSessionToken = (email) => {
  return jwt.sign({ email: email }, SECRET_KEY, { expiresIn: "30d" });
};

const verifyToken = (token) => {
  try {
    console.log(token);
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = { createSessionToken, verifyToken, SECRET_KEY };
