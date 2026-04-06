const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true },
  role:             { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  rollNumber:       { type: String, default: "", trim: true },
  subject:          { type: String, default: "", trim: true },
  phone:            { type: String, default: "", trim: true },
  avatar:           { type: String, default: "" },
  isActive:         { type: Boolean, default: true },
  isApproved:       { type: Boolean, default: false },
  lastLogin:        { type: Date, default: null },
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);