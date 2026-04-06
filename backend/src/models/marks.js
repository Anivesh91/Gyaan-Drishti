const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject:   { type: String, required: true, trim: true },
  examType:  { type: String, required: true },
  marks:     { type: Number, required: true },
  maxMarks:  { type: Number, default: 100 },
}, { timestamps: true });

// Unique per student+subject+examType
marksSchema.index({ studentId: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);