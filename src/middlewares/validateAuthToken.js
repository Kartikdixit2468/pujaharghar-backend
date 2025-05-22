const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Remove "Bearer"

  if (!token) return res.status(401).json({ success: false, error: "Token missing" });

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user; // Attach user to request
    next(); // Proceed to actual route
  } catch (err) {
    res.status(403).json({ success: false, error: "Invalid token" });
  }
};

module.exports = authMiddleware;
