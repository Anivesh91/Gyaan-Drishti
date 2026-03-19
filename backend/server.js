const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

// Ensure data directory exists
const dataDir = path.join(__dirname, "src/data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/attendance", require("./src/routes/attendanceRoutes"));
app.use("/api/marks", require("./src/routes/marksRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));

app.get("/", (req, res) => res.json({ success: true, message: "GYAAN DRISHTI API Running! 🚀 (No MongoDB needed!)" }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`💾 Database: JSON files (no MongoDB needed!)`);
  console.log(`📁 Data stored in: src/data/`);
});
