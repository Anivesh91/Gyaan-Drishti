const jwt = require("jsonwebtoken");
const db = require("../db");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ success: false, message: "Not authorized. Please login." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.findById("users", decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found." });
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied! Only ${roles.join(", ")} allowed.` });
  }
  next();
};

module.exports = { protect, authorize };
