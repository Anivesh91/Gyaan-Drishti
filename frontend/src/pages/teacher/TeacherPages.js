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

const neoCard = { background: BG, borderRadius: RADIUS, padding: "22px", boxShadow: SHADOW };
const neoCardSm = { background: BG, borderRadius: RADIUS_SM, padding: "14px", boxShadow: SHADOW_SM };
const pageTitle = { fontSize: "26px", fontWeight: "900", color: "#1a1d2e", margin: "0 0 4px", letterSpacing: "-0.3px" };
const pageSub = { color: "#636e72", margin: "0 0 28px", fontSize: "14px" };

const neoInput = {
  width: "100%", padding: "12px 16px",
  background: BG, border: "none",
  boxShadow: SHADOW_INSET, borderRadius: RADIUS_SM,
  fontSize: "14px", color: "#2d3436",
  outline: "none", boxSizing: "border-box",
  marginBottom: "16px", fontFamily: "inherit",
};

const MsgBox = ({ msg, type = "success" }) => {
  const c = type === "success" ? { border: "#48bb78", text: "#276749" } : { border: "#e53e3e", text: "#e53e3e" };
  return (
    <div style={{ background: BG, boxShadow: SHADOW_INSET, borderLeft: `4px solid ${c.border}`, color: c.text, padding: "12px 16px", borderRadius: RADIUS_SM, fontSize: "13px", marginBottom: "16px", fontWeight: "700" }}>
      {type === "success" ? "✅" : "⚠️"} {msg}
    </div>
  );
};

const PrimaryBtn = ({ onClick, children, type = "button", disabled = false, style: st = {} }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    padding: "12px 28px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white", border: "none", borderRadius: RADIUS_SM,
    fontSize: "14px", fontWeight: "800", cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: "6px 6px 14px rgba(102,126,234,0.4), -3px -3px 8px rgba(255,255,255,0.9)",
    transition: "all 0.2s ease", opacity: disabled ? 0.7 : 1, ...st,
  }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
  >{children}</button>
);

const NeoBtn = ({ onClick, color = ACCENT, children, style: st = {} }) => (
  <button onClick={onClick} style={{
    background: BG, border: "none", padding: "7px 14px", borderRadius: "8px",
    cursor: "pointer", fontSize: "12px", fontWeight: "700", color, boxShadow: SHADOW_SM,
    transition: "all 0.2s ease", ...st,
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = SHADOW_INSET}
    onMouseLeave={e => e.currentTarget.style.boxShadow = SHADOW_SM}
  >{children}</button>
);

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "9px 22px", borderRadius: "10px", border: "none",
    cursor: "pointer", fontSize: "13px", fontWeight: "700", background: BG,
    boxShadow: active ? SHADOW_INSET : SHADOW_SM,
    color: active ? ACCENT : "#636e72", transition: "all 0.2s ease",
  }}>{children}</button>
);

const StatCard = ({ title, value, color, icon }) => (
  <div style={{ ...neoCard, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "16px", right: "16px", width: "44px", height: "44px", background: `${color}18`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: `inset 3px 3px 7px ${color}30, inset -3px -3px 7px rgba(255,255,255,0.8)` }}>{icon}</div>
    <p style={{ fontSize: "11px", color: "#636e72", margin: "0 0 8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</p>
    <p style={{ fontSize: "24px", fontWeight: "900", color, margin: 0, letterSpacing: "-0.5px" }}>{value}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, avgMarks: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/attendance/students").then(r => setStats(s => ({ ...s, students: r.data.students?.length || 0 })));
    API.get("/marks/summary").then(r => setStats(s => ({ ...s, avgMarks: r.data.summary?.avg || 0 })));
    API.get("/notifications").then(r => setNotifications(r.data.notifications?.slice(0, 5) || []));
  }, []);

  const quickActions = [
    ["📅 Mark Today's Attendance", "/teacher/mark-attendance"],
    ["📝 Enter Marks", "/teacher/enter-marks"],
    ["📋 View Attendance Report", "/teacher/attendance"],
    ["📢 Send Announcement", "/teacher/announcements"],
  ];

  return (
    <Layout>
      <h1 style={pageTitle}>Welcome, {user?.name}! 📖</h1>
      <p style={pageSub}>Manage your class effectively</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "20px", marginBottom: "28px" }}>
        <StatCard title="Total Students" value={stats.students} color={ACCENT} icon="👨‍🎓" />
        <StatCard title="Class Avg Marks" value={`${stats.avgMarks}%`} color="#48bb78" icon="📊" />
        <StatCard title="Your Subject" value={user?.subject || "N/A"} color="#ed8936" icon="📚" />
        <StatCard title="Quick Actions" value="4" color="#764ba2" icon="⚡" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Quick Actions */}
        <div style={neoCard}>
          <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "800", color: "#1a1d2e" }}>⚡ Quick Actions</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {quickActions.map(([l, p]) => (
              <a key={p} href={p} style={{
                display: "block", padding: "14px 16px",
                background: BG, borderRadius: RADIUS_SM,
                boxShadow: SHADOW_SM,
                color: "#2d3436", textDecoration: "none",
                fontSize: "14px", fontWeight: "700",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_INSET; e.currentTarget.style.color = ACCENT; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_SM; e.currentTarget.style.color = "#2d3436"; }}
              >{l}</a>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={neoCard}>
          <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "800", color: "#1a1d2e" }}>🔔 Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p style={{ color: "#636e72", fontSize: "14px" }}>No notifications.</p>
          ) : notifications.map(n => (
            <div key={n._id} style={{ padding: "12px 14px", borderRadius: RADIUS_SM, background: BG, boxShadow: SHADOW_SM, marginBottom: "10px" }}>
              <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: "800", color: "#1a1d2e" }}>{n.title}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#636e72" }}>{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MARK ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════
export const MarkAttendance = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("manual");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [subject, setSubject] = useState(user?.subject || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [exSubject, setExSubject] = useState(user?.subject || "");
  const [exDate, setExDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    API.get("/attendance/students").then(r => {
      const s = r.data.students || [];
      setStudents(s);
      const init = {}; s.forEach(st => init[st._id] = "present"); setAttendance(init);
    });
  }, []);

  const toggle = (id) => setAttendance(a => ({ ...a, [id]: a[id] === "present" ? "absent" : "present" }));
  const markAll = (status) => { const a = {}; students.forEach(s => a[s._id] = status); setAttendance(a); };
  const present = students.filter(s => attendance[s._id] === "present").length;

  const submitManual = async () => {
    if (!subject) { setErr("Enter subject name."); return; }
    const records = students.map(s => ({ studentId: s._id, status: attendance[s._id] || "present" }));
    try { await API.post("/attendance/mark", { records, subject, date }); setMsg(`✅ Attendance marked for ${students.length} students!`); setErr(""); }
    catch (e) { setErr(e.response?.data?.message || "Error"); }
  };

  const downloadTemplate = async () => {
    try {
      const res = await API.get("/attendance/template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = "attendance_template.xlsx"; a.click();
    } catch { setErr("Could not download template."); }
  };

  const submitExcel = async () => {
    if (!file) { setErr("Select a file first."); return; }
    if (!exSubject) { setErr("Enter subject."); return; }
    setUploading(true); setErr(""); setMsg(""); setResult(null);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("subject", exSubject); fd.append("date", exDate);
      const res = await API.post("/attendance/upload-excel", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data); setMsg(""); setFile(null);
    } catch (e) { setErr(e.response?.data?.message || "Upload failed."); }
    setUploading(false);
  };

  return (
    <Layout>
      <h1 style={pageTitle}>📅 Mark Attendance</h1>
      <p style={pageSub}>Record student attendance manually or via Excel</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <TabBtn active={tab === "manual"} onClick={() => setTab("manual")}>📝 Manual Entry</TabBtn>
        <TabBtn active={tab === "excel"} onClick={() => setTab("excel")}>📊 Excel Upload</TabBtn>
      </div>

      {/* MANUAL TAB */}
      {tab === "manual" && (
        <div style={neoCard}>
          {/* Controls */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Subject *</label>
              <input style={neoInput} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject name" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Date</label>
              <input style={neoInput} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {msg && <MsgBox msg={msg} type="success" />}
          {err && <MsgBox msg={err} type="error" />}

          {/* Summary bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "12px 16px", background: BG, borderRadius: RADIUS_SM, boxShadow: SHADOW_INSET }}>
            <div style={{ fontSize: "14px" }}>
              <span style={{ color: "#48bb78", fontWeight: "800" }}>{present} Present</span>
              <span style={{ margin: "0 12px", color: "#c5cad2" }}>|</span>
              <span style={{ color: "#e53e3e", fontWeight: "800" }}>{students.length - present} Absent</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <NeoBtn onClick={() => markAll("present")} color="#276749">✓ All Present</NeoBtn>
              <NeoBtn onClick={() => markAll("absent")} color="#e53e3e">✗ All Absent</NeoBtn>
            </div>
          </div>

          {/* Student list */}
          <div style={{ display: "grid", gap: "8px" }}>
            {students.map(s => {
              const isPresent = attendance[s._id] === "present";
              return (
                <div key={s._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 18px", borderRadius: RADIUS_SM, background: BG,
                  boxShadow: isPresent ? "5px 5px 12px rgba(72,187,120,0.15), -5px -5px 12px #ffffff" : "5px 5px 12px rgba(229,62,62,0.12), -5px -5px 12px #ffffff",
                  borderLeft: `4px solid ${isPresent ? "#48bb78" : "#e53e3e"}`,
                }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "14px", color: "#1a1d2e" }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#636e72" }}>{s.rollNumber || s.email}</p>
                  </div>
                  <button onClick={() => toggle(s._id)} style={{
                    padding: "8px 20px", borderRadius: "20px", border: "none",
                    cursor: "pointer", fontWeight: "800", fontSize: "13px",
                    background: isPresent ? "linear-gradient(135deg,#48bb78,#38a169)" : "linear-gradient(135deg,#e53e3e,#c53030)",
                    color: "white",
                    boxShadow: isPresent ? "4px 4px 10px rgba(72,187,120,0.4)" : "4px 4px 10px rgba(229,62,62,0.35)",
                    transition: "all 0.2s ease",
                  }}>{isPresent ? "✓ Present" : "✗ Absent"}</button>
                </div>
              );
            })}
          </div>

          {students.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <PrimaryBtn onClick={submitManual}>📤 Submit Attendance</PrimaryBtn>
            </div>
          )}
        </div>
      )}

      {/* EXCEL TAB */}
      {tab === "excel" && (
        <div>
          {/* Instructions */}
          <div style={{ ...neoCard, marginBottom: "20px", borderLeft: `4px solid ${ACCENT}` }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "800", color: ACCENT }}>📋 How to use Excel Upload</h3>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#636e72", lineHeight: "1.7" }}>
              1. Download the template — student names and roll numbers are pre-filled.<br />
              2. Fill the <strong>Status</strong> column with <strong>present</strong> or <strong>absent</strong>.<br />
              3. Select subject and date — then upload.
            </p>
            <NeoBtn onClick={downloadTemplate} color={ACCENT}>⬇️ Download Pre-filled Template</NeoBtn>
          </div>

          {/* Upload Form */}
          <div style={neoCard}>
            <h3 style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: "800", color: "#1a1d2e" }}>📤 Upload Filled Excel</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Subject *</label>
                <input style={neoInput} value={exSubject} onChange={e => setExSubject(e.target.value)} placeholder="Subject name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Date *</label>
                <input style={neoInput} type="date" value={exDate} onChange={e => setExDate(e.target.value)} />
              </div>
            </div>

            {/* File drop zone */}
            <div style={{
              background: BG, boxShadow: SHADOW_INSET,
              borderRadius: RADIUS_SM, padding: "32px",
              textAlign: "center", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📊</div>
              <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#636e72", fontWeight: "600" }}>
                {file ? `✅ Selected: ${file.name}` : "Click to select your Excel file (.xlsx / .xls)"}
              </p>
              <input id="attExcelInput" type="file" accept=".xlsx,.xls" onChange={e => { setFile(e.target.files[0]); setResult(null); setMsg(""); setErr(""); }} style={{ display: "none" }} />
              <NeoBtn onClick={() => document.getElementById("attExcelInput").click()} color={ACCENT}>📁 Browse File</NeoBtn>
            </div>

            {msg && !result && <MsgBox msg={msg} type="success" />}
            {err && <MsgBox msg={err} type="error" />}

            <PrimaryBtn onClick={submitExcel} disabled={uploading || !file}>
              {uploading ? "⏳ Processing..." : "📤 Upload & Mark Attendance"}
            </PrimaryBtn>

            {/* Results */}
            {result && (
              <div style={{ marginTop: "22px" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
                  {[["✅ Saved", result.summary.saved, "#48bb78"], ["⚠️ Skipped", result.summary.skipped, "#ed8936"], ["❌ Not Found", result.summary.notFound, "#e53e3e"]].map(([label, count, color]) => (
                    <div key={label} style={{ ...neoCardSm, textAlign: "center", minWidth: "100px" }}>
                      <div style={{ fontSize: "22px", fontWeight: "900", color }}>{count}</div>
                      <div style={{ fontSize: "12px", color, fontWeight: "700" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {result.details.saved.length > 0 && (
                  <div style={{ ...neoCardSm, marginBottom: "12px" }}>
                    <p style={{ fontWeight: "800", fontSize: "13px", color: "#276749", marginBottom: "8px" }}>✅ Saved:</p>
                    {result.details.saved.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", borderBottom: i < result.details.saved.length - 1 ? "1px solid rgba(197,202,210,0.4)" : "none" }}>
                        <span style={{ color: "#2d3436" }}>{s.name} {s.roll !== "-" ? `(${s.roll})` : ""}</span>
                        <span style={{ fontWeight: "800", color: s.status === "present" ? "#48bb78" : "#e53e3e" }}>{s.status === "present" ? "✓ Present" : "✗ Absent"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW ATTENDANCE (Teacher)
// ═══════════════════════════════════════════════════════════════════════════════
export const ViewAttendanceTeacher = () => {
  const [records, setRecords] = useState([]);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    const q = subject ? `?subject=${subject}` : "";
    const r = await API.get(`/attendance/teacher${q}`);
    setRecords(r.data.attendance || []);
    setLoading(false);
  };

  const update = async (id, status) => { await API.put(`/attendance/${id}`, { status }); setEditing(null); fetchRecords(); };
  const del = async (id) => { if (window.confirm("Delete?")) { await API.delete(`/attendance/${id}`); fetchRecords(); } };

  return (
    <Layout>
      <h1 style={pageTitle}>📋 Attendance Records</h1>
      <p style={pageSub}>View and edit class attendance</p>

      <div style={{ ...neoCard, display: "flex", gap: "12px", marginBottom: "20px", padding: "16px 20px" }}>
        <input style={{ ...neoInput, marginBottom: 0, flex: 1 }} placeholder="Filter by subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        <NeoBtn onClick={fetchRecords} color={ACCENT}>🔍 Search</NeoBtn>
        <NeoBtn onClick={() => { setSubject(""); fetchRecords(); }} color="#636e72">All</NeoBtn>
      </div>

      {loading ? <p style={{ color: "#636e72" }}>Loading...</p> : (
        <div style={{ ...neoCard, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: BG }}>
                  {["Student", "Roll No", "Subject", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "800", color: "#636e72", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "50px", textAlign: "center", color: "#636e72" }}>No records. Click Search to load.</td></tr>
                ) : records.map((r, i) => (
                  <tr key={r._id} style={{ borderTop: i > 0 ? "1px solid rgba(197,202,210,0.3)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1a1d2e" }}>{r.student?.name}</td>
                    <td style={{ padding: "12px 16px", color: "#636e72" }}>{r.student?.rollNumber || "-"}</td>
                    <td style={{ padding: "12px 16px", color: "#2d3436" }}>{r.subject}</td>
                    <td style={{ padding: "12px 16px", color: "#636e72" }}>{r.date}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {editing === r._id ? (
                        <select defaultValue={r.status} onChange={e => update(r._id, e.target.value)} style={{ ...neoInput, width: "auto", marginBottom: 0, padding: "6px 10px" }}>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      ) : (
                        <span style={{
                          background: BG,
                          boxShadow: SHADOW_SM,
                          color: r.status === "present" ? "#276749" : "#e53e3e",
                          padding: "4px 12px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: "800",
                        }}>{r.status}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <NeoBtn onClick={() => setEditing(r._id)} color={ACCENT}>Edit</NeoBtn>
                        <NeoBtn onClick={() => del(r._id)} color="#e53e3e">Delete</NeoBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENTER MARKS
// ═══════════════════════════════════════════════════════════════════════════════
export const EnterMarks = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [form, setForm] = useState({ subject: user?.subject || "", examType: "midterm", maxMarks: 100 });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    API.get("/attendance/students").then(r => {
      const s = r.data.students || [];
      setStudents(s);
      const m = {}; s.forEach(st => m[st._id] = ""); setMarks(m);
    });
  }, []);

  const submit = async () => {
    if (!form.subject) { setErr("Enter subject."); return; }
    const records = students.filter(s => marks[s._id] !== "").map(s => ({ studentId: s._id, marks: Number(marks[s._id]) }));
    if (records.length === 0) { setErr("Enter at least one mark."); return; }
    try { await API.post("/marks/bulk", { ...form, records }); setMsg(`Marks saved for ${records.length} students!`); setErr(""); }
    catch (e) { setErr(e.response?.data?.message || "Error"); }
  };

  return (
    <Layout>
      <h1 style={pageTitle}>📝 Enter Marks</h1>
      <p style={pageSub}>Record exam marks for your students</p>

      <div style={neoCard}>
        {/* Form controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "6px" }}>
          {[
            ["Subject *", "text", "subject", form.subject, v => setForm({ ...form, subject: v }), "Subject name", null],
            ["Exam Type *", "select", "examType", form.examType, v => setForm({ ...form, examType: v }), null, [["midterm","Mid Term"],["endterm","End Term"],["assignment","Assignment"],["quiz","Quiz"]]],
            ["Max Marks", "number", "maxMarks", form.maxMarks, v => setForm({ ...form, maxMarks: Number(v) }), null, null],
          ].map(([label, type, key, val, setter, ph, opts]) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
              {type === "select" ? (
                <select style={neoInput} value={val} onChange={e => setter(e.target.value)}>
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input style={neoInput} type={type} placeholder={ph} value={val} onChange={e => setter(e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {msg && <MsgBox msg={msg} type="success" />}
        {err && <MsgBox msg={err} type="error" />}

        {/* Student marks table */}
        <div style={{ boxShadow: SHADOW_INSET, borderRadius: RADIUS_SM, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr>
                {["#", "Student", "Roll No", `Marks (0–${form.maxMarks})`].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "800", color: "#636e72", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id} style={{ borderTop: i > 0 ? "1px solid rgba(197,202,210,0.3)" : "none" }}>
                  <td style={{ padding: "10px 16px", color: "#636e72", fontWeight: "700" }}>{i + 1}</td>
                  <td style={{ padding: "10px 16px", fontWeight: "700", color: "#1a1d2e" }}>{s.name}</td>
                  <td style={{ padding: "10px 16px", color: "#636e72" }}>{s.rollNumber || "-"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <input type="number" min={0} max={form.maxMarks} placeholder={`0–${form.maxMarks}`}
                      value={marks[s._id]} onChange={e => setMarks({ ...marks, [s._id]: e.target.value })}
                      style={{ width: "100px", padding: "8px 12px", background: BG, border: "none", boxShadow: SHADOW_INSET, borderRadius: "8px", fontSize: "14px", outline: "none" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length > 0 && <div style={{ marginTop: "20px" }}><PrimaryBtn onClick={submit}>💾 Save All Marks</PrimaryBtn></div>}
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW MARKS (Teacher)
// ═══════════════════════════════════════════════════════════════════════════════
export const ViewMarksTeacher = () => {
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState({});
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const fetchMarks = async () => {
    const q = new URLSearchParams();
    if (subject) q.append("subject", subject);
    if (examType) q.append("examType", examType);
    const [r1, r2] = await Promise.all([API.get(`/marks/teacher?${q}`), API.get(`/marks/summary?${q}`)]);
    setMarks(r1.data.marks || []); setSummary(r2.data.summary || {});
  };

  const update = async (id) => { await API.put(`/marks/${id}`, { marks: Number(editVal) }); setEditing(null); fetchMarks(); };

  return (
    <Layout>
      <h1 style={pageTitle}>📊 Class Marks</h1>
      <p style={pageSub}>View and edit recorded marks</p>

      <div style={{ ...neoCard, display: "flex", gap: "12px", marginBottom: "20px", padding: "16px 20px" }}>
        <input style={{ ...neoInput, marginBottom: 0, flex: 1 }} placeholder="Subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        <select style={{ ...neoInput, marginBottom: 0, width: "auto" }} value={examType} onChange={e => setExamType(e.target.value)}>
          <option value="">All Exams</option>
          <option value="midterm">Mid Term</option>
          <option value="endterm">End Term</option>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
        </select>
        <NeoBtn onClick={fetchMarks} color={ACCENT}>🔍 Search</NeoBtn>
      </div>

      {marks.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" }}>
          {[["Total", summary.total, ACCENT, "📋"], ["Average", `${summary.avg}%`, "#48bb78", "📈"], ["Highest", summary.highest, "#ed8936", "🏆"], ["Lowest", summary.lowest, "#e53e3e", "📉"]].map(([l, v, c, i]) => (
            <StatCard key={l} title={l} value={v} color={c} icon={i} />
          ))}
        </div>
      )}

      <div style={{ ...neoCard, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: BG }}>
                {["Student", "Subject", "Exam", "Marks", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "800", color: "#636e72", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "50px", textAlign: "center", color: "#636e72" }}>Search to see marks.</td></tr>
              ) : marks.map((m, i) => (
                <tr key={m._id} style={{ borderTop: i > 0 ? "1px solid rgba(197,202,210,0.3)" : "none" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1a1d2e" }}>{m.student?.name}</td>
                  <td style={{ padding: "12px 16px", color: "#2d3436" }}>{m.subject}</td>
                  <td style={{ padding: "12px 16px", color: "#636e72", textTransform: "capitalize" }}>{m.examType}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {editing === m._id ? (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: "70px", padding: "6px 10px", background: BG, border: "none", boxShadow: SHADOW_INSET, borderRadius: "8px", fontSize: "14px", outline: "none" }} />
                        <NeoBtn onClick={() => update(m._id)} color="#48bb78">✓</NeoBtn>
                        <NeoBtn onClick={() => setEditing(null)} color="#e53e3e">✗</NeoBtn>
                      </div>
                    ) : <span style={{ fontWeight: "900", color: ACCENT, fontSize: "15px" }}>{m.marks}/{m.maxMarks}</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <NeoBtn onClick={() => { setEditing(m._id); setEditVal(m.marks); }} color={ACCENT}>Edit</NeoBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
export const TeacherAnnouncements = () => {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "student" });
  const [examForm, setExamForm] = useState({ subject: "", examDate: "", message: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("announcement");

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    try { const res = await API.post("/notifications/announcement", form); setMsg(res.data.message); setErr(""); }
    catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  const sendExam = async (e) => {
    e.preventDefault();
    try { const res = await API.post("/notifications/exam-reminder", examForm); setMsg(res.data.message); setErr(""); }
    catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  return (
    <Layout>
      <h1 style={pageTitle}>📢 Announcements</h1>
      <p style={pageSub}>Send notifications to your students</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <TabBtn active={tab === "announcement"} onClick={() => setTab("announcement")}>📢 Announcement</TabBtn>
        <TabBtn active={tab === "exam"} onClick={() => setTab("exam")}>📖 Exam Reminder</TabBtn>
      </div>

      {msg && <MsgBox msg={msg} type="success" />}
      {err && <MsgBox msg={err} type="error" />}

      <div style={{ ...neoCard, maxWidth: "620px" }}>
        {tab === "announcement" ? (
          <form onSubmit={sendAnnouncement}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Send To</label>
            <select style={neoInput} value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="student">All Students</option>
              <option value="teacher">All Teachers</option>
              <option value="all">Everyone</option>
            </select>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Title *</label>
            <input style={neoInput} placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Message *</label>
            <textarea style={{ ...neoInput, height: "130px", resize: "vertical" }} placeholder="Write your announcement..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <PrimaryBtn type="submit">📢 Send Announcement</PrimaryBtn>
          </form>
        ) : (
          <form onSubmit={sendExam}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Subject *</label>
            <input style={neoInput} placeholder="Subject name" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} required />
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Exam Date *</label>
            <input style={neoInput} type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} required />
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Custom Message (optional)</label>
            <textarea style={{ ...neoInput, height: "100px", resize: "vertical" }} placeholder="Optional custom message..." value={examForm.message} onChange={e => setExamForm({ ...examForm, message: e.target.value })} />
            <PrimaryBtn type="submit">📖 Send Exam Reminder</PrimaryBtn>
          </form>
        )}
      </div>
    </Layout>
  );
};