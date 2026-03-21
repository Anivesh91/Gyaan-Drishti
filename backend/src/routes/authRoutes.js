// authRoutes.js
const express = require("express");
const r = express.Router();
const c = require("../controllers/authController");
const { protect } = require("../middleware/auth");
r.post("/register", c.register);
r.post("/login", c.login);
r.post("/forgot-password", c.forgotPassword);
r.post("/reset-password/:token", c.resetPassword);
r.post("/logout", protect, c.logout);
r.get("/me", protect, c.getMe);
r.get("/check-admin", c.checkAdminExists); // public - no auth needed
module.exports = r;