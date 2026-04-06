import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#e8ecf0";
const SHADOW = "8px 8px 18px #c5cad2, -8px -8px 18px #ffffff";
const SHADOW_SM = "5px 5px 12px #c5cad2, -5px -5px 12px #ffffff";
const SHADOW_INSET = "inset 5px 5px 12px #c5cad2, inset -5px -5px 12px #ffffff";
const ACCENT = "#667eea";
const RADIUS = "16px";
const RADIUS_SM = "12px";

const neoCard = {
  background: BG, borderRadius: RADIUS,
  padding: "22px", boxShadow: SHADOW,
};

const neoCardSm = {
  background: BG, borderRadius: RADIUS_SM,
  padding: "16px", boxShadow: SHADOW_SM,
};

const pageTitle = { fontSize: "26px", fontWeight: "900", color: "#1a1d2e", margin: "0 0 4px", letterSpacing: "-0.3px" };
const pageSub = { color: "#636e72", margin: "0 0 28px", fontSize: "14px" };

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, color, icon, sub }) => (
  <div style={{ ...neoCard, position: "relative", overflow: "hidden" }}>
    {/* Accent dot */}
    <div style={{
      position: "absolute", top: "16px", right: "16px",
      width: "44px", height: "44px",
      background: `${color}18`,
      borderRadius: "12px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px",
      boxShadow: `inset 3px 3px 7px ${color}30, inset -3px -3px 7px rgba(255,255,255,0.8)`,
    }}>{icon}</div>
    <p style={{ fontSize: "11px", color: "#636e72", margin: "0 0 8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</p>
    <p style={{ fontSize: "26px", fontWeight: "900", color, margin: 0, letterSpacing: "-0.5px" }}>{value}</p>
    {sub && <p style={{ fontSize: "12px", color: "#636e72", margin: "5px 0 0", fontWeight: "600" }}>{sub}</p>}
  </div>
);

// ── Section Panel ─────────────────────────────────────────────────────────────
const Panel = ({ title, children }) => (
  <div style={neoCard}>
    <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "800", color: "#1a1d2e" }}>{title}</h3>
    {children}
  </div>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
const NeoProgress = ({ pct, color }) => (
  <div style={{ boxShadow: SHADOW_INSET, borderRadius: "8px", height: "8px", background: BG, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(pct, 100)}%`,
      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      height: "8px", borderRadius: "8px",
      boxShadow: `0 2px 6px ${color}50`,
      transition: "width 0.6s ease",
    }} />
  </div>
);

// ── Neo Tab Button ────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "9px 22px", borderRadius: "10px", border: "none",
    cursor: "pointer", fontSize: "13px", fontWeight: "700",
    background: BG,
    boxShadow: active ? SHADOW_INSET : SHADOW_SM,
    color: active ? ACCENT : "#636e72",
    transition: "all 0.2s ease",
  }}>{children}</button>
);

// ── Action Button (small) ─────────────────────────────────────────────────────
const NeoBtn = ({ onClick, color = ACCENT, children, style = {} }) => (
  <button onClick={onClick} style={{
    background: BG, border: "none",
    padding: "7px 14px", borderRadius: "8px",
    cursor: "pointer", fontSize: "12px", fontWeight: "700",
    color, boxShadow: SHADOW_SM,
    transition: "all 0.2s ease",
    ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_INSET; e.currentTarget.style.transform = "translateY(0)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_SM; }}
  >{children}</button>
);

// ── Primary Button ────────────────────────────────────────────────────────────
const PrimaryBtn = ({ onClick, children, type = "button", disabled = false, style = {} }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    padding: "12px 28px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white", border: "none",
    borderRadius: RADIUS_SM, fontSize: "14px", fontWeight: "800",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: "6px 6px 14px rgba(102,126,234,0.4), -3px -3px 8px rgba(255,255,255,0.9)",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.7 : 1,
    ...style,
  }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
  >{children}</button>
);

// ── Neo Input ─────────────────────────────────────────────────────────────────
const neoInput = {
  width: "100%", padding: "12px 16px",
  background: BG, border: "none",
  boxShadow: SHADOW_INSET,
  borderRadius: RADIUS_SM,
  fontSize: "14px", color: "#2d3436",
  outline: "none", boxSizing: "border-box",
  marginBottom: "16px",
  fontFamily: "inherit",
};

// ── Toast-style messages ──────────────────────────────────────────────────────
const MsgBox = ({ msg, type = "success" }) => {
  const colors = { success: { border: "#48bb78", text: "#276749" }, error: { border: "#e53e3e", text: "#e53e3e" } };
  const c = colors[type];
  return (
    <div style={{
      background: BG,
      boxShadow: `inset 3px 3px 8px rgba(0,0,0,0.05), inset -3px -3px 8px rgba(255,255,255,0.9)`,
      borderLeft: `4px solid ${c.border}`,
      color: c.text, padding: "12px 16px",
      borderRadius: RADIUS_SM, fontSize: "13px",
      marginBottom: "16px", fontWeight: "700",
    }}>
      {type === "success" ? "✅" : "⚠️"} {msg}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/attendance/my").then(r => setAttendance(r.data.summary || []));
    API.get("/marks/my").then(r => setMarks(r.data.overall || {}));
    API.get("/notifications").then(r => setNotifications(r.data.notifications?.slice(0, 5) || []));
  }, []);

  const avgAttendance = attendance.length > 0
    ? (attendance.reduce((a, b) => a + b.percentage, 0) / attendance.length).toFixed(1) : 0;
  const low = attendance.filter(a => a.percentage < 75).length;
  const unread = notifications.filter(n => !n.isRead).length;

  const typeColor = { attendance: "#e53e3e", marks: ACCENT, exam: "#ed8936", announcement: "#48bb78", general: "#888" };

  return (
    <Layout>
      <h1 style={pageTitle}>Welcome back, {user?.name}! 👋</h1>
      <p style={pageSub}>Here's your academic overview</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "20px", marginBottom: "28px" }}>
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} color={avgAttendance >= 75 ? "#48bb78" : "#e53e3e"} icon="📅" sub={low > 0 ? `⚠️ ${low} subject(s) low` : "✓ Good standing"} />
        <StatCard title="Overall Grade" value={marks.grade || "N/A"} color={ACCENT} icon="🎯" sub={`${marks.percentage || 0}% score`} />
        <StatCard title="Subjects" value={attendance.length} color="#ed8936" icon="📚" sub="Enrolled" />
        <StatCard title="Notifications" value={unread} color="#e53e3e" icon="🔔" sub="Unread" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Attendance Summary */}
        <Panel title="📅 Attendance Summary">
          {attendance.length === 0
            ? <p style={{ color: "#636e72", fontSize: "14px" }}>No attendance records yet.</p>
            : attendance.map(a => (
              <div key={a.subject} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#2d3436" }}>{a.subject}</span>
                  <span style={{
                    fontSize: "12px", fontWeight: "800",
                    color: a.percentage >= 75 ? "#48bb78" : "#e53e3e",
                    background: BG,
                    boxShadow: SHADOW_SM,
                    padding: "2px 10px", borderRadius: "20px",
                  }}>{a.percentage}%</span>
                </div>
                <NeoProgress pct={a.percentage} color={a.percentage >= 75 ? "#48bb78" : "#e53e3e"} />
                <div style={{ fontSize: "11px", color: "#636e72", marginTop: "5px", fontWeight: "600" }}>{a.present}/{a.total} classes attended</div>
              </div>
            ))}
        </Panel>

        {/* Notifications */}
        <Panel title="🔔 Recent Notifications">
          {notifications.length === 0
            ? <p style={{ color: "#636e72", fontSize: "14px" }}>No notifications.</p>
            : notifications.map(n => (
              <div key={n._id} style={{
                padding: "12px 14px", borderRadius: RADIUS_SM,
                background: BG,
                boxShadow: n.isRead ? SHADOW_SM : `5px 5px 12px #c5cad2, -5px -5px 12px #ffffff`,
                marginBottom: "10px",
                borderLeft: `4px solid ${typeColor[n.type] || "#888"}`,
                opacity: n.isRead ? 0.75 : 1,
              }}>
                <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: "800", color: "#1a1d2e" }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#636e72" }}>{n.message}</p>
              </div>
            ))}
        </Panel>
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════
export const StudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/attendance/my").then(r => { setSummary(r.data.summary || []); setLoading(false); });
  }, []);

  return (
    <Layout>
      <h1 style={pageTitle}>📅 My Attendance</h1>
      <p style={pageSub}>Track your class attendance per subject</p>

      {loading ? (
        <p style={{ color: "#636e72" }}>Loading...</p>
      ) : summary.length === 0 ? (
        <div style={{ ...neoCard, textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>📋</div>
          <p style={{ color: "#636e72" }}>No attendance records found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {summary.map(s => (
            <div key={s.subject} style={neoCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#1a1d2e" }}>{s.subject}</h3>
                <span style={{
                  background: BG,
                  boxShadow: s.percentage >= 75 ? "4px 4px 10px rgba(72,187,120,0.2), -4px -4px 10px #ffffff" : "4px 4px 10px rgba(229,62,62,0.15), -4px -4px 10px #ffffff",
                  color: s.percentage >= 75 ? "#276749" : "#e53e3e",
                  padding: "6px 16px", borderRadius: "20px",
                  fontSize: "14px", fontWeight: "800",
                }}>{s.percentage}%</span>
              </div>

              {/* Mini stat boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "16px" }}>
                {[
                  ["Total", s.total, ACCENT],
                  ["Present", s.present, "#48bb78"],
                  ["Absent", s.absent, "#e53e3e"],
                  ["Needed", s.needed > 0 ? s.needed : "✓", s.needed > 0 ? "#ed8936" : "#48bb78"],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ ...neoCardSm, textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: c }}>{v}</div>
                    <div style={{ fontSize: "11px", color: "#636e72", marginTop: "4px", fontWeight: "600" }}>{l}</div>
                  </div>
                ))}
              </div>

              <NeoProgress pct={s.percentage} color={s.percentage >= 75 ? "#48bb78" : "#e53e3e"} />
              {s.percentage < 75 && (
                <p style={{ color: "#e53e3e", fontSize: "12px", margin: "10px 0 0", fontWeight: "700" }}>
                  ⚠️ Need {s.needed} more classes to reach 75%!
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT MARKS
// ═══════════════════════════════════════════════════════════════════════════════
export const StudentMarks = () => {
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/marks/my").then(r => { setSummary(r.data.summary || []); setOverall(r.data.overall || {}); setLoading(false); });
  }, []);

  const gradeColor = (g) => g === "A+" || g === "A" ? "#48bb78" : g === "B" ? ACCENT : g === "C" ? "#ed8936" : g === "D" ? "#dd6b20" : "#e53e3e";

  return (
    <Layout>
      <h1 style={pageTitle}>📝 My Marks</h1>
      <p style={pageSub}>Subject-wise academic performance</p>

      {loading ? <p style={{ color: "#636e72" }}>Loading...</p> : (
        <>
          {/* Overall Hero Card */}
          <div style={{
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            borderRadius: RADIUS,
            padding: "28px 32px",
            color: "white",
            marginBottom: "24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "10px 10px 24px rgba(102,126,234,0.35), -4px -4px 12px rgba(255,255,255,0.9)",
          }}>
            <div>
              <p style={{ margin: "0 0 6px", opacity: 0.75, fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>Overall Performance</p>
              <h2 style={{ margin: "0 0 4px", fontSize: "38px", fontWeight: "900", letterSpacing: "-1px" }}>{overall.percentage || 0}%</h2>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>{overall.total || 0} / {overall.maxTotal || 0} total marks</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "52px", fontWeight: "900",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "16px", padding: "10px 20px",
                backdropFilter: "blur(4px)",
                boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.15)",
              }}>{overall.grade || "N/A"}</div>
              <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "6px", fontWeight: "600" }}>OVERALL GRADE</div>
            </div>
          </div>

          {summary.length === 0 ? (
            <div style={{ ...neoCard, textAlign: "center", padding: "60px" }}>
              <p style={{ color: "#636e72" }}>No marks found.</p>
            </div>
          ) : summary.map(s => (
            <div key={s.subject} style={{ ...neoCard, marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#1a1d2e" }}>{s.subject}</h3>
                <span style={{
                  background: BG,
                  boxShadow: SHADOW_SM,
                  color: gradeColor(s.grade),
                  padding: "6px 18px", borderRadius: "20px",
                  fontWeight: "900", fontSize: "14px",
                }}>Grade: {s.grade}</span>
              </div>

              {/* Table */}
              <div style={{ boxShadow: SHADOW_INSET, borderRadius: RADIUS_SM, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr>
                      {["Exam Type", "Marks", "Max Marks", "Percentage"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", color: "#636e72", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.records.map((r, i) => (
                      <tr key={r._id} style={{ borderTop: i > 0 ? "1px solid rgba(197,202,210,0.4)" : "none" }}>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#2d3436", textTransform: "capitalize" }}>{r.examType}</td>
                        <td style={{ padding: "12px 16px", fontWeight: "900", color: ACCENT, fontSize: "15px" }}>{r.marks}</td>
                        <td style={{ padding: "12px 16px", color: "#636e72" }}>{r.maxMarks}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            color: (r.marks / r.maxMarks * 100) >= 50 ? "#48bb78" : "#e53e3e",
                            fontWeight: "800",
                          }}>{((r.marks / r.maxMarks) * 100).toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => API.get("/notifications").then(r => { setNotifications(r.data.notifications || []); setLoading(false); });
  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => { await API.put(`/notifications/${id}/read`); fetchNotifs(); };
  const markAll = async () => { await API.put("/notifications/read/all"); fetchNotifs(); };
  const deleteN = async (id) => { await API.delete(`/notifications/${id}`); fetchNotifs(); };

  const typeColor = { attendance: "#e53e3e", marks: ACCENT, exam: "#ed8936", announcement: "#48bb78", general: "#888" };
  const typeIcon = { attendance: "📅", marks: "📝", exam: "📖", announcement: "📢", general: "🔔" };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={pageTitle}>🔔 Notifications</h1>
          <p style={{ ...pageSub, margin: 0 }}>Stay updated with your academic alerts</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <PrimaryBtn onClick={markAll}>Mark All Read</PrimaryBtn>
        )}
      </div>

      {loading ? <p style={{ color: "#636e72" }}>Loading...</p> : notifications.length === 0 ? (
        <div style={{ ...neoCard, textAlign: "center", padding: "70px" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔕</div>
          <h3 style={{ color: "#1a1d2e", margin: "0 0 8px" }}>All clear!</h3>
          <p style={{ color: "#636e72" }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {notifications.map(n => (
            <div key={n._id} style={{
              ...neoCard,
              padding: "16px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              borderLeft: `4px solid ${typeColor[n.type] || "#888"}`,
              opacity: n.isRead ? 0.75 : 1,
            }}>
              <div style={{ display: "flex", gap: "14px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  background: BG, borderRadius: "12px",
                  boxShadow: SHADOW_SM,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                }}>{typeIcon[n.type] || "🔔"}</div>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "14px", color: "#1a1d2e" }}>{n.title}</p>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#636e72" }}>{n.message}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#b2bec3", fontWeight: "600" }}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {!n.isRead && <NeoBtn onClick={() => markRead(n._id)} color={ACCENT}>Read</NeoBtn>}
                <NeoBtn onClick={() => deleteN(n._id)} color="#e53e3e">Delete</NeoBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE PAGE (shared for all roles)
// ═══════════════════════════════════════════════════════════════════════════════
export const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", subject: user?.subject || "", rollNumber: user?.rollNumber || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("profile");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const BACKEND = "http://localhost:5000";

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) return `${BACKEND}${user.avatar}`;
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) { setErr("Only JPG, JPEG, PNG allowed!"); setMsg(""); e.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setErr("File must be under 5MB!"); setMsg(""); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setAvatarUploading(true); setErr(""); setMsg("");
    try {
      const formData = new FormData(); formData.append("avatar", file);
      const res = await API.put("/users/profile/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data.user); setMsg("Profile picture updated!"); setAvatarPreview(null);
    } catch (er) { setErr(er.response?.data?.message || "Upload failed"); setAvatarPreview(null); }
    finally { setAvatarUploading(false); e.target.value = ""; }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try { const res = await API.put("/users/profile/update", form); setMsg("Profile updated!"); setErr(""); setUser(res.data.user); }
    catch (er) { setErr(er.response?.data?.message || "Error"); setMsg(""); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setErr("Passwords don't match."); return; }
    try {
      await API.put("/users/profile/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg("Password changed!"); setErr(""); setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (er) { setErr(er.response?.data?.message || "Error"); setMsg(""); }
  };

  const avatarSrc = getAvatarSrc();

  return (
    <Layout>
      <h1 style={pageTitle}>👤 My Profile</h1>
      <p style={pageSub}>Manage your account settings</p>

      {/* Profile Header */}
      <div style={{ ...neoCard, display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div onClick={() => fileInputRef.current?.click()} style={{
            width: "88px", height: "88px", borderRadius: "50%",
            overflow: "hidden", cursor: "pointer",
            boxShadow: "8px 8px 18px rgba(102,126,234,0.3), -8px -8px 18px rgba(255,255,255,0.9)",
            border: `3px solid ${ACCENT}`,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "36px", color: "white", fontWeight: "800" }}>{user?.name?.[0]?.toUpperCase()}</span>
            }
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: avatarUploading ? 1 : 0, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.opacity = 0; }}
            >
              {avatarUploading
                ? <span style={{ color: "white", fontSize: "10px", fontWeight: "700" }}>Uploading...</span>
                : <><span style={{ fontSize: "18px" }}>📷</span><span style={{ color: "white", fontSize: "10px", fontWeight: "600" }}>Change</span></>
              }
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: "none" }} />
        </div>

        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#1a1d2e" }}>{user?.name}</h2>
          <p style={{ margin: "0 0 8px", color: "#636e72", fontSize: "14px" }}>{user?.email}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "white", padding: "4px 12px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "800", textTransform: "capitalize",
              boxShadow: "0 3px 8px rgba(102,126,234,0.35)",
            }}>{user?.role}</span>
            {user?.rollNumber && (
              <span style={{ background: BG, boxShadow: SHADOW_SM, color: ACCENT, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                Roll: {user.rollNumber}
              </span>
            )}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#b2bec3" }}>JPG, JPEG, PNG — max 5MB</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>✏️ Edit Profile</TabBtn>
        <TabBtn active={tab === "password"} onClick={() => setTab("password")}>🔒 Change Password</TabBtn>
      </div>

      {msg && <MsgBox msg={msg} type="success" />}
      {err && <MsgBox msg={err} type="error" />}

      <div style={neoCard}>
        {tab === "profile" ? (
          <form onSubmit={saveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Full Name</label>
                <input style={neoInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Phone</label>
                <input style={neoInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              {user?.role === "teacher" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Subject</label>
                  <input style={neoInput} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
              )}
              {user?.role === "student" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Roll Number</label>
                  <input style={neoInput} value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
                </div>
              )}
            </div>
            <PrimaryBtn type="submit">Save Changes</PrimaryBtn>
          </form>
        ) : (
          <form onSubmit={changePassword}>
            {[["currentPassword", "Current Password", "Enter current password"], ["newPassword", "New Password", "Min 6 characters"], ["confirm", "Confirm Password", "Re-enter new password"]].map(([field, label, ph]) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
                <input style={neoInput} type="password" placeholder={ph} value={pwForm[field]} onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })} />
              </div>
            ))}
            <PrimaryBtn type="submit">Change Password</PrimaryBtn>
          </form>
        )}
      </div>
    </Layout>
  );
};