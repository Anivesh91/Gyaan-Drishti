import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchUnread();
    if (user?.role === "admin") fetchPending();
    const interval = setInterval(() => {
      fetchUnread();
      if (user?.role === "admin") fetchPending();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnread = async () => {
    try {
      const res = await API.get("/notifications");
      setUnread(res.data.unread);
    } catch {}
  };

  const fetchPending = async () => {
    try {
      const res = await API.get("/users/pending");
      setPendingCount(res.data.count || 0);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const studentLinks = [
    { path: "/student/dashboard", label: "🏠 Dashboard" },
    { path: "/student/attendance", label: "📅 My Attendance" },
    { path: "/student/marks", label: "📝 My Marks" },
    { path: "/student/notifications", label: "🔔 Notifications" },
    { path: "/student/profile", label: "👤 Profile" },
  ];

  const teacherLinks = [
    { path: "/teacher/dashboard", label: "🏠 Dashboard" },
    { path: "/teacher/mark-attendance", label: "📅 Mark Attendance" },
    { path: "/teacher/attendance", label: "📋 View Attendance" },
    { path: "/teacher/enter-marks", label: "📝 Enter Marks" },
    { path: "/teacher/marks", label: "📊 View Marks" },
    { path: "/teacher/announcements", label: "📢 Announcements" },
    { path: "/teacher/profile", label: "👤 Profile" },
  ];

  const adminLinks = [
    { path: "/admin/dashboard", label: "🏠 Dashboard" },
    { path: "/admin/pending", label: "⏳ Pending Approvals", badge: pendingCount },
    { path: "/admin/users", label: "👥 Manage Users" },
    { path: "/admin/add-user", label: "➕ Add User" },
    { path: "/admin/announcements", label: "📢 Announcements" },
    { path: "/admin/profile", label: "👤 Profile" },
  ];

  const links = user?.role === "student" ? studentLinks : user?.role === "teacher" ? teacherLinks : adminLinks;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7fafc" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? "240px" : "0", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", transition: "width 0.3s", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "14px" }}>GD</div>
            <div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "14px" }}>GYAAN DRISHTI</div>
              <div style={{ color: "#888", fontSize: "11px", textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: "16px 8px" }}>
          {links.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 12px", borderRadius: "8px", marginBottom: "4px",
              color: location.pathname === link.path ? "white" : "#aaa",
              background: location.pathname === link.path ? "rgba(102,126,234,0.3)" : "transparent",
              textDecoration: "none", fontSize: "13px", fontWeight: "600",
              borderLeft: location.pathname === link.path ? "3px solid #667eea" : "3px solid transparent",
            }}>
              <span>
                {link.label}
                {link.label.includes("Notifications") && unread > 0 && (
                  <span style={{ background: "#e53e3e", color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", marginLeft: "6px" }}>{unread}</span>
                )}
              </span>
              {/* Pending approvals badge */}
              {link.badge > 0 && (
                <span style={{ background: "#ed8936", color: "white", borderRadius: "10px", padding: "1px 7px", fontSize: "10px", fontWeight: "800", flexShrink: 0 }}>{link.badge}</span>
              )}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px", position: "absolute", bottom: 0, width: "208px" }}>
          <div style={{ color: "#aaa", fontSize: "12px", marginBottom: "8px" }}>👤 {user?.name}</div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "8px", background: "rgba(229,62,62,0.2)", border: "1px solid rgba(229,62,62,0.4)", color: "#fc8181", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ background: "white", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 10px rgba(0,0,0,0.08)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: "4px" }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user?.role === "admin" && pendingCount > 0 && (
              <Link to="/admin/pending" style={{ background: "#ed8936", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
                ⏳ {pendingCount} Pending
              </Link>
            )}
            <span style={{ background: "#667eea", color: "white", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>{user?.role}</span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>{user?.name}</span>
          </div>
        </div>
        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;