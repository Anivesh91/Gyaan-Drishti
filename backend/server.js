const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

// Ensure data directory exists (FIXED: was "src/data", now correctly "data")
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files (profile pictures) as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/attendance", require("./src/routes/attendanceRoutes"));
app.use("/api/marks", require("./src/routes/marksRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/settings", require("./src/routes/settingsRoutes"));

app.get("/", (req, res) => res.json({ success: true, message: "GYAAN DRISHTI API Running! 🚀 (No MongoDB needed!)" }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started at : http://localhost:${PORT}`);
  
});