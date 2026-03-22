import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../utils/api";

// Admin Dashboard
export const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, admins: 0, total: 0 });

  useEffect(() => {
    API.get("/users").then(r => {
      const users = r.data.users || [];
      setStats({
        students: users.filter(u => u.role === "student").length,
        teachers: users.filter(u => u.role === "teacher").length,
        admins: users.filter(u => u.role === "admin").length,
        total: users.length,
      });
    });
  }, []);

  return (
    <Layout>
      <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px" }}>Admin Panel 🛠️</h1>
      <p style={{ color: "#888", margin: "0 0 24px" }}>System overview and management</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "28px" }}>
        {[["Total Users", stats.total, "#667eea", "👥"], ["Students", stats.students, "#48bb78", "👨‍🎓"], ["Teachers", stats.teachers, "#ed8936", "👨‍🏫"], ["Admins", stats.admins, "#764ba2", "🛡️"]].map(([t, v, c, i]) => (
          <div key={t} style={{ background: "white", borderRadius: "12px", padding: "20px", borderLeft: `4px solid ${c}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px", fontWeight: "600" }}>{t}</p>
                <p style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>{v}</p>
              </div>
              <span style={{ fontSize: "28px" }}>{i}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>⚡ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
          {[["➕ Add New User", "/admin/add-user"], ["👥 Manage All Users", "/admin/users"], ["📢 Send Announcement", "/admin/announcements"], ["👤 My Profile", "/admin/profile"]].map(([l, p]) => (
            <a key={p} href={p} style={{ display: "block", padding: "16px", background: "linear-gradient(135deg,#667eea11,#764ba211)", border: "1px solid #667eea33", borderRadius: "10px", color: "#667eea", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>{l}</a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// Manage Users
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
    setUsers(r.data.users || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const deactivate = async (id) => {
    if (window.confirm("Deactivate this user?")) {
      await API.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  const roleColor = { student: "#48bb78", teacher: "#667eea", admin: "#764ba2" };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>👥 Manage Users</h1>
        <a href="/admin/add-user" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>➕ Add User</a>
      </div>
      <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", gap: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <input style={{ flex: 1, padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={fetchUsers} style={{ padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Search</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead style={{ background: "#f9f9f9" }}>
              <tr>{["Name", "Email", "Role", "Roll/Subject", "Status", "Joined", "Action"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", color: "#4a5568" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#888" }}>No users found.</td></tr> :
                users.map(u => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f0f0f0", opacity: u.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: "12px 16px", fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", background: `linear-gradient(135deg,${roleColor[u.role]},#764ba2)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px" }}>{u.name?.[0]?.toUpperCase()}</div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: roleColor[u.role] + "20", color: roleColor[u.role], padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", textTransform: "capitalize" }}>{u.role}</span></td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{u.rollNumber || u.subject || "-"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: u.isActive ? "#f0fff4" : "#fff5f5", color: u.isActive ? "#276749" : "#e53e3e", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.isActive && <button onClick={() => deactivate(u._id)} style={{ padding: "4px 10px", background: "#fff0f0", color: "#e53e3e", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Deactivate</button>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

// Add User
export const AddUser = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", rollNumber: "", subject: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    // Check if an admin already exists
    API.get("/users?role=admin").then(r => {
      const admins = (r.data.users || []).filter(u => u.isActive);
      setAdminExists(admins.length > 0);
    }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr("Fill all required fields."); return; }
    if (form.role === "admin" && adminExists) { setErr("An admin already exists. Only one admin is allowed."); return; }
    try {
      await API.post("/users", form);
      setMsg(`${form.role} "${form.name}" created successfully!`);
      setErr("");
      setForm({ name: "", email: "", password: "", role: "student", rollNumber: "", subject: "", phone: "" });
      if (form.role === "admin") setAdminExists(true);
    } catch (er) { setErr(er.response?.data?.message || "Error creating user."); }
  };

  const inp = { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px" };

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>➕ Add New User</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", maxWidth: "600px" }}>
        {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>✅ {msg}</div>}
        {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Full Name *</label>
              <input style={inp} placeholder="Enter full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Role *</label>
              <select style={{ ...inp, opacity: form.role === "admin" && adminExists ? 0.6 : 1 }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin" disabled={adminExists}>Admin {adminExists ? "(already exists)" : ""}</option>
              </select>
              {adminExists && <p style={{ fontSize: "11px", color: "#e53e3e", marginTop: "-10px", marginBottom: "10px" }}>⚠️ Only one admin allowed. Admin slot is taken.</p>}
            </div>
          </div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Email *</label>
          <input style={inp} type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Password *</label>
              <input style={inp} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Phone</label>
              <input style={inp} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          {form.role === "student" && (
            <>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Roll Number</label>
              <input style={inp} placeholder="Student roll number" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
            </>
          )}
          {form.role === "teacher" && (
            <>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject</label>
              <input style={inp} placeholder="Teaching subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </>
          )}
          <button type="submit" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>➕ Create User</button>
        </form>
      </div>
    </Layout>
  );
};

// Admin Announcements
export const AdminAnnouncements = () => {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "all" });
  const [examForm, setExamForm] = useState({ subject: "", examDate: "", message: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("announcement");

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notifications/announcement", form);
      setMsg(res.data.message); setErr("");
      setForm({ title: "", message: "", targetRole: "all" });
    } catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  const sendExam = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notifications/exam-reminder", examForm);
      setMsg(res.data.message); setErr("");
    } catch (er) { setErr(er.response?.data?.message || "Error"); }
  };

  const inp = { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px" };

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📢 Announcements</h1>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[["announcement", "📢 Announcement"], ["exam", "📖 Exam Reminder"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: tab === t ? "#667eea" : "#f0f0f0", color: tab === t ? "white" : "#666" }}>{l}</button>
        ))}
      </div>
      {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "12px", borderRadius: "8px", marginBottom: "14px", fontWeight: "600" }}>✅ {msg}</div>}
      {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "12px", borderRadius: "8px", marginBottom: "14px" }}>{err}</div>}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", maxWidth: "600px" }}>
        {tab === "announcement" ? (
          <form onSubmit={sendAnnouncement}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Send To</label>
            <select style={inp} value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="student">All Students</option>
              <option value="teacher">All Teachers</option>
            </select>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Title *</label>
            <input style={inp} placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Message *</label>
            <textarea style={{ ...inp, height: "130px", resize: "vertical" }} placeholder="Write your announcement..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <button type="submit" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>📢 Send Now</button>
          </form>
        ) : (
          <form onSubmit={sendExam}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject *</label>
            <input style={inp} placeholder="Subject name" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Exam Date *</label>
            <input style={inp} type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Custom Message (optional)</label>
            <textarea style={{ ...inp, height: "100px", resize: "vertical" }} placeholder="Optional message..." value={examForm.message} onChange={e => setExamForm({ ...examForm, message: e.target.value })} />
            <button type="submit" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>📖 Send Exam Reminder</button>
          </form>
        )}
      </div>
    </Layout>
  );
};

// ── Pending Approvals Page ──────────────────────────────────────────────────
export const PendingApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/pending");
      setUsers(res.data.users || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id, name) => {
    try {
      await API.put(`/users/${id}/approve`);
      setMsg(`✅ ${name} has been approved!`);
      fetchPending();
    } catch (e) { setMsg(e.response?.data?.message || "Error approving user."); }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject and delete ${name}'s registration? This cannot be undone.`)) return;
    try {
      await API.delete(`/users/${id}/reject`);
      setMsg(`❌ ${name}'s registration has been rejected.`);
      fetchPending();
    } catch (e) { setMsg(e.response?.data?.message || "Error rejecting user."); }
  };

  const roleColor = { student: "#48bb78", teacher: "#667eea" };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 4px" }}>⏳ Pending Approvals</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Review and approve or reject new registration requests</p>
        </div>
        {users.length > 0 && (
          <span style={{ background: "#ed893620", color: "#ed8936", border: "1px solid #ed893644", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
            {users.length} Pending
          </span>
        )}
      </div>

      {msg && (
        <div style={{ background: msg.startsWith("✅") ? "#f0fff4" : "#fff5f5", border: `1px solid ${msg.startsWith("✅") ? "#9ae6b4" : "#fed7d7"}`, color: msg.startsWith("✅") ? "#276749" : "#e53e3e", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#888" }}>Loading...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎉</div>
          <h3 style={{ margin: "0 0 8px", color: "#1a1a2e" }}>All caught up!</h3>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>No pending registration requests right now.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {users.map(u => (
            <div key={u._id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", borderLeft: `4px solid ${roleColor[u.role] || "#888"}` }}>
              {/* Avatar + Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "46px", height: "46px", background: `linear-gradient(135deg,${roleColor[u.role] || "#888"},#764ba2)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "18px", flexShrink: 0 }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "3px" }}>{u.name}</div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>{u.email}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ background: (roleColor[u.role] || "#888") + "20", color: roleColor[u.role] || "#888", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" }}>{u.role}</span>
                    {u.rollNumber && <span style={{ background: "#f0f4ff", color: "#667eea", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>Roll: {u.rollNumber}</span>}
                    {u.subject && <span style={{ background: "#f0f4ff", color: "#667eea", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>Subject: {u.subject}</span>}
                    {u.phone && <span style={{ background: "#f7f7f7", color: "#888", padding: "2px 10px", borderRadius: "12px", fontSize: "11px" }}>📞 {u.phone}</span>}
                  </div>
                </div>
              </div>
              {/* Registered at + Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", color: "#aaa" }}>Registered {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => approve(u._id, u.name)} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#48bb78,#38a169)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
                    ✅ Approve
                  </button>
                  <button onClick={() => reject(u._id, u.name)} style={{ padding: "8px 18px", background: "white", color: "#e53e3e", border: "2px solid #fed7d7", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};