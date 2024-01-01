const jwt = require("jsonwebtoken");

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization.split(" ");

  if (authHeader[0] !== "Bearer" || authHeader.length !== 2) {
    return res.status(401).json({ message: "Malformed token" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      authHeader[1],
      "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A="
    );
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Check if the user is an admin
  if (decodedToken.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: not an admin" });
  }

  req.user = decodedToken;
  next();
}

module.exports = adminAuthMiddleware;
