import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const Card = ({ title, value, color, icon, sub }) => (
  <div style={{ background: "white", borderRadius: "12px", padding: "20px", borderLeft: `4px solid ${color}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: "13px", color: "#888", margin: "0 0 6px", fontWeight: "600" }}>{title}</p>
        <p style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: "12px", color: "#888", margin: "4px 0 0" }}>{sub}</p>}
      </div>
      <span style={{ fontSize: "28px" }}>{icon}</span>
    </div>
  </div>
);

// Student Dashboard
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

  const avgAttendance = attendance.length > 0 ? (attendance.reduce((a, b) => a + b.percentage, 0) / attendance.length).toFixed(1) : 0;
  const low = attendance.filter(a => a.percentage < 75).length;

  return (
    <Layout>
      <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 4px" }}>Welcome, {user?.name}! 👋</h1>
      <p style={{ color: "#888", margin: "0 0 24px" }}>Here's your academic overview</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "28px" }}>
        <Card title="Avg Attendance" value={`${avgAttendance}%`} color={avgAttendance >= 75 ? "#48bb78" : "#e53e3e"} icon="📅" sub={low > 0 ? `${low} subject(s) low` : "Good standing"} />
        <Card title="Overall Grade" value={marks.grade || "N/A"} color="#667eea" icon="🎯" sub={`${marks.percentage || 0}%`} />
        <Card title="Subjects" value={attendance.length} color="#ed8936" icon="📚" />
        <Card title="Notifications" value={notifications.filter(n => !n.isRead).length} color="#e53e3e" icon="🔔" sub="Unread" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Attendance Summary */}
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>📅 Attendance Summary</h3>
          {attendance.length === 0 ? <p style={{ color: "#888", fontSize: "14px" }}>No attendance records yet.</p> :
            attendance.map(a => (
              <div key={a.subject} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{a.subject}</span>
                  <span style={{ fontSize: "13px", color: a.percentage >= 75 ? "#48bb78" : "#e53e3e", fontWeight: "700" }}>{a.percentage}%</span>
                </div>
                <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px" }}>
                  <div style={{ width: `${Math.min(a.percentage, 100)}%`, background: a.percentage >= 75 ? "#48bb78" : "#e53e3e", height: "6px", borderRadius: "4px" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{a.present}/{a.total} classes</div>
              </div>
            ))
          }
        </div>

        {/* Recent Notifications */}
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>🔔 Recent Notifications</h3>
          {notifications.length === 0 ? <p style={{ color: "#888", fontSize: "14px" }}>No notifications.</p> :
            notifications.map(n => (
              <div key={n._id} style={{ padding: "10px", borderRadius: "8px", background: n.isRead ? "#f9f9f9" : "#f0f4ff", marginBottom: "8px", borderLeft: `3px solid ${n.type === "attendance" ? "#e53e3e" : n.type === "marks" ? "#667eea" : "#ed8936"}` }}>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700" }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{n.message}</p>
              </div>
            ))
          }
        </div>
      </div>
    </Layout>
  );
};

// Student Attendance
export const StudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/attendance/my").then(r => { setSummary(r.data.summary || []); setLoading(false); });
  }, []);

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📅 My Attendance</h1>
      {loading ? <p>Loading...</p> : summary.length === 0 ? <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center" }}><p style={{ color: "#888" }}>No attendance records found.</p></div> :
        <div style={{ display: "grid", gap: "16px" }}>
          {summary.map(s => (
            <div key={s.subject} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>{s.subject}</h3>
                <span style={{ background: s.percentage >= 75 ? "#f0fff4" : "#fff5f5", color: s.percentage >= 75 ? "#276749" : "#e53e3e", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                  {s.percentage}%
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "12px" }}>
                {[["Total Classes", s.total, "#667eea"], ["Present", s.present, "#48bb78"], ["Absent", s.absent, "#e53e3e"], ["Needed (75%)", s.needed > 0 ? s.needed : "✓", s.needed > 0 ? "#ed8936" : "#48bb78"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center", padding: "12px", background: "#f9f9f9", borderRadius: "8px" }}>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: c }}>{v}</div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px" }}>
                <div style={{ width: `${Math.min(s.percentage, 100)}%`, background: s.percentage >= 75 ? "#48bb78" : "#e53e3e", height: "8px", borderRadius: "6px" }} />
              </div>
              {s.percentage < 75 && <p style={{ color: "#e53e3e", fontSize: "12px", margin: "8px 0 0", fontWeight: "600" }}>⚠️ Need {s.needed} more classes to reach 75%!</p>}
            </div>
          ))}
        </div>
      }
    </Layout>
  );
};

// Student Marks
export const StudentMarks = () => {
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/marks/my").then(r => { setSummary(r.data.summary || []); setOverall(r.data.overall || {}); setLoading(false); });
  }, []);

  const gradeColor = (g) => g === "A+" || g === "A" ? "#48bb78" : g === "B" ? "#667eea" : g === "C" ? "#ed8936" : g === "D" ? "#dd6b20" : "#e53e3e";

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📝 My Marks</h1>
      {loading ? <p>Loading...</p> : (
        <>
          {/* Overall Card */}
          <div style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: "12px", padding: "24px", color: "white", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px", opacity: 0.8, fontSize: "14px" }}>Overall Performance</p>
              <h2 style={{ margin: "0 0 4px", fontSize: "32px" }}>{overall.percentage || 0}%</h2>
              <p style={{ margin: 0, fontSize: "14px" }}>{overall.total || 0} / {overall.maxTotal || 0} marks</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "800" }}>{overall.grade || "N/A"}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>Overall Grade</div>
            </div>
          </div>

          {summary.length === 0 ? <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center" }}><p style={{ color: "#888" }}>No marks found.</p></div> :
            summary.map(s => (
              <div key={s.subject} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ margin: 0 }}>{s.subject}</h3>
                  <span style={{ background: gradeColor(s.grade) + "20", color: gradeColor(s.grade), padding: "4px 14px", borderRadius: "20px", fontWeight: "800", fontSize: "14px" }}>Grade: {s.grade}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      {["Exam Type", "Marks", "Max Marks", "Percentage"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4a5568" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {s.records.map(r => (
                      <tr key={r._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{r.examType}</td>
                        <td style={{ padding: "8px 12px", fontWeight: "700" }}>{r.marks}</td>
                        <td style={{ padding: "8px 12px" }}>{r.maxMarks}</td>
                        <td style={{ padding: "8px 12px", color: (r.marks / r.maxMarks * 100) >= 50 ? "#48bb78" : "#e53e3e", fontWeight: "600" }}>{((r.marks / r.maxMarks) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          }
        </>
      )}
    </Layout>
  );
};

// Notifications Page
export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => API.get("/notifications").then(r => { setNotifications(r.data.notifications || []); setLoading(false); });
  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => { await API.put(`/notifications/${id}/read`); fetchNotifs(); };
  const markAll = async () => { await API.put("/notifications/read/all"); fetchNotifs(); };
  const deleteN = async (id) => { await API.delete(`/notifications/${id}`); fetchNotifs(); };

  const typeColor = { attendance: "#e53e3e", marks: "#667eea", exam: "#ed8936", announcement: "#48bb78", general: "#888" };
  const typeIcon = { attendance: "📅", marks: "📝", exam: "📖", announcement: "📢", general: "🔔" };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>🔔 Notifications</h1>
        {notifications.some(n => !n.isRead) && <button onClick={markAll} style={{ background: "#667eea", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Mark All Read</button>}
      </div>
      {loading ? <p>Loading...</p> : notifications.length === 0 ? <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center" }}><div style={{ fontSize: "48px" }}>🔕</div><p style={{ color: "#888", marginTop: "12px" }}>No notifications yet!</p></div> :
        notifications.map(n => (
          <div key={n._id} style={{ background: n.isRead ? "white" : "#f0f4ff", borderRadius: "12px", padding: "16px", marginBottom: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: `4px solid ${typeColor[n.type] || "#888"}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "22px" }}>{typeIcon[n.type] || "🔔"}</span>
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px" }}>{n.title}</p>
                <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#555" }}>{n.message}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              {!n.isRead && <button onClick={() => markRead(n._id)} style={{ background: "#667eea", color: "white", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Read</button>}
              <button onClick={() => deleteN(n._id)} style={{ background: "#fff0f0", color: "#e53e3e", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
            </div>
          </div>
        ))
      }
    </Layout>
  );
};

// Profile Page (shared for all roles)
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

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      setErr("Sirf JPG, JPEG ya PNG file select karo!"); setMsg("");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("File 5MB se chhoti honi chahiye!"); setMsg("");
      e.target.value = "";
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setAvatarUploading(true);
    setErr(""); setMsg("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await API.put("/users/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(res.data.user);
      setMsg("Profile picture update ho gayi! 🎉");
      setAvatarPreview(null); // now use the server URL
    } catch (er) {
      setErr(er.response?.data?.message || "Upload failed");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/users/profile/update", form);
      setMsg("Profile updated!"); setErr("");
      setUser(res.data.user);
    } catch (er) { setErr(er.response?.data?.message || "Error"); setMsg(""); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setErr("Passwords don't match."); return; }
    try {
      await API.put("/users/profile/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg("Password changed!"); setErr(""); setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (er) { setErr(er.response?.data?.message || "Error"); setMsg(""); }
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: tab === t ? "#667eea" : "#f0f0f0", color: tab === t ? "white" : "#666" }}>{label}</button>
  );

  const inp = { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px" };

  const avatarSrc = getAvatarSrc();

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>👤 My Profile</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>

        {/* Avatar with upload overlay */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            onClick={handleAvatarClick}
            title="Profile picture change karo"
            style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: "3px solid #667eea", position: "relative", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "32px", color: "white", fontWeight: "700" }}>{user?.name?.[0]?.toUpperCase()}</span>
            )}
            {/* Hover overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: avatarUploading ? 1 : 0, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.opacity = 0; }}
            >
              {avatarUploading
                ? <span style={{ color: "white", fontSize: "11px", fontWeight: "600" }}>Uploading...</span>
                : <>
                    <span style={{ fontSize: "18px" }}>📷</span>
                    <span style={{ color: "white", fontSize: "10px", fontWeight: "600", marginTop: "2px" }}>Change</span>
                  </>
              }
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div>
          <h2 style={{ margin: "0 0 4px" }}>{user?.name}</h2>
          <p style={{ margin: "0 0 4px", color: "#888", fontSize: "14px" }}>{user?.email}</p>
          <span style={{ background: "#667eea", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", textTransform: "capitalize" }}>{user?.role}</span>
          {user?.rollNumber && <span style={{ marginLeft: "8px", background: "#f0f4ff", color: "#667eea", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>Roll: {user.rollNumber}</span>}
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#aaa" }}>Profile picture pe click karke photo change karo (JPG, JPEG, PNG — max 5MB)</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {tabBtn("profile", "Edit Profile")}
        {tabBtn("password", "Change Password")}
      </div>
      {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px" }}>{msg}</div>}
      {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px" }}>{err}</div>}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        {tab === "profile" ? (
          <form onSubmit={saveProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Full Name</label><input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Phone</label><input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              {user?.role === "teacher" && <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject</label><input style={inp} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>}
              {user?.role === "student" && <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Roll Number</label><input style={inp} value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} /></div>}
            </div>
            <button type="submit" style={{ padding: "11px 24px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Save Changes</button>
          </form>
        ) : (
          <form onSubmit={changePassword}>
            {["currentPassword", "newPassword", "confirm"].map((field, i) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>{["Current Password", "New Password", "Confirm New Password"][i]}</label>
                <input style={inp} type="password" placeholder={["Enter current password", "Min 6 characters", "Re-enter new password"][i]} value={pwForm[field]} onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })} />
              </div>
            ))}
            <button type="submit" style={{ padding: "11px 24px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Change Password</button>
          </form>
        )}
      </div>
    </Layout>
  );
};