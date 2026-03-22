const express = require("express");
const multer = require("multer");
const r = express.Router();
const c = require("../controllers/marksController");
const { protect, authorize } = require("../middleware/auth");

// Multer — memory storage (no disk write needed, we parse from buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx and .xls files are allowed!"));
    }
  }
});

r.post("/bulk", protect, authorize("teacher"), c.bulkEnterMarks);
r.get("/template", protect, authorize("teacher"), c.downloadExcelTemplate);
r.post("/upload-excel", protect, authorize("teacher"), upload.single("file"), c.uploadExcelMarks);
r.get("/teacher", protect, authorize("teacher"), c.getMarksTeacher);
r.get("/summary", protect, authorize("teacher"), c.getClassSummary);
r.get("/my", protect, authorize("student"), c.getMyMarks);
r.put("/:id", protect, authorize("teacher"), c.updateMarks);

module.exports = r;