// Placeholder authentication middleware
const jwt = require('jsonwebtoken');
const { pool } = require('../utils/db');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden (invalid token)
    }
    req.user = user; // Attach user information to the request
    next();
  });
};

module.exports = authMiddleware;
