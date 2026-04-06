const Marks = require("../models/Marks");
const User = require("../models/User");
const Notification = require("../models/Notification");
const XLSX = require("xlsx");

exports.bulkEnterMarks = async (req, res) => {
  try {
    const { records, subject, examType, maxMarks } = req.body;
    const max = maxMarks || 100;
    const results = [];
    for (const rec of records) {
      if (rec.marks === "" || rec.marks === undefined) continue;
      const entry = await Marks.findOneAndUpdate(
        { studentId: rec.studentId, subject, examType },
        { studentId: rec.studentId, teacherId: req.user._id, subject, examType, marks: Number(rec.marks), maxMarks: max },
        { upsert: true, new: true }
      );
      results.push(entry);
      await Notification.create({
        userId: rec.studentId,
        title: "Marks Updated 📝",
        message: `${examType} marks for ${subject}: ${rec.marks}/${max}`,
        type: "marks", isRead: false, createdById: req.user._id
      });
    }
    res.status(200).json({ success: true, message: `Marks saved for ${results.length} students!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL TEMPLATE DOWNLOAD ────────────────────────────────────────────────
exports.downloadExcelTemplate = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true }).select("name rollNumber");
    const rows = [["Roll Number", "Student Name", "Marks"]];
    students.forEach(s => rows.push([s.rollNumber || "", s.name, ""]));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, "Marks");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=marks_template.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL UPLOAD & PARSE ────────────────────────────────────────────────────
exports.uploadExcelMarks = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const { subject, examType, maxMarks } = req.body;
    if (!subject || !examType) return res.status(400).json({ success: false, message: "Subject and exam type are required." });
    const max = Number(maxMarks) || 100;

    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (rows.length < 2) return res.status(400).json({ success: false, message: "Excel file is empty." });

    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const rollIdx = header.findIndex(h => h.includes("roll"));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const marksIdx = header.findIndex(h => h.includes("mark"));
    if (marksIdx === -1) return res.status(400).json({ success: false, message: "Could not find 'Marks' column." });

    const allStudents = await User.find({ role: "student", isActive: true });
    const saved = [], skipped = [], notFound = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rollVal = rollIdx !== -1 ? String(row[rollIdx] || "").trim() : "";
      const nameVal = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
      const marksVal = row[marksIdx];

      if (!rollVal && !nameVal) continue;
      if (marksVal === "" || marksVal === null || marksVal === undefined) { skipped.push({ roll: rollVal, name: nameVal, reason: "Marks cell is empty" }); continue; }
      const marksNum = Number(marksVal);
      if (isNaN(marksNum)) { skipped.push({ roll: rollVal, name: nameVal, reason: `Invalid marks: "${marksVal}"` }); continue; }
      if (marksNum < 0 || marksNum > max) { skipped.push({ roll: rollVal, name: nameVal, reason: `Out of range (0–${max})` }); continue; }

      let student = null;
      if (rollVal) student = allStudents.find(s => s.rollNumber && s.rollNumber.toLowerCase() === rollVal.toLowerCase());
      if (!student && nameVal) student = allStudents.find(s => s.name.toLowerCase() === nameVal.toLowerCase());
      if (!student) { notFound.push({ roll: rollVal, name: nameVal, reason: "No matching student" }); continue; }

      await Marks.findOneAndUpdate(
        { studentId: student._id, subject, examType },
        { studentId: student._id, teacherId: req.user._id, subject, examType, marks: marksNum, maxMarks: max },
        { upsert: true, new: true }
      );
      await Notification.create({
        userId: student._id,
        title: "Marks Updated 📝",
        message: `${examType} marks for ${subject}: ${marksNum}/${max}`,
        type: "marks", isRead: false, createdById: req.user._id
      });
      saved.push({ name: student.name, roll: student.rollNumber, marks: marksNum });
    }

    res.status(200).json({
      success: true,
      message: `✅ Done! ${saved.length} saved, ${skipped.length} skipped, ${notFound.length} not found.`,
      summary: { saved: saved.length, skipped: skipped.length, notFound: notFound.length },
      details: { saved, skipped, notFound }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateMarks = async (req, res) => {
  const entry = await Marks.findByIdAndUpdate(req.params.id, { marks: Number(req.body.marks) }, { new: true });
  if (!entry) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Updated!", entry });
};

exports.getMarksTeacher = async (req, res) => {
  try {
    const { subject, examType } = req.query;
    const query = { teacherId: req.user._id };
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    const marks = await Marks.find(query).populate("studentId", "name rollNumber");
    const formatted = marks.map(m => ({ ...m.toObject(), student: m.studentId }));
    res.status(200).json({ success: true, marks: formatted });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getClassSummary = async (req, res) => {
  try {
    const { subject, examType } = req.query;
    const query = { teacherId: req.user._id };
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    const marks = await Marks.find(query);
    const total = marks.length;
    const avg = total > 0 ? parseFloat((marks.reduce((a, b) => a + b.marks, 0) / total).toFixed(1)) : 0;
    const highest = total > 0 ? Math.max(...marks.map(m => m.marks)) : 0;
    const lowest = total > 0 ? Math.min(...marks.map(m => m.marks)) : 0;
    res.status(200).json({ success: true, summary: { total, avg, highest, lowest }, marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyMarks = async (req, res) => {
  try {
    const records = await Marks.find({ studentId: req.user._id });
    const subjects = [...new Set(records.map(r => r.subject))];
    const summary = subjects.map(sub => {
      const subRecs = records.filter(r => r.subject === sub);
      const total = subRecs.reduce((a, b) => a + b.marks, 0);
      const maxTotal = subRecs.reduce((a, b) => a + b.maxMarks, 0);
      const percentage = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : 0;
      const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F";
      return { subject: sub, records: subRecs, total, maxTotal, percentage, grade };
    });
    const allTotal = records.reduce((a, b) => a + b.marks, 0);
    const allMax = records.reduce((a, b) => a + b.maxMarks, 0);
    const overallPct = allMax > 0 ? parseFloat(((allTotal / allMax) * 100).toFixed(1)) : 0;
    const overall = { total: allTotal, maxTotal: allMax, percentage: overallPct, grade: overallPct >= 90 ? "A+" : overallPct >= 80 ? "A" : overallPct >= 70 ? "B" : overallPct >= 60 ? "C" : overallPct >= 50 ? "D" : "F" };
    res.status(200).json({ success: true, summary, overall, records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};