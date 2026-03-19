const db = require("../db");

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
