const db = require("../db");
const XLSX = require("xlsx");

// ─── MARK ATTENDANCE (manual) ────────────────────────────────────────────────
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

// ─── EXCEL TEMPLATE DOWNLOAD ────────────────────────────────────────────────
exports.downloadAttendanceTemplate = (req, res) => {
  try {
    const students = db.findAll("users", { role: "student", isActive: true });

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
exports.uploadExcelAttendance = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    const { subject, date } = req.body;
    if (!subject || !date) return res.status(400).json({ success: false, message: "Subject and date are required." });

    // Parse Excel
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    if (rows.length < 2) return res.status(400).json({ success: false, message: "Excel file is empty or has no data rows." });

    // Detect columns
    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const rollIdx = header.findIndex(h => h.includes("roll"));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const statusIdx = header.findIndex(h => h.includes("status"));

    if (statusIdx === -1) return res.status(400).json({ success: false, message: "Could not find 'Status' column. Make sure header says 'Status'." });

    const allStudents = db.findAll("users", { role: "student", isActive: true });
    const validStatuses = ["present", "absent"];

    const saved = [];
    const skipped = [];
    const notFound = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rollVal = rollIdx !== -1 ? String(row[rollIdx] || "").trim() : "";
      const nameVal = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
      const statusRaw = String(row[statusIdx] || "").trim().toLowerCase();

      if (!rollVal && !nameVal) continue;

      // Validate status
      if (!statusRaw) {
        skipped.push({ roll: rollVal, name: nameVal, reason: "Status cell is empty" });
        continue;
      }
      if (!validStatuses.includes(statusRaw)) {
        skipped.push({ roll: rollVal, name: nameVal, reason: `Invalid status "${statusRaw}" — use present or absent` });
        continue;
      }

      // Match student
      let student = null;
      if (rollVal) student = allStudents.find(s => s.rollNumber && s.rollNumber.toLowerCase() === rollVal.toLowerCase());
      if (!student && nameVal) student = allStudents.find(s => s.name.toLowerCase() === nameVal.toLowerCase());

      if (!student) {
        notFound.push({ roll: rollVal, name: nameVal, reason: "No matching student found" });
        continue;
      }

      // Save attendance
      db.findOneAndUpdate("attendance",
        { studentId: student._id, subject, date },
        { studentId: student._id, teacherId: req.user._id, subject, date, status: statusRaw },
        { upsert: true }
      );

      // 75% alert check
      const total = db.findAll("attendance", { studentId: student._id, subject }).length;
      const present = db.findAll("attendance", { studentId: student._id, subject, status: "present" }).length;
      const pct = total > 0 ? (present / total) * 100 : 100;
      if (pct < 75) {
        db.create("notifications", {
          userId: student._id, title: "Low Attendance Alert ⚠️",
          message: `Your attendance in ${subject} is ${pct.toFixed(1)}%. Minimum required is 75%.`,
          type: "attendance", isRead: false, createdById: req.user._id
        });
      }

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
exports.getStudents = (req, res) => {
  const students = db.findAll("users", { role: "student", isActive: true }).map(u => ({ _id: u._id, name: u.name, email: u.email, rollNumber: u.rollNumber }));
  res.status(200).json({ success: true, students });
};

// ─── GET ATTENDANCE (TEACHER) ─────────────────────────────────────────────────
exports.getAttendanceTeacher = (req, res) => {
  try {
    const { subject, date } = req.query;
    let records = db.findAll("attendance", { teacherId: req.user._id });
    if (subject) records = records.filter(r => r.subject === subject);
    if (date) records = records.filter(r => r.date === date);
    records = records.map(r => {
      const student = db.findById("users", r.studentId);
      return { ...r, student: student ? { name: student.name, rollNumber: student.rollNumber, email: student.email } : null };
    }).sort((a, b) => b.date.localeCompare(a.date));
    res.status(200).json({ success: true, count: records.length, attendance: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── GET MY ATTENDANCE (STUDENT) ──────────────────────────────────────────────
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

// ─── UPDATE / DELETE ──────────────────────────────────────────────────────────
exports.updateAttendance = (req, res) => {
  const att = db.updateById("attendance", req.params.id, { status: req.body.status });
  if (!att) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Updated!", att });
};

exports.deleteAttendance = (req, res) => {
  db.deleteById("attendance", req.params.id);
  res.status(200).json({ success: true, message: "Deleted!" });
};