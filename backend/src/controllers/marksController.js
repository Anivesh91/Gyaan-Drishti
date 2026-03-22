const db = require("../db");
const XLSX = require("xlsx");

exports.bulkEnterMarks = (req, res) => {
  try {
    const { records, subject, examType, maxMarks } = req.body;
    const results = [];
    for (const rec of records) {
      if (rec.marks === "" || rec.marks === undefined) continue;
      const entry = db.findOneAndUpdate("marks",
        { studentId: rec.studentId, subject, examType },
        { studentId: rec.studentId, teacherId: req.user._id, subject, examType, marks: Number(rec.marks), maxMarks: maxMarks || 100 },
        { upsert: true }
      );
      results.push(entry);
      db.create("notifications", {
        userId: rec.studentId, title: "Marks Updated 📝",
        message: `${examType} marks for ${subject}: ${rec.marks}/${maxMarks || 100}`,
        type: "marks", isRead: false, createdById: req.user._id
      });
    }
    res.status(200).json({ success: true, message: `Marks saved for ${results.length} students!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL TEMPLATE DOWNLOAD ────────────────────────────────────────────────
exports.downloadExcelTemplate = (req, res) => {
  try {
    const students = db.findAll("users", { role: "student", isActive: true });

    // Build rows: header + one row per student
    const rows = [
      ["Roll Number", "Student Name", "Marks"]
    ];
    students.forEach(s => {
      rows.push([s.rollNumber || "", s.name, ""]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(wb, ws, "Marks");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=marks_template.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── EXCEL UPLOAD & PARSE ────────────────────────────────────────────────────
exports.uploadExcelMarks = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    const { subject, examType, maxMarks } = req.body;
    if (!subject || !examType) return res.status(400).json({ success: false, message: "Subject and exam type are required." });

    const max = Number(maxMarks) || 100;

    // Parse Excel from buffer
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    if (rows.length < 2) return res.status(400).json({ success: false, message: "Excel file is empty or has no data rows." });

    // Detect header row — find which columns are Roll Number, Name, Marks
    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const rollIdx = header.findIndex(h => h.includes("roll"));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const marksIdx = header.findIndex(h => h.includes("mark"));

    if (marksIdx === -1) return res.status(400).json({ success: false, message: "Could not find 'Marks' column in Excel. Make sure your header says 'Marks'." });

    const allStudents = db.findAll("users", { role: "student", isActive: true });

    const saved = [];
    const skipped = [];
    const notFound = [];

    // Process each data row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rollVal = rollIdx !== -1 ? String(row[rollIdx] || "").trim() : "";
      const nameVal = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
      const marksVal = row[marksIdx];

      // Skip completely empty rows
      if (!rollVal && !nameVal) continue;

      // Validate marks value
      if (marksVal === "" || marksVal === null || marksVal === undefined) {
        skipped.push({ roll: rollVal, name: nameVal, reason: "Marks cell is empty" });
        continue;
      }
      const marksNum = Number(marksVal);
      if (isNaN(marksNum)) {
        skipped.push({ roll: rollVal, name: nameVal, reason: `Invalid marks value: "${marksVal}"` });
        continue;
      }
      if (marksNum < 0 || marksNum > max) {
        skipped.push({ roll: rollVal, name: nameVal, reason: `Marks ${marksNum} out of range (0–${max})` });
        continue;
      }

      // Match student — roll number first, then name
      let student = null;
      if (rollVal) {
        student = allStudents.find(s => s.rollNumber && s.rollNumber.toLowerCase() === rollVal.toLowerCase());
      }
      if (!student && nameVal) {
        student = allStudents.find(s => s.name.toLowerCase() === nameVal.toLowerCase());
      }

      if (!student) {
        notFound.push({ roll: rollVal, name: nameVal, reason: "No matching student found" });
        continue;
      }

      // Save marks
      db.findOneAndUpdate("marks",
        { studentId: student._id, subject, examType },
        { studentId: student._id, teacherId: req.user._id, subject, examType, marks: marksNum, maxMarks: max },
        { upsert: true }
      );

      // Notify student
      db.create("notifications", {
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

exports.updateMarks = (req, res) => {
  const entry = db.updateById("marks", req.params.id, { marks: Number(req.body.marks) });
  if (!entry) return res.status(404).json({ success: false, message: "Record not found." });
  res.status(200).json({ success: true, message: "Updated!", entry });
};

exports.getMarksTeacher = (req, res) => {
  try {
    const { subject, examType } = req.query;
    let marks = db.findAll("marks", { teacherId: req.user._id });
    if (subject) marks = marks.filter(m => m.subject === subject);
    if (examType) marks = marks.filter(m => m.examType === examType);
    marks = marks.map(m => {
      const student = db.findById("users", m.studentId);
      return { ...m, student: student ? { name: student.name, rollNumber: student.rollNumber } : null };
    });
    res.status(200).json({ success: true, marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getClassSummary = (req, res) => {
  try {
    const { subject, examType } = req.query;
    let marks = db.findAll("marks", { teacherId: req.user._id });
    if (subject) marks = marks.filter(m => m.subject === subject);
    if (examType) marks = marks.filter(m => m.examType === examType);
    const total = marks.length;
    const avg = total > 0 ? parseFloat((marks.reduce((a, b) => a + b.marks, 0) / total).toFixed(1)) : 0;
    const highest = total > 0 ? Math.max(...marks.map(m => m.marks)) : 0;
    const lowest = total > 0 ? Math.min(...marks.map(m => m.marks)) : 0;
    res.status(200).json({ success: true, summary: { total, avg, highest, lowest }, marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyMarks = (req, res) => {
  try {
    const records = db.findAll("marks", { studentId: req.user._id });
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