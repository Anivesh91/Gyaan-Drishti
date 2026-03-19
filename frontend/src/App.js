import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import { Login, Register, ForgotPassword, ResetPassword } from "./pages/auth/AuthPages";

// Student Pages
import { StudentDashboard, StudentAttendance, StudentMarks, NotificationsPage, ProfilePage } from "./pages/student/StudentPages";

// Teacher Pages
import { TeacherDashboard, MarkAttendance, ViewAttendanceTeacher, EnterMarks, ViewMarksTeacher, TeacherAnnouncements } from "./pages/teacher/TeacherPages";

// Admin Pages
import { AdminDashboard, ManageUsers, AddUser, AdminAnnouncements } from "./pages/admin/AdminPages";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── AUTH ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── STUDENT ── */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/marks" element={<ProtectedRoute allowedRoles={["student"]}><StudentMarks /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={["student"]}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><ProfilePage /></ProtectedRoute>} />

          {/* ── TEACHER ── */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/mark-attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><MarkAttendance /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><ViewAttendanceTeacher /></ProtectedRoute>} />
          <Route path="/teacher/enter-marks" element={<ProtectedRoute allowedRoles={["teacher"]}><EnterMarks /></ProtectedRoute>} />
          <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={["teacher"]}><ViewMarksTeacher /></ProtectedRoute>} />
          <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAnnouncements /></ProtectedRoute>} />
          <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={["teacher"]}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={["teacher"]}><ProfilePage /></ProtectedRoute>} />

          {/* ── ADMIN ── */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/add-user" element={<ProtectedRoute allowedRoles={["admin"]}><AddUser /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><ProfilePage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
