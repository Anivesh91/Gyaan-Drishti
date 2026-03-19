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

exports.getUser = (req, res) => {
  const user = db.findById("users", req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, user: safe(user) });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, subject, phone } = req.body;
    if (db.findOne("users", { email })) return res.status(400).json({ success: false, message: "Email already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const user = db.create("users", { name, email, password: hashed, role, rollNumber: rollNumber || "", subject: subject || "", phone: phone || "", isActive: true });
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
