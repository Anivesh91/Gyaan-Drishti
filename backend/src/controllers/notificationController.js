const db = require("../db");

exports.getMyNotifications = (req, res) => {
  try {
    let notifications = db.findAll("notifications", { userId: req.user._id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
    const unread = notifications.filter(n => !n.isRead).length;
    res.status(200).json({ success: true, count: notifications.length, unread, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = (req, res) => {
  db.updateById("notifications", req.params.id, { isRead: true });
  res.status(200).json({ success: true, message: "Marked as read." });
};

exports.markAllRead = (req, res) => {
  const notifs = db.findAll("notifications", { userId: req.user._id, isRead: false });
  notifs.forEach(n => db.updateById("notifications", n._id, { isRead: true }));
  res.status(200).json({ success: true, message: "All marked as read." });
};

exports.sendAnnouncement = (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    let users = db.findAll("users", { isActive: true });
    if (targetRole !== "all") users = users.filter(u => u.role === targetRole);
    users.forEach(u => db.create("notifications", { userId: u._id, title, message, type: "announcement", isRead: false, createdById: req.user._id }));
    res.status(200).json({ success: true, message: `Sent to ${users.length} users!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendExamReminder = (req, res) => {
  try {
    const { subject, examDate, message } = req.body;
    const students = db.findAll("users", { role: "student", isActive: true });
    students.forEach(u => db.create("notifications", {
      userId: u._id,
      title: `Exam Reminder: ${subject}`,
      message: message || `Your ${subject} exam is on ${examDate}. Be prepared!`,
      type: "exam", isRead: false, createdById: req.user._id
    }));
    res.status(200).json({ success: true, message: `Reminder sent to ${students.length} students!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteNotification = (req, res) => {
  db.deleteById("notifications", req.params.id);
  res.status(200).json({ success: true, message: "Deleted." });
};
