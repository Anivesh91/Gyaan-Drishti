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

    // Admin: only allowed if no admin exists (first-time setup), and skip approval
    if (role === "admin") {
      const existingAdmin = db.findOne("users", { role: "admin" });
      if (existingAdmin) return res.status(403).json({ success: false, message: "An admin already exists. Only one admin is allowed in the system." });
    }

    if (db.findOne("users", { email })) return res.status(400).json({ success: false, message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = ["student", "teacher", "admin"].includes(role) ? role : "student";

    // Admin registers instantly approved, others need admin approval
    const isApproved = assignedRole === "admin";

    const user = db.create("users", {
      name, email, password: hashed, role: assignedRole,
      rollNumber: rollNumber || "", subject: subject || "", phone: phone || "",
      isActive: true, isApproved,
      lastLogin: null, resetToken: null, resetTokenExpiry: null
    });

    // Notify admin about new registration (only for non-admin registrations)
    if (!isApproved) {
      const admin = db.findOne("users", { role: "admin" });
      if (admin) {
        db.create("notifications", {
          userId: admin._id,
          title: "🆕 New Registration Request",
          message: `${name} (${assignedRole}) has registered and is waiting for your approval.`,
          type: "approval",
          isRead: false,
          createdById: user._id,
          relatedUserId: user._id
        });
      }
      return res.status(201).json({
        success: true,
        pending: true,
        message: "Registration successful! Your account is pending admin approval. You will be able to login once approved. ⏳"
      });
    }

    // Admin: return token directly
    res.status(201).json({ success: true, message: "Admin registered successfully!", token: generateToken(user._id), user: safeUser(user) });
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

    // Approval check — admin is always approved
    if (user.role !== "admin" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        pending: true,
        message: "Your account is pending admin approval. Please wait for the admin to approve your registration. ⏳"
      });
    }

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