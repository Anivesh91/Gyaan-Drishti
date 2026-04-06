const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  type:          { type: String, enum: ["attendance", "marks", "announcement", "exam", "approval", "general"], default: "general" },
  isRead:        { type: Boolean, default: false },
  createdById:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);