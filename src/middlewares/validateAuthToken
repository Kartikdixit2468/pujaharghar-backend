const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Remove "Bearer"

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user; // Attach user to request
    next(); // Proceed to actual route
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
