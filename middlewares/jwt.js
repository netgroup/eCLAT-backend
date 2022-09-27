const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
  return next();
};

module.exports = authenticate;
