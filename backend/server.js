const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files (profile pictures) as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ──
app.use("/api/auth",          require("./src/routes/authRoutes"));
app.use("/api/users",         require("./src/routes/userRoutes"));
app.use("/api/attendance",    require("./src/routes/attendanceRoutes"));
app.use("/api/marks",         require("./src/routes/marksRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/settings",      require("./src/routes/settingsRoutes"));

app.get("/", (req, res) => res.json({ success: true, message: "GYAAN DRISHTI API Running! 🚀" }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ── MongoDB Connect then Start ──
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });