const Notification = require("../models/Notification");
const User = require("../models/User");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    const unread = notifications.filter(n => !n.isRead).length;
    res.status(200).json({ success: true, count: notifications.length, unread, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.status(200).json({ success: true, message: "Marked as read." });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All marked as read." });
};

exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const query = { isActive: true };
    if (targetRole !== "all") query.role = targetRole;
    const users = await User.find(query).select("_id");
    await Notification.insertMany(users.map(u => ({
      userId: u._id, title, message, type: "announcement", isRead: false, createdById: req.user._id
    })));
    res.status(200).json({ success: true, message: `Sent to ${users.length} users!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendExamReminder = async (req, res) => {
  try {
    const { subject, examDate, message } = req.body;
    const students = await User.find({ role: "student", isActive: true }).select("_id");
    await Notification.insertMany(students.map(u => ({
      userId: u._id,
      title: `Exam Reminder: ${subject}`,
      message: message || `Your ${subject} exam is on ${examDate}. Be prepared!`,
      type: "exam", isRead: false, createdById: req.user._id
    })));
    res.status(200).json({ success: true, message: `Reminder sent to ${students.length} students!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteNotification = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Deleted." });
};