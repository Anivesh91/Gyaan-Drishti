const express = require("express");
const r = express.Router();
const c = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");

r.get("/", c.getSettings);                              // public — register page needs this
r.put("/", protect, authorize("admin"), c.updateSettings); // admin only

module.exports = r;