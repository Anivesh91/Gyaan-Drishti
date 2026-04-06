const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { readSettings } = require("./settingsController");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
const safeUser = (u) => { const obj = u.toObject(); delete obj.password; return obj; };

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, subject, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Fill all required fields." });

    // Admin: only if no admin exists yet
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) return res.status(403).json({ success: false, message: "An admin already exists. Only one admin is allowed." });
    }

    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "Email already registered." });

    // Roll number duplicate — students only
    if (role === "student" && rollNumber && rollNumber.trim()) {
      const exists = await User.findOne({ rollNumber: rollNumber.trim() });
      if (exists) return res.status(400).json({ success: false, message: "Roll number already registered." });
    }

    // Phone duplicate
    if (phone && phone.trim()) {
      const exists = await User.findOne({ phone: phone.trim() });
      if (exists) return res.status(400).json({ success: false, message: "Phone number already registered with another account." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = ["student", "teacher", "admin"].includes(role) ? role : "student";
    const settings = readSettings();
    const isApproved = assignedRole === "admin" ? true : !settings.requireApproval;

    const user = await User.create({
      name, email, password: hashed, role: assignedRole,
      rollNumber: rollNumber || "", subject: subject || "", phone: phone || "",
      isActive: true, isApproved
    });

    if (!isApproved) {
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        await Notification.create({
          userId: admin._id,
          title: "🆕 New Registration Request",
          message: `${name} (${assignedRole}) has registered and is waiting for your approval.`,
          type: "approval",
          isRead: false,
          createdById: user._id,
          relatedUserId: user._id
        });
      }
      return res.status(201).json({ success: true, pending: true, message: "Registration successful! Your account is pending admin approval. ⏳" });
    }

    const msg = assignedRole === "admin" ? "Admin registered successfully!" : "Registered successfully! You can now login.";
    res.status(201).json({ success: true, pending: false, message: msg, token: generateToken(user._id), user: safeUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.checkAdminExists = async (req, res) => {
  const adminExists = !!(await User.findOne({ role: "admin" }));
  res.status(200).json({ success: true, adminExists });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Enter email and password." });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive) return res.status(401).json({ success: false, message: "Account deactivated. Contact admin." });
    if (user.role !== "admin" && user.isApproved === false) {
      return res.status(403).json({ success: false, pending: true, message: "Your account is pending admin approval. ⏳" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password." });
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    res.status(200).json({ success: true, message: "Login successful!", token: generateToken(user._id), user: safeUser(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.logout = (req, res) => res.status(200).json({ success: true, message: "Logged out!" });

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json({ success: true, user });
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: "No account with this email." });
    const token = crypto.randomBytes(32).toString("hex");
    await User.findByIdAndUpdate(user._id, { resetToken: token, resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) });
    res.status(200).json({ success: true, message: "Reset token generated!", resetToken: token });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.params.token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, message: "Token invalid or expired." });
    const hashed = await bcrypt.hash(req.body.password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed, resetToken: null, resetTokenExpiry: null });
    res.status(200).json({ success: true, message: "Password reset successful!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};