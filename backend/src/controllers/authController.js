const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const safeUser = (u) => { const { password, ...rest } = u; return rest; };

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, subject, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Fill all required fields." });

    // Admin registration only allowed if NO admin exists yet (first-time setup)
    if (role === "admin") {
      const existingAdmin = db.findOne("users", { role: "admin" });
      if (existingAdmin) return res.status(403).json({ success: false, message: "An admin already exists. Only one admin is allowed in the system." });
    }

    if (db.findOne("users", { email })) return res.status(400).json({ success: false, message: "Email already registered." });
    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = ["student", "teacher", "admin"].includes(role) ? role : "student";
    const user = db.create("users", { name, email, password: hashed, role: assignedRole, rollNumber: rollNumber || "", subject: subject || "", phone: phone || "", isActive: true, lastLogin: null, resetToken: null, resetTokenExpiry: null });
    res.status(201).json({ success: true, message: "Registered successfully!", token: generateToken(user._id), user: safeUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Public endpoint — lets frontend know if admin slot is taken
exports.checkAdminExists = (req, res) => {
  const adminExists = !!db.findOne("users", { role: "admin" });
  res.status(200).json({ success: true, adminExists });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Enter email and password." });
    const user = db.findOne("users", { email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive) return res.status(401).json({ success: false, message: "Account deactivated. Contact admin." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password." });
    db.updateById("users", user._id, { lastLogin: new Date().toISOString() });
    res.status(200).json({ success: true, message: "Login successful!", token: generateToken(user._id), user: safeUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.logout = (req, res) => res.status(200).json({ success: true, message: "Logged out!" });

exports.getMe = (req, res) => {
  const user = db.findById("users", req.user._id);
  res.status(200).json({ success: true, user: safeUser(user) });
};

exports.forgotPassword = (req, res) => {
  try {
    const user = db.findOne("users", { email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: "No account with this email." });
    const token = crypto.randomBytes(32).toString("hex");
    db.updateById("users", user._id, { resetToken: token, resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
    res.status(200).json({ success: true, message: "Reset token generated!", resetToken: token });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const users = db.findAll("users", { resetToken: req.params.token });
    const user = users.find(u => u.resetTokenExpiry && new Date(u.resetTokenExpiry) > new Date());
    if (!user) return res.status(400).json({ success: false, message: "Token invalid or expired." });
    const hashed = await bcrypt.hash(req.body.password, 10);
    db.updateById("users", user._id, { password: hashed, resetToken: null, resetTokenExpiry: null });
    res.status(200).json({ success: true, message: "Password reset successful!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};