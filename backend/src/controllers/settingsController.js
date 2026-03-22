const path = require("path");
const fs = require("fs");

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

// Default settings
const defaultSettings = {
  requireApproval: false  // false = open registration, true = approval required
};

const readSettings = () => {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return { ...defaultSettings };
  }
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")); }
  catch { return { ...defaultSettings }; }
};

const writeSettings = (data) => {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
};

// GET /api/settings — public (needed during register to show UI)
exports.getSettings = (req, res) => {
  try {
    const settings = readSettings();
    res.status(200).json({ success: true, settings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/settings — admin only
exports.updateSettings = (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.status(200).json({
      success: true,
      message: updated.requireApproval
        ? "✅ Approval mode ON — new registrations need your approval."
        : "✅ Open mode ON — new registrations are auto-approved.",
      settings: updated
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Export readSettings so authController can use it
exports.readSettings = readSettings;