const express = require("express");
const multer = require("multer");
const r1 = express.Router();
const ac = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only .xlsx and .xls files allowed!"));
  }
});

r1.post("/mark", protect, authorize("teacher"), ac.markAttendance);
r1.get("/template", protect, authorize("teacher"), ac.downloadAttendanceTemplate);
r1.post("/upload-excel", protect, authorize("teacher"), upload.single("file"), ac.uploadExcelAttendance);
r1.get("/students", protect, authorize("teacher"), ac.getStudents);
r1.get("/teacher", protect, authorize("teacher"), ac.getAttendanceTeacher);
r1.get("/my", protect, authorize("student"), ac.getMyAttendance);
r1.put("/:id", protect, authorize("teacher"), ac.updateAttendance);
r1.delete("/:id", protect, authorize("teacher"), ac.deleteAttendance);

module.exports = r1;