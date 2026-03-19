const db = require("../db");

exports.markAttendance = (req, res) => {
  try {
    const { records, subject, date } = req.body;
    const results = [];
    for (const rec of records) {
      const att = db.findOneAndUpdate("attendance",
        { studentId: rec.studentId, subject, date },
        { studentId: rec.studentId, teacherId: req.user._id, subject, date, status: rec.status },
        { upsert: true }
      );
      results.push(att);
      // 75% alert
      const total = db.findAll("attendance", { studentId: rec.studentId, subject }).length;
      const present = db.findAll("attendance", { studentId: rec.studentId, subject, status: "present" }).length;
      const pct = total > 0 ? (present / total) * 100 : 100;
      if (pct < 75) {
        db.create("notifications", {
          userId: rec.studentId, title: "Low Attendance Alert ⚠️",
          message: `Your attendance in ${subject} is ${pct.toFixed(1)}%. Minimum required is 75%.`,
          type: "attendance", isRead: false, createdById: req.user._id
        });
      }
    }
    res.status(200).json({ success: true, message: "Attendance marked!", data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getStudents = (req, res) => {
  const students = db.findAll("users", { role: "student", isActive: true }).map(u => ({ _id: u._id, name: u.name, email: u.email, rollNumber: u.rollNumber }));
  res.status(200).json({ success: true, students });
};

exports.getAttendanceTeacher = (req, res) => {
  try {
    const { subject, date } = req.query;
    let records = db.findAll("attendance", { teacherId: req.user._id });
    if (subject) records = records.filter(r => r.subject === subject);
    if (date) records = records.filter(r => r.date === date);
    // Populate student name
    records = records.map(r => {
      const student = db.findById("users", r.studentId);
      return { ...r, student: student ? { name: student.name, rollNumber: student.rollNumber, email: student.email } : null };
    }).sort((a, b) => b.date.localeCompare(a.date));
    res.status(200).json({ success: true, count: records.length, attendance: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyAttendance = (req, res) => {
  try {
    const records = db.findAll("attendance", { studentId: req.user._id });
    const subjects = [...new Set(records.map(r => r.subject))];
    const summary = subjects.map(sub => {
      const subRecs = records.filter(r => r.subject === sub);
      const total = subRecs.length;
      const present = subRecs.filter(r => r.status === "present").length;
      const absent = total - present;
      const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
      const needed = percentage < 75 ? Math.ceil((0.75 * total - present) / 0.25) : 0;
      return { subject: sub, total, present, absent, percentage, needed };
    });
    res.status(200).json({ success: true, summary, records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAttendance = (req, res) => {
  const att = db.updateById("attendance", req.params.id, { status: req.body.status });
  if (!att) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Updated!", att });
};

exports.deleteAttendance = (req, res) => {
  db.deleteById("attendance", req.params.id);
  res.status(200).json({ success: true, message: "Deleted!" });
};
