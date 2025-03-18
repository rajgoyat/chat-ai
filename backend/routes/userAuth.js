const jwt = require("jsonwebtoken");
const KEY = process.env.KEY;

if (!KEY) {
  throw new Error("KEY is not defined in environment variables");
}

const authenticatetoken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token received:", token ? "Yes" : "No"); // Avoid logging full token

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  jwt.verify(token, KEY, (err, user) => {
    if (err) {
      const errorMessage =
        err.name === "TokenExpiredError"
          ? "Token expired. Please sign in again."
          : "Invalid token. Please sign in again.";
      return res.status(403).json({ message: errorMessage });
    }
    req.user = user; // Attach user data to the request
    next();
  });
};

module.exports = { authenticatetoken };