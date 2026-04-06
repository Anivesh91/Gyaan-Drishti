const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Notification = require("../models/Notification");
const XLSX = require("xlsx");

// ─── helper: check 75% and notify ────────────────────────────────────────────
const checkAndNotify = async (studentId, subject, teacherId) => {
  const total = await Attendance.countDocuments({ studentId, subject });
  const present = await Attendance.countDocuments({ studentId, subject, status: "present" });
  const pct = total > 0 ? (present / total) * 100 : 100;
  if (pct < 75) {
    await Notification.create({
      userId: studentId,
      title: "Low Attendance Alert ⚠️",
      message: `Your attendance in ${subject} is ${pct.toFixed(1)}%. Minimum required is 75%.`,
      type: "attendance",
      isRead: false,
      createdById: teacherId
    });
  }
};

// ─── MARK ATTENDANCE (manual) ────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  try {
    const { records, subject, date } = req.body;
    const results = [];
    for (const rec of records) {
      const att = await Attendance.findOneAndUpdate(
        { studentId: rec.studentId, subject, date },
        { studentId: rec.studentId, teacherId: req.user._id, subject, date, status: rec.status },
        { upsert: true, new: true }
      );
      results.push(att);
      await checkAndNotify(rec.studentId, subject, req.user._id);
    }
    res.status(200).json({ success: true, message: "Attendance marked!", data: results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL TEMPLATE DOWNLOAD ────────────────────────────────────────────────
exports.downloadAttendanceTemplate = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true }).select("name rollNumber");
    const rows = [["Roll Number", "Student Name", "Status (present/absent)"]];
    students.forEach(s => rows.push([s.rollNumber || "", s.name, "present"]));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=attendance_template.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL UPLOAD & PARSE ────────────────────────────────────────────────────
exports.uploadExcelAttendance = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const { subject, date } = req.body;
    if (!subject || !date) return res.status(400).json({ success: false, message: "Subject and date are required." });

    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (rows.length < 2) return res.status(400).json({ success: false, message: "Excel file is empty." });

    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const rollIdx = header.findIndex(h => h.includes("roll"));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const statusIdx = header.findIndex(h => h.includes("status"));
    if (statusIdx === -1) return res.status(400).json({ success: false, message: "Could not find 'Status' column." });

    const allStudents = await User.find({ role: "student", isActive: true });
    const validStatuses = ["present", "absent"];
    const saved = [], skipped = [], notFound = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rollVal = rollIdx !== -1 ? String(row[rollIdx] || "").trim() : "";
      const nameVal = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
      const statusRaw = String(row[statusIdx] || "").trim().toLowerCase();

      if (!rollVal && !nameVal) continue;
      if (!statusRaw) { skipped.push({ roll: rollVal, name: nameVal, reason: "Status cell is empty" }); continue; }
      if (!validStatuses.includes(statusRaw)) { skipped.push({ roll: rollVal, name: nameVal, reason: `Invalid status "${statusRaw}"` }); continue; }

      let student = null;
      if (rollVal) student = allStudents.find(s => s.rollNumber && s.rollNumber.toLowerCase() === rollVal.toLowerCase());
      if (!student && nameVal) student = allStudents.find(s => s.name.toLowerCase() === nameVal.toLowerCase());
      if (!student) { notFound.push({ roll: rollVal, name: nameVal, reason: "No matching student" }); continue; }

      await Attendance.findOneAndUpdate(
        { studentId: student._id, subject, date },
        { studentId: student._id, teacherId: req.user._id, subject, date, status: statusRaw },
        { upsert: true, new: true }
      );
      await checkAndNotify(student._id, subject, req.user._id);
      saved.push({ name: student.name, roll: student.rollNumber || "-", status: statusRaw });
    }

    res.status(200).json({
      success: true,
      message: `✅ Done! ${saved.length} saved, ${skipped.length} skipped, ${notFound.length} not found.`,
      summary: { saved: saved.length, skipped: skipped.length, notFound: notFound.length },
      details: { saved, skipped, notFound }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── GET STUDENTS ─────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  const students = await User.find({ role: "student", isActive: true }).select("name email rollNumber");
  res.status(200).json({ success: true, students });
};

// ─── GET ATTENDANCE (TEACHER) ─────────────────────────────────────────────────
exports.getAttendanceTeacher = async (req, res) => {
  try {
    const { subject, date } = req.query;
    const query = { teacherId: req.user._id };
    if (subject) query.subject = subject;
    if (date) query.date = date;
    const records = await Attendance.find(query)
      .populate("studentId", "name rollNumber email")
      .sort({ date: -1 });
    const formatted = records.map(r => ({ ...r.toObject(), student: r.studentId }));
    res.status(200).json({ success: true, count: formatted.length, attendance: formatted });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── GET MY ATTENDANCE (STUDENT) ──────────────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user._id });
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

// ─── UPDATE / DELETE ──────────────────────────────────────────────────────────
exports.updateAttendance = async (req, res) => {
  const att = await Attendance.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!att) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Updated!", att });
};

exports.deleteAttendance = async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Deleted!" });
};