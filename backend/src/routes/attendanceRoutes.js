// attendanceRoutes.js
const express = require("express");
const r1 = express.Router();
const ac = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");
r1.post("/mark", protect, authorize("teacher"), ac.markAttendance);
r1.get("/students", protect, authorize("teacher"), ac.getStudents);
r1.get("/teacher", protect, authorize("teacher"), ac.getAttendanceTeacher);
r1.get("/my", protect, authorize("student"), ac.getMyAttendance);
r1.put("/:id", protect, authorize("teacher"), ac.updateAttendance);
r1.delete("/:id", protect, authorize("teacher"), ac.deleteAttendance);
module.exports = r1;
