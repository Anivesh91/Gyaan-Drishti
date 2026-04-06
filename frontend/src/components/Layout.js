import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#e8ecf0";
const SHADOW_RAISED = "8px 8px 18px #c5cad2, -8px -8px 18px #ffffff";
const SHADOW_SM = "4px 4px 10px #c5cad2, -4px -4px 10px #ffffff";
const SHADOW_INSET = "inset 4px 4px 10px #c5cad2, inset -4px -4px 10px #ffffff";
const ACCENT = "#667eea";
const ACCENT2 = "#764ba2";
const RADIUS = "16px";

// Dark sidebar tokens
const SIDEBAR_BG = "#1a1d2e";
const SIDEBAR_ITEM_ACTIVE_BG = "rgba(102,126,234,0.18)";
const SIDEBAR_ITEM_ACTIVE_SHADOW = "inset 3px 3px 8px rgba(0,0,0,0.35), inset -2px -2px 6px rgba(255,255,255,0.04)";

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
    try { const res = await API.get("/notifications"); setUnread(res.data.unread); } catch {}
  };

  const fetchPending = async () => {
    try { const res = await API.get("/users/pending"); setPendingCount(res.data.count || 0); } catch {}
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const studentLinks = [
    { path: "/student/dashboard", label: "🏠", text: "Dashboard" },
    { path: "/student/attendance", label: "📅", text: "My Attendance" },
    { path: "/student/marks", label: "📝", text: "My Marks" },
    { path: "/student/notifications", label: "🔔", text: "Notifications" },
    { path: "/student/profile", label: "👤", text: "Profile" },
  ];

  const teacherLinks = [
    { path: "/teacher/dashboard", label: "🏠", text: "Dashboard" },
    { path: "/teacher/mark-attendance", label: "📅", text: "Mark Attendance" },
    { path: "/teacher/attendance", label: "📋", text: "View Attendance" },
    { path: "/teacher/enter-marks", label: "📝", text: "Enter Marks" },
    { path: "/teacher/marks", label: "📊", text: "View Marks" },
    { path: "/teacher/announcements", label: "📢", text: "Announcements" },
    { path: "/teacher/profile", label: "👤", text: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin/dashboard", label: "🏠", text: "Dashboard" },
    { path: "/admin/pending", label: "⏳", text: "Pending Approvals", badge: pendingCount },
    { path: "/admin/users", label: "👥", text: "Manage Users" },
    { path: "/admin/add-user", label: "➕", text: "Add User" },
    { path: "/admin/announcements", label: "📢", text: "Announcements" },
    { path: "/admin/profile", label: "👤", text: "Profile" },
  ];

  const links = user?.role === "student" ? studentLinks : user?.role === "teacher" ? teacherLinks : adminLinks;
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? "248px" : "0",
        background: SIDEBAR_BG,
        transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        boxShadow: "6px 0 24px rgba(0,0,0,0.25)",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px",
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "900", color: "white", fontSize: "15px",
              boxShadow: "0 4px 14px rgba(102,126,234,0.5)",
              flexShrink: 0,
            }}>GD</div>
            <div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "0.5px" }}>GYAAN DRISHTI</div>
              <div style={{
                color: ACCENT, fontSize: "11px", fontWeight: "700",
                textTransform: "uppercase", letterSpacing: "1px",
                background: "rgba(102,126,234,0.15)",
                padding: "2px 8px", borderRadius: "20px", marginTop: "3px",
                display: "inline-block",
              }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px" }}>
          {links.map(link => {
            const active = isActive(link.path);
            return (
              <Link key={link.path} to={link.path} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: "12px", marginBottom: "6px",
                color: active ? "white" : "rgba(255,255,255,0.55)",
                background: active ? SIDEBAR_ITEM_ACTIVE_BG : "transparent",
                boxShadow: active ? SIDEBAR_ITEM_ACTIVE_SHADOW : "none",
                textDecoration: "none", fontSize: "13.5px", fontWeight: active ? "700" : "500",
                borderLeft: `3px solid ${active ? ACCENT : "transparent"}`,
                transition: "all 0.2s ease",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>{link.label}</span>
                  <span>{link.text}</span>
                  {link.text === "Notifications" && unread > 0 && (
                    <span style={{
                      background: "#e53e3e", color: "white",
                      borderRadius: "10px", padding: "1px 6px",
                      fontSize: "10px", fontWeight: "800",
                      boxShadow: "0 2px 6px rgba(229,62,62,0.5)",
                    }}>{unread}</span>
                  )}
                </span>
                {link.badge > 0 && (
                  <span style={{
                    background: "linear-gradient(135deg,#ed8936,#dd6b20)",
                    color: "white", borderRadius: "10px", padding: "2px 8px",
                    fontSize: "10px", fontWeight: "800",
                    boxShadow: "0 2px 6px rgba(237,137,54,0.5)",
                  }}>{link.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{
          padding: "16px 16px 20px",
          position: "absolute", bottom: 0,
          width: "248px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: SIDEBAR_BG,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            {user?.avatar
              ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${ACCENT}`, boxShadow: `0 0 8px rgba(102,126,234,0.4)` }} />
              : <div style={{
                  width: "34px", height: "34px",
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white", fontSize: "14px",
                  fontWeight: "800", flexShrink: 0,
                  boxShadow: "0 0 10px rgba(102,126,234,0.4)",
                }}>{user?.name?.[0]?.toUpperCase()}</div>
            }
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontSize: "13px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Logged in</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "10px",
            background: "rgba(229,62,62,0.12)",
            border: "1px solid rgba(229,62,62,0.25)",
            color: "#fc8181", borderRadius: "10px",
            cursor: "pointer", fontSize: "13px", fontWeight: "700",
            letterSpacing: "0.3px",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,62,62,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(229,62,62,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >🚪 Logout</button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG }}>

        {/* Topbar */}
        <div style={{
          background: BG,
          padding: "0 28px",
          height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
          position: "relative", zIndex: 5,
        }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: BG,
            border: "none",
            width: "42px", height: "42px",
            borderRadius: "12px",
            boxShadow: SHADOW_SM,
            cursor: "pointer", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "box-shadow 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = SHADOW_INSET}
            onMouseLeave={e => e.currentTarget.style.boxShadow = SHADOW_SM}
          >☰</button>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {user?.role === "admin" && pendingCount > 0 && (
              <Link to="/admin/pending" style={{
                background: "linear-gradient(135deg,#ed8936,#dd6b20)",
                color: "white", padding: "6px 14px", borderRadius: "20px",
                fontSize: "12px", fontWeight: "700", textDecoration: "none",
                boxShadow: "0 4px 12px rgba(237,137,54,0.4)",
              }}>⏳ {pendingCount} Pending</Link>
            )}
            <span style={{
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "white", padding: "5px 12px", borderRadius: "20px",
              fontSize: "11px", fontWeight: "800", textTransform: "uppercase",
              letterSpacing: "0.8px",
              boxShadow: "0 4px 12px rgba(102,126,234,0.35)",
            }}>{user?.role}</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#2d3436" }}>{user?.name}</span>
            {user?.avatar
              ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${ACCENT}`, boxShadow: SHADOW_SM }} />
              : <div style={{
                  width: "38px", height: "38px",
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white", fontSize: "15px", fontWeight: "800",
                  boxShadow: "0 4px 14px rgba(102,126,234,0.4)",
                }}>{user?.name?.[0]?.toUpperCase()}</div>
            }
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;