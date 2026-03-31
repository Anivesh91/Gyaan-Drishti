const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notification = require("../models/Notification");

const safe = (u) => { const obj = u.toObject(); delete obj.password; return obj; };

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: "i" };
    const users = await User.find(query).select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false, isActive: true }).select("-password");
    res.status(200).json({ success: true, count: pending.length, users: pending });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    await Notification.create({
      userId: user._id,
      title: "✅ Account Approved!",
      message: "Your registration has been approved by the admin. You can now login.",
      type: "approval",
      isRead: false,
      createdById: req.user._id
    });
    res.status(200).json({ success: true, message: `${user.name}'s account has been approved!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, message: `${user.name}'s registration has been rejected.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, user });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, subject, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Fill all required fields." });
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "Email already exists." });

    if (role === "student" && rollNumber && rollNumber.trim()) {
      if (await User.findOne({ rollNumber: rollNumber.trim() }))
        return res.status(400).json({ success: false, message: "Roll number already exists." });
    }
    if (phone && phone.trim()) {
      if (await User.findOne({ phone: phone.trim() }))
        return res.status(400).json({ success: false, message: "Phone number already registered." });
    }
    if (role === "admin") {
      if (await User.findOne({ role: "admin" }))
        return res.status(400).json({ success: false, message: "An admin already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, rollNumber: rollNumber || "", subject: subject || "", phone: phone || "", isActive: true, isApproved: true });
    res.status(201).json({ success: true, message: "User created!", user: safe(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, message: "User updated!", user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.status(200).json({ success: true, message: "User deactivated." });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, subject, rollNumber } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, subject, rollNumber }, { new: true }).select("-password");
  res.status(200).json({ success: true, message: "Profile updated!", user });
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select("-password");
    res.status(200).json({ success: true, message: "Profile picture updated!", user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Current password is wrong." });
    const hashed = await bcrypt.hash(req.body.newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).json({ success: true, message: "Password changed!" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};