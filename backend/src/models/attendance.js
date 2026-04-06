const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject:    { type: String, required: true, trim: true },
  date:       { type: String, required: true }, // "YYYY-MM-DD" string
  status:     { type: String, enum: ["present", "absent"], required: true },
}, { timestamps: true });

// Unique per student+subject+date combo
attendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);