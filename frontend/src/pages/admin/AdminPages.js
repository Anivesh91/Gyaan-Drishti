import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../utils/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#e8ecf0";
const SHADOW = "8px 8px 18px #c5cad2, -8px -8px 18px #ffffff";
const SHADOW_SM = "5px 5px 12px #c5cad2, -5px -5px 12px #ffffff";
const SHADOW_INSET = "inset 5px 5px 12px #c5cad2, inset -5px -5px 12px #ffffff";
const ACCENT = "#667eea";
const RADIUS = "16px";
const RADIUS_SM = "12px";

const neoCard = { background: BG, borderRadius: RADIUS, padding: "22px", boxShadow: SHADOW };
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
    <p style={{ fontSize: "28px", fontWeight: "900", color, margin: 0 }}>{value}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, admins: 0, total: 0 });
  const [requireApproval, setRequireApproval] = useState(false);
  const [toggleMsg, setToggleMsg] = useState("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    API.get("/users").then(r => {
      const users = r.data.users || [];
      setStats({ students: users.filter(u => u.role === "student").length, teachers: users.filter(u => u.role === "teacher").length, admins: users.filter(u => u.role === "admin").length, total: users.length });
    });
    API.get("/settings").then(r => setRequireApproval(r.data.settings?.requireApproval || false)).catch(() => {});
  }, []);

  const toggleApproval = async () => {
    setToggling(true); setToggleMsg("");
    try {
      const res = await API.put("/settings", { requireApproval: !requireApproval });
      setRequireApproval(!requireApproval); setToggleMsg(res.data.message);
      setTimeout(() => setToggleMsg(""), 3000);
    } catch { setToggleMsg("Failed to update setting."); }
    setToggling(false);
  };

  const quickActions = [["➕ Add New User", "/admin/add-user"], ["👥 Manage All Users", "/admin/users"], ["📢 Send Announcement", "/admin/announcements"], ["👤 My Profile", "/admin/profile"]];

  return (
    <Layout>
      <h1 style={pageTitle}>Admin Panel 🛠️</h1>
      <p style={pageSub}>System overview and management</p>

      {/* Registration Mode Toggle */}
      <div style={{ ...neoCard, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h3 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: "800", color: "#1a1d2e" }}>🔐 Registration Mode</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#636e72" }}>
            {requireApproval ? "Approval Mode — new registrations need your approval" : "Open Mode — new registrations can login immediately"}
          </p>
          {toggleMsg && <p style={{ margin: "6px 0 0", fontSize: "13px", fontWeight: "700", color: requireApproval ? "#ed8936" : "#48bb78" }}>{toggleMsg}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "13px", fontWeight: "800", color: requireApproval ? "#ed8936" : "#48bb78" }}>
            {requireApproval ? "⏳ Approval Required" : "✅ Open Registration"}
          </span>
          {/* Neo Toggle Switch */}
          <div onClick={toggling ? null : toggleApproval} style={{
            width: "56px", height: "30px", borderRadius: "15px",
            background: BG,
            boxShadow: SHADOW_INSET,
            cursor: toggling ? "not-allowed" : "pointer",
            position: "relative",
            opacity: toggling ? 0.7 : 1,
            transition: "all 0.3s",
          }}>
            <div style={{
              position: "absolute", top: "4px",
              left: requireApproval ? "28px" : "4px",
              width: "22px", height: "22px",
              background: requireApproval ? "linear-gradient(135deg,#ed8936,#dd6b20)" : "linear-gradient(135deg,#48bb78,#38a169)",
              borderRadius: "50%",
              transition: "left 0.3s ease",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.25), -1px -1px 4px rgba(255,255,255,0.8)",
            }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "20px", marginBottom: "28px" }}>
        <StatCard title="Total Users" value={stats.total} color={ACCENT} icon="👥" />
        <StatCard title="Students" value={stats.students} color="#48bb78" icon="👨‍🎓" />
        <StatCard title="Teachers" value={stats.teachers} color="#ed8936" icon="👨‍🏫" />
        <StatCard title="Admins" value={stats.admins} color="#764ba2" icon="🛡️" />
      </div>

      {/* Quick Actions */}
      <div style={neoCard}>
        <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: "800", color: "#1a1d2e" }}>⚡ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
          {quickActions.map(([l, p]) => (
            <a key={p} href={p} style={{
              display: "block", padding: "16px 18px",
              background: BG, borderRadius: RADIUS_SM,
              boxShadow: SHADOW_SM, color: ACCENT,
              textDecoration: "none", fontSize: "14px", fontWeight: "800",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_INSET; e.currentTarget.style.color = "#764ba2"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_SM; e.currentTarget.style.color = ACCENT; }}
            >{l}</a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGE USERS
// ═══════════════════════════════════════════════════════════════════════════════
export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.append("search", search);
    if (role) q.append("role", role);
    const r = await API.get(`/users?${q}`);
    setUsers(r.data.users || []); setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const deactivate = async (id) => {
    if (window.confirm("Deactivate this user?")) { await API.delete(`/users/${id}`); fetchUsers(); }
  };

  const roleColor = { student: "#48bb78", teacher: ACCENT, admin: "#764ba2" };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={pageTitle}>👥 Manage Users</h1>
          <p style={{ ...pageSub, margin: 0 }}>View and manage all system users</p>
        </div>
        <a href="/admin/add-user" style={{
          padding: "12px 22px",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "white", borderRadius: RADIUS_SM,
          textDecoration: "none", fontSize: "14px", fontWeight: "800",
          boxShadow: "6px 6px 14px rgba(102,126,234,0.4)",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >➕ Add User</a>
      </div>

      {/* Filters */}
      <div style={{ ...neoCard, display: "flex", gap: "12px", marginBottom: "20px", padding: "16px 20px" }}>
        <input style={{ ...neoInput, marginBottom: 0, flex: 1 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...neoInput, marginBottom: 0, width: "auto" }} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
        <NeoBtn onClick={fetchUsers} color={ACCENT}>🔍 Search</NeoBtn>
      </div>

      {loading ? <p style={{ color: "#636e72" }}>Loading...</p> : (
        <div style={{ ...neoCard, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: BG }}>
                  {["Name", "Email", "Role", "Roll/Subject", "Status", "Joined", "Action"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "800", color: "#636e72", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "50px", textAlign: "center", color: "#636e72" }}>No users found.</td></tr>
                ) : users.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: i > 0 ? "1px solid rgba(197,202,210,0.3)" : "none", opacity: u.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "34px", height: "34px",
                          background: `linear-gradient(135deg,${roleColor[u.role] || "#888"},#764ba2)`,
                          borderRadius: "50%", display: "flex", alignItems: "center",
                          justifyContent: "center", color: "white",
                          fontWeight: "800", fontSize: "13px",
                          boxShadow: `0 3px 8px ${roleColor[u.role] || "#888"}50`,
                          flexShrink: 0,
                        }}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: "700", color: "#1a1d2e" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#636e72" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: BG, boxShadow: SHADOW_SM,
                        color: roleColor[u.role] || "#888",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: "800", textTransform: "capitalize",
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#636e72" }}>{u.rollNumber || u.subject || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: BG, boxShadow: SHADOW_SM,
                        color: u.isActive ? "#276749" : "#e53e3e",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: "800",
                      }}>{u.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#636e72" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.isActive && <NeoBtn onClick={() => deactivate(u._id)} color="#e53e3e">Deactivate</NeoBtn>}
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
// ADD USER
// ═══════════════════════════════════════════════════════════════════════════════
export const AddUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", rollNumber: "", subject: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    API.get("/users?role=admin").then(r => { const admins = (r.data.users || []).filter(u => u.isActive); setAdminExists(admins.length > 0); }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr("Fill all required fields."); return; }
    if (form.role === "admin" && adminExists) { setErr("An admin already exists."); return; }
    try {
      await API.post("/users", form);
      setMsg(`${form.role} "${form.name}" created successfully!`); setErr("");
      setForm({ name: "", email: "", password: "", role: "student", rollNumber: "", subject: "", phone: "" });
      if (form.role === "admin") setAdminExists(true);
    } catch (er) { setErr(er.response?.data?.message || "Error creating user."); }
  };

  const lbl = (text) => (
    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{text}</label>
  );

  return (
    <Layout>
      <h1 style={pageTitle}>➕ Add New User</h1>
      <p style={pageSub}>Create a new account for students, teachers, or admin</p>

      <div style={{ ...neoCard, maxWidth: "620px" }}>
        {msg && <MsgBox msg={msg} type="success" />}
        {err && <MsgBox msg={err} type="error" />}

        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              {lbl("Full Name *")}
              <input style={neoInput} placeholder="Enter full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              {lbl("Role *")}
              <select style={neoInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin" disabled={adminExists}>Admin {adminExists ? "(exists)" : ""}</option>
              </select>
              {adminExists && <p style={{ fontSize: "11px", color: "#e53e3e", marginTop: "-12px", marginBottom: "12px", fontWeight: "700" }}>⚠️ Only one admin allowed.</p>}
            </div>
          </div>

          {lbl("Email *")}
          <input style={neoInput} type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              {lbl("Password *")}
              <input style={neoInput} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              {lbl("Phone")}
              <input style={neoInput} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          {form.role === "student" && (
            <>{lbl("Roll Number")}<input style={neoInput} placeholder="Student roll number" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} /></>
          )}
          {form.role === "teacher" && (
            <>{lbl("Subject")}<input style={neoInput} placeholder="Teaching subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></>
          )}

          <PrimaryBtn type="submit">➕ Create User</PrimaryBtn>
        </form>
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
export const AdminAnnouncements = () => {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "all" });
  const [examForm, setExamForm] = useState({ subject: "", examDate: "", message: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("announcement");

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    try { const res = await API.post("/notifications/announcement", form); setMsg(res.data.message); setErr(""); setForm({ title: "", message: "", targetRole: "all" }); }
    catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  const sendExam = async (e) => {
    e.preventDefault();
    try { const res = await API.post("/notifications/exam-reminder", examForm); setMsg(res.data.message); setErr(""); }
    catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  const lbl = (text) => (
    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{text}</label>
  );

  return (
    <Layout>
      <h1 style={pageTitle}>📢 Announcements</h1>
      <p style={pageSub}>Send notifications to users</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <TabBtn active={tab === "announcement"} onClick={() => setTab("announcement")}>📢 Announcement</TabBtn>
        <TabBtn active={tab === "exam"} onClick={() => setTab("exam")}>📖 Exam Reminder</TabBtn>
      </div>

      {msg && <MsgBox msg={msg} type="success" />}
      {err && <MsgBox msg={err} type="error" />}

      <div style={{ ...neoCard, maxWidth: "620px" }}>
        {tab === "announcement" ? (
          <form onSubmit={sendAnnouncement}>
            {lbl("Send To")}
            <select style={neoInput} value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="student">All Students</option>
              <option value="teacher">All Teachers</option>
            </select>
            {lbl("Title *")}
            <input style={neoInput} placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            {lbl("Message *")}
            <textarea style={{ ...neoInput, height: "130px", resize: "vertical" }} placeholder="Write your announcement..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <PrimaryBtn type="submit">📢 Send Now</PrimaryBtn>
          </form>
        ) : (
          <form onSubmit={sendExam}>
            {lbl("Subject *")}
            <input style={neoInput} placeholder="Subject name" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} required />
            {lbl("Exam Date *")}
            <input style={neoInput} type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} required />
            {lbl("Custom Message (optional)")}
            <textarea style={{ ...neoInput, height: "100px", resize: "vertical" }} placeholder="Optional message..." value={examForm.message} onChange={e => setExamForm({ ...examForm, message: e.target.value })} />
            <PrimaryBtn type="submit">📖 Send Exam Reminder</PrimaryBtn>
          </form>
        )}
      </div>
    </Layout>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PENDING APPROVALS
// ═══════════════════════════════════════════════════════════════════════════════
export const PendingApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try { const res = await API.get("/users/pending"); setUsers(res.data.users || []); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id, name) => {
    try { await API.put(`/users/${id}/approve`); setMsg(`✅ ${name} approved!`); fetchPending(); }
    catch (e) { setMsg(e.response?.data?.message || "Error."); }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject and delete ${name}? This cannot be undone.`)) return;
    try { await API.delete(`/users/${id}/reject`); setMsg(`❌ ${name}'s registration rejected.`); fetchPending(); }
    catch (e) { setMsg(e.response?.data?.message || "Error."); }
  };

  const roleColor = { student: "#48bb78", teacher: ACCENT };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={pageTitle}>⏳ Pending Approvals</h1>
          <p style={{ ...pageSub, margin: 0 }}>Review and approve or reject new registrations</p>
        </div>
        {users.length > 0 && (
          <span style={{
            background: BG, boxShadow: SHADOW_SM,
            color: "#ed8936", padding: "8px 18px",
            borderRadius: "20px", fontSize: "13px", fontWeight: "800",
          }}>{users.length} Pending</span>
        )}
      </div>

      {msg && (
        <MsgBox msg={msg} type={msg.startsWith("✅") ? "success" : "error"} />
      )}

      {loading ? (
        <p style={{ color: "#636e72" }}>Loading...</p>
      ) : users.length === 0 ? (
        <div style={{ ...neoCard, textAlign: "center", padding: "70px" }}>
          <div style={{ fontSize: "56px", marginBottom: "14px" }}>🎉</div>
          <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontWeight: "800" }}>All caught up!</h3>
          <p style={{ color: "#636e72" }}>No pending registration requests.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {users.map(u => (
            <div key={u._id} style={{
              ...neoCard,
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "20px",
              borderLeft: `4px solid ${roleColor[u.role] || "#888"}`,
            }}>
              {/* Avatar + Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "50px", height: "50px",
                  background: `linear-gradient(135deg,${roleColor[u.role] || "#888"},#764ba2)`,
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white",
                  fontWeight: "900", fontSize: "20px", flexShrink: 0,
                  boxShadow: `0 4px 14px ${roleColor[u.role] || "#888"}50`,
                }}>{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px", color: "#1a1d2e", marginBottom: "3px" }}>{u.name}</div>
                  <div style={{ fontSize: "13px", color: "#636e72", marginBottom: "6px" }}>{u.email}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ background: BG, boxShadow: SHADOW_SM, color: roleColor[u.role] || "#888", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "capitalize" }}>{u.role}</span>
                    {u.rollNumber && <span style={{ background: BG, boxShadow: SHADOW_SM, color: ACCENT, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>Roll: {u.rollNumber}</span>}
                    {u.subject && <span style={{ background: BG, boxShadow: SHADOW_SM, color: ACCENT, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>📚 {u.subject}</span>}
                    {u.phone && <span style={{ background: BG, boxShadow: SHADOW_SM, color: "#636e72", padding: "3px 10px", borderRadius: "20px", fontSize: "11px" }}>📞 {u.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Date + Actions */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", color: "#b2bec3", fontWeight: "600" }}>
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => approve(u._id, u.name)} style={{
                    padding: "9px 20px",
                    background: "linear-gradient(135deg,#48bb78,#38a169)",
                    color: "white", border: "none", borderRadius: RADIUS_SM,
                    cursor: "pointer", fontSize: "13px", fontWeight: "800",
                    boxShadow: "5px 5px 12px rgba(72,187,120,0.4), -3px -3px 8px rgba(255,255,255,0.9)",
                    transition: "all 0.2s ease",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >✅ Approve</button>
                  <NeoBtn onClick={() => reject(u._id, u.name)} color="#e53e3e" style={{ padding: "9px 20px" }}>❌ Reject</NeoBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};