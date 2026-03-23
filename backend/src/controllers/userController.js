const bcrypt = require("bcryptjs");
const db = require("../db");
const safe = (u) => { if (!u) return null; const { password, ...r } = u; return r; };

exports.getAllUsers = (req, res) => {
  try {
    let users = db.findAll("users");
    const { role, search } = req.query;
    if (role) users = users.filter(u => u.role === role);
    if (search) users = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()));
    res.status(200).json({ success: true, count: users.length, users: users.map(safe) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get all pending approval users
exports.getPendingUsers = (req, res) => {
  try {
    const pending = db.findAll("users").filter(u => u.isApproved === false && u.isActive);
    res.status(200).json({ success: true, count: pending.length, users: pending.map(safe) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Approve a user
exports.approveUser = (req, res) => {
  try {
    const user = db.findById("users", req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    db.updateById("users", user._id, { isApproved: true });

    // Notify the user that they've been approved
    db.create("notifications", {
      userId: user._id,
      title: "✅ Account Approved!",
      message: "Your registration has been approved by the admin. You can now login to your account.",
      type: "approval",
      isRead: false,
      createdById: req.user._id
    });

    res.status(200).json({ success: true, message: `${user.name}'s account has been approved!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Reject a user (delete their account)
exports.rejectUser = (req, res) => {
  try {
    const user = db.findById("users", req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    db.deleteById("users", user._id);
    res.status(200).json({ success: true, message: `${user.name}'s registration has been rejected and removed.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUser = (req, res) => {
  const user = db.findById("users", req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, user: safe(user) });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, subject, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Fill all required fields." });
    if (db.findOne("users", { email })) return res.status(400).json({ success: false, message: "Email already exists." });

    // Roll number duplicate check — only for students
    if (role === "student" && rollNumber && rollNumber.trim() !== "") {
      if (db.findAll("users").some(u => u.rollNumber && u.rollNumber.trim() === rollNumber.trim()))
        return res.status(400).json({ success: false, message: "Roll number already exists." });
    }

    // Phone duplicate check — for everyone (only if phone provided)
    if (phone && phone.trim() !== "") {
      if (db.findAll("users").some(u => u.phone && u.phone.trim() === phone.trim()))
        return res.status(400).json({ success: false, message: "Phone number already registered with another account." });
    }

    // Only one admin allowed
    if (role === "admin") {
      const existingAdmin = db.findOne("users", { role: "admin" });
      if (existingAdmin) return res.status(400).json({ success: false, message: "An admin already exists. Only one admin is allowed in the system." });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Users created by admin are auto-approved
    const user = db.create("users", { name, email, password: hashed, role, rollNumber: rollNumber || "", subject: subject || "", phone: phone || "", isActive: true, isApproved: true });
    res.status(201).json({ success: true, message: "User created!", user: safe(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUser = (req, res) => {
  const user = db.updateById("users", req.params.id, req.body);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, message: "User updated!", user: safe(user) });
};

exports.deleteUser = (req, res) => {
  const user = db.updateById("users", req.params.id, { isActive: false });
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, message: "User deactivated." });
};

exports.updateProfile = (req, res) => {
  const { name, phone, subject, rollNumber } = req.body;
  const user = db.updateById("users", req.user._id, { name, phone, subject, rollNumber });
  res.status(200).json({ success: true, message: "Profile updated!", user: safe(user) });
};

exports.uploadAvatar = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Koi file upload nahi hui." });
    // Build the public URL path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = db.updateById("users", req.user._id, { avatar: avatarUrl });
    res.status(200).json({ success: true, message: "Profile picture updated!", user: safe(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const user = db.findById("users", req.user._id);
    const match = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Current password is wrong." });
    const hashed = await bcrypt.hash(req.body.newPassword, 10);
    db.updateById("users", user._id, { password: hashed });
    res.status(200).json({ success: true, message: "Password changed!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};