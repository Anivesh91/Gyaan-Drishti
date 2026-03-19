import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// Teacher Dashboard
export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, avgMarks: 0, lowAttendance: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/attendance/students").then(r => setStats(s => ({ ...s, students: r.data.students?.length || 0 })));
    API.get("/marks/summary").then(r => setStats(s => ({ ...s, avgMarks: r.data.summary?.avg || 0 })));
    API.get("/notifications").then(r => setNotifications(r.data.notifications?.slice(0, 5) || []));
  }, []);

  return (
    <Layout>
      <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px" }}>Welcome, {user?.name}! 📖</h1>
      <p style={{ color: "#888", margin: "0 0 24px" }}>Manage your class effectively</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "28px" }}>
        {[["Total Students", stats.students, "#667eea", "👨‍🎓"], ["Class Avg Marks", `${stats.avgMarks}%`, "#48bb78", "📊"], ["Your Subject", user?.subject || "N/A", "#ed8936", "📚"], ["Quick Actions", "4", "#764ba2", "⚡"]].map(([t, v, c, i]) => (
          <div key={t} style={{ background: "white", borderRadius: "12px", padding: "20px", borderLeft: `4px solid ${c}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px", fontWeight: "600" }}>{t}</p><p style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", margin: 0 }}>{v}</p></div>
              <span style={{ fontSize: "26px" }}>{i}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>⚡ Quick Actions</h3>
          {[["📅 Mark Today's Attendance", "/teacher/mark-attendance"], ["📝 Enter Marks", "/teacher/enter-marks"], ["📋 View Attendance Report", "/teacher/attendance"], ["📢 Send Announcement", "/teacher/announcements"]].map(([l, p]) => (
            <a key={p} href={p} style={{ display: "block", padding: "12px", background: "#f9f9f9", borderRadius: "8px", marginBottom: "8px", color: "#1a1a2e", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>{l}</a>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>🔔 Recent Notifications</h3>
          {notifications.length === 0 ? <p style={{ color: "#888", fontSize: "14px" }}>No notifications.</p> :
            notifications.map(n => (
              <div key={n._id} style={{ padding: "10px", borderRadius: "8px", background: "#f9f9f9", marginBottom: "8px" }}>
                <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700" }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{n.message}</p>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};

// Mark Attendance
export const MarkAttendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [subject, setSubject] = useState(user?.subject || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    API.get("/attendance/students").then(r => {
      const s = r.data.students || [];
      setStudents(s);
      const init = {};
      s.forEach(st => init[st._id] = "present");
      setAttendance(init);
    });
  }, []);

  const toggle = (id) => setAttendance(a => ({ ...a, [id]: a[id] === "present" ? "absent" : "present" }));
  const markAll = (status) => { const a = {}; students.forEach(s => a[s._id] = status); setAttendance(a); };

  const submit = async () => {
    if (!subject) { setErr("Enter subject name."); return; }
    const records = students.map(s => ({ studentId: s._id, status: attendance[s._id] || "present" }));
    try {
      await API.post("/attendance/mark", { records, subject, date });
      setMsg(`Attendance marked for ${students.length} students!`); setErr("");
    } catch (e) { setErr(e.response?.data?.message || "Error"); }
  };

  const present = Object.values(attendance).filter(v => v === "present").length;

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📅 Mark Attendance</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject *</label>
            <input style={{ width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} placeholder="Enter subject" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Date *</label>
            <input style={{ width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>{msg}</div>}
        {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", color: "#4a5568" }}>
            <span style={{ color: "#48bb78", fontWeight: "700" }}>{present} Present</span>
            <span style={{ margin: "0 8px", color: "#ccc" }}>|</span>
            <span style={{ color: "#e53e3e", fontWeight: "700" }}>{students.length - present} Absent</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => markAll("present")} style={{ padding: "6px 14px", background: "#f0fff4", color: "#276749", border: "1px solid #9ae6b4", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>All Present</button>
            <button onClick={() => markAll("absent")} style={{ padding: "6px 14px", background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>All Absent</button>
          </div>
        </div>
        {students.map(s => (
          <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "8px", marginBottom: "6px", background: attendance[s._id] === "present" ? "#f0fff4" : "#fff5f5", border: `1px solid ${attendance[s._id] === "present" ? "#9ae6b4" : "#fed7d7"}` }}>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "14px" }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{s.rollNumber || s.email}</p>
            </div>
            <button onClick={() => toggle(s._id)} style={{ padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px", background: attendance[s._id] === "present" ? "#48bb78" : "#e53e3e", color: "white" }}>
              {attendance[s._id] === "present" ? "✓ Present" : "✗ Absent"}
            </button>
          </div>
        ))}
        {students.length > 0 && <button onClick={submit} style={{ width: "100%", marginTop: "16px", padding: "13px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Submit Attendance</button>}
      </div>
    </Layout>
  );
};

// View Attendance (Teacher)
export const ViewAttendanceTeacher = () => {
  const [records, setRecords] = useState([]);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    const q = subject ? `?subject=${subject}` : "";
    const r = await API.get(`/attendance/teacher${q}`);
    setRecords(r.data.attendance || []);
    setLoading(false);
  };

  const update = async (id, status) => {
    await API.put(`/attendance/${id}`, { status });
    setEditing(null); fetch();
  };
  const del = async (id) => { if (window.confirm("Delete?")) { await API.delete(`/attendance/${id}`); fetch(); } };

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📋 Attendance Records</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", gap: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <input style={{ flex: 1, padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }} placeholder="Filter by subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        <button onClick={fetch} style={{ padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Search</button>
        <button onClick={fetch} style={{ padding: "10px 20px", background: "#f0f0f0", color: "#666", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>All</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead style={{ background: "#f9f9f9" }}>
              <tr>{["Student", "Roll No", "Subject", "Date", "Status", "Actions"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", color: "#4a5568" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.length === 0 ? <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#888" }}>No records. Click "All" to load.</td></tr> :
                records.map(r => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "600" }}>{r.student?.name}</td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{r.student?.rollNumber || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>{r.subject}</td>
                    <td style={{ padding: "12px 16px" }}>{r.date}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {editing === r._id ? (
                        <select defaultValue={r.status} onChange={e => update(r._id, e.target.value)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      ) : (
                        <span style={{ background: r.status === "present" ? "#f0fff4" : "#fff5f5", color: r.status === "present" ? "#276749" : "#e53e3e", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>{r.status}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setEditing(r._id)} style={{ marginRight: "6px", padding: "4px 10px", background: "#f0f4ff", color: "#667eea", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Edit</button>
                      <button onClick={() => del(r._id)} style={{ padding: "4px 10px", background: "#fff0f0", color: "#e53e3e", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Delete</button>
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

// Enter Marks
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
      const m = {}; s.forEach(st => m[st._id] = "");
      setMarks(m);
    });
  }, []);

  const submit = async () => {
    if (!form.subject) { setErr("Enter subject."); return; }
    const records = students.filter(s => marks[s._id] !== "").map(s => ({ studentId: s._id, marks: Number(marks[s._id]) }));
    if (records.length === 0) { setErr("Enter at least one mark."); return; }
    try {
      await API.post("/marks/bulk", { ...form, records });
      setMsg(`Marks saved for ${records.length} students!`); setErr("");
    } catch (e) { setErr(e.response?.data?.message || "Error"); }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📝 Enter Marks</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject *</label>
            <input style={{ width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject name" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Exam Type *</label>
            <select style={{ width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
              <option value="midterm">Mid Term</option>
              <option value="endterm">End Term</option>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Max Marks</label>
            <input style={{ width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: Number(e.target.value) })} />
          </div>
        </div>
        {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>{msg}</div>}
        {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>{err}</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead style={{ background: "#f9f9f9" }}>
            <tr>
              {["#", "Student Name", "Roll No", `Marks (out of ${form.maxMarks})`].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: "700", color: "#4a5568" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 14px", color: "#888" }}>{i + 1}</td>
                <td style={{ padding: "10px 14px", fontWeight: "600" }}>{s.name}</td>
                <td style={{ padding: "10px 14px", color: "#888" }}>{s.rollNumber || "-"}</td>
                <td style={{ padding: "10px 14px" }}>
                  <input type="number" min={0} max={form.maxMarks} placeholder={`0-${form.maxMarks}`} value={marks[s._id]} onChange={e => setMarks({ ...marks, [s._id]: e.target.value })}
                    style={{ width: "100px", padding: "6px 10px", border: "2px solid #e2e8f0", borderRadius: "6px", fontSize: "14px", outline: "none" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length > 0 && <button onClick={submit} style={{ marginTop: "16px", padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Save All Marks</button>}
      </div>
    </Layout>
  );
};

// View Marks (Teacher)
export const ViewMarksTeacher = () => {
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState({});
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const fetch = async () => {
    const q = new URLSearchParams();
    if (subject) q.append("subject", subject);
    if (examType) q.append("examType", examType);
    const [r1, r2] = await Promise.all([API.get(`/marks/teacher?${q}`), API.get(`/marks/summary?${q}`)]);
    setMarks(r1.data.marks || []);
    setSummary(r2.data.summary || {});
  };

  const update = async (id) => { await API.put(`/marks/${id}`, { marks: Number(editVal) }); setEditing(null); fetch(); };

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 20px" }}>📊 Class Marks</h1>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input style={{ flex: 1, padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }} placeholder="Subject..." value={subject} onChange={e => setSubject(e.target.value)} />
        <select style={{ padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }} value={examType} onChange={e => setExamType(e.target.value)}>
          <option value="">All Exams</option>
          <option value="midterm">Mid Term</option>
          <option value="endterm">End Term</option>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
        </select>
        <button onClick={fetch} style={{ padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Search</button>
      </div>
      {marks.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "16px" }}>
          {[["Total", summary.total, "#667eea"], ["Average", `${summary.avg}%`, "#48bb78"], ["Highest", summary.highest, "#ed8936"], ["Lowest", summary.lowest, "#e53e3e"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "white", borderRadius: "10px", padding: "14px", textAlign: "center", borderTop: `3px solid ${c}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "22px", fontWeight: "800", color: c }}>{v}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead style={{ background: "#f9f9f9" }}>
            <tr>{["Student", "Subject", "Exam", "Marks", "Actions"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", color: "#4a5568" }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {marks.length === 0 ? <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Search to see marks.</td></tr> :
              marks.map(m => (
                <tr key={m._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600" }}>{m.student?.name}</td>
                  <td style={{ padding: "12px 16px" }}>{m.subject}</td>
                  <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{m.examType}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {editing === m._id ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: "70px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "6px" }} />
                        <button onClick={() => update(m._id)} style={{ padding: "4px 10px", background: "#48bb78", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>✓</button>
                        <button onClick={() => setEditing(null)} style={{ padding: "4px 10px", background: "#e53e3e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>✗</button>
                      </div>
                    ) : <span style={{ fontWeight: "700" }}>{m.marks}/{m.maxMarks}</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => { setEditing(m._id); setEditVal(m.marks); }} style={{ padding: "4px 10px", background: "#f0f4ff", color: "#667eea", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Edit</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

// Announcements (Teacher)
export const TeacherAnnouncements = () => {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "student" });
  const [examForm, setExamForm] = useState({ subject: "", examDate: "", message: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("announcement");

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notifications/announcement", form);
      setMsg(res.data.message); setErr("");
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
        {[["announcement", "📢 Send Announcement"], ["exam", "📖 Exam Reminder"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: tab === t ? "#667eea" : "#f0f0f0", color: tab === t ? "white" : "#666" }}>{l}</button>
        ))}
      </div>
      {msg && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "10px", borderRadius: "8px", marginBottom: "14px" }}>{msg}</div>}
      {err && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "10px", borderRadius: "8px", marginBottom: "14px" }}>{err}</div>}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        {tab === "announcement" ? (
          <form onSubmit={sendAnnouncement}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Send To</label>
            <select style={inp} value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="student">All Students</option>
              <option value="teacher">All Teachers</option>
              <option value="all">Everyone</option>
            </select>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Title *</label>
            <input style={inp} placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Message *</label>
            <textarea style={{ ...inp, height: "120px", resize: "vertical" }} placeholder="Write your announcement..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <button type="submit" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>📢 Send Announcement</button>
          </form>
        ) : (
          <form onSubmit={sendExam}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Subject *</label>
            <input style={inp} placeholder="Subject name" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Exam Date *</label>
            <input style={inp} type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} required />
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" }}>Custom Message (optional)</label>
            <textarea style={{ ...inp, height: "100px", resize: "vertical" }} placeholder="Optional custom message..." value={examForm.message} onChange={e => setExamForm({ ...examForm, message: e.target.value })} />
            <button type="submit" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>📖 Send Exam Reminder</button>
          </form>
        )}
      </div>
    </Layout>
  );
};
