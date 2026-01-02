require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;
const SQL_USER = process.env.SQL_USER;

const authMiddleware = (req, res, next) => {
  console.log("In AUTH")
  // console.log("SECRET_KEY in auth middleware:", SECRET_KEY);
  // console.log("SQL_USER in auth middleware:", SQL_USER);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Remove "Bearer"

  // console.log("token: ", token)

  if (!token) return res.status(401).json({ success: false, error: "Token missing" });

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user; // Attach user to request
    console.log("Authenticated user:", user);
    next(); // Proceed to actual route
  } catch (err) {
    // console.log("Token verification failed:", err);
    res.status(403).json({ success: false, error: "Invalid token" });
  }
};

module.exports = authMiddleware;
