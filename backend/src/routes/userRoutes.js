const express = require("express");
const r = express.Router();
const c = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

r.get("/", protect, authorize("admin"), c.getAllUsers);
r.post("/", protect, authorize("admin"), c.createUser);
r.get("/pending", protect, authorize("admin"), c.getPendingUsers);
r.put("/:id/approve", protect, authorize("admin"), c.approveUser);
r.delete("/:id/reject", protect, authorize("admin"), c.rejectUser);
r.get("/:id", protect, c.getUser);
r.put("/:id", protect, authorize("admin"), c.updateUser);
r.delete("/:id", protect, authorize("admin"), c.deleteUser);
r.put("/profile/update", protect, c.updateProfile);
r.put("/profile/change-password", protect, c.changePassword);
r.put("/profile/avatar", protect, upload.single("avatar"), c.uploadAvatar);

module.exports = r;