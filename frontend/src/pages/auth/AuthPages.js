import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const authCard = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px" },
  card: { background: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  logo: { width: "52px", height: "52px", background: "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "18px", margin: "0 auto 12px" },
  title: { fontSize: "22px", fontWeight: "800", color: "#1a1a2e", textAlign: "center", margin: "0 0 4px" },
  sub: { fontSize: "13px", color: "#888", textAlign: "center", margin: "0 0 24px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "5px" },
  input: { width: "100%", padding: "11px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px" },
  btn: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "4px" },
  err: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#e53e3e", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" },
  suc: { background: "#f0fff4", border: "1px solid #9ae6b4", color: "#276749", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" },
  link: { color: "#667eea", fontWeight: "600", textDecoration: "none" },
};

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Fill all fields."); return; }
    const res = await login(form.email, form.password);
    if (res.success) {
      if (res.user.role === "student") navigate("/student/dashboard");
      else if (res.user.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/admin/dashboard");
    } else setError(res.message);
  };

  return (
    <div style={authCard.container}>
      <div style={authCard.card}>
        <div style={authCard.logo}>GD</div>
        <h1 style={authCard.title}>GYAAN DRISHTI</h1>
        <p style={authCard.sub}>Student Performance Analytics System</p>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>Welcome Back 👋</h2>
        <p style={{ ...authCard.sub, margin: "0 0 20px" }}>Login to your account</p>
        {error && <div style={authCard.err}>{error}</div>}
        <form onSubmit={submit}>
          <label style={authCard.label}>Email</label>
          <input style={authCard.input} type="email" placeholder="Enter email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label style={authCard.label}>Password</label>
          <input style={authCard.input} type="password" placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
            <Link to="/forgot-password" style={authCard.link}>Forgot Password?</Link>
          </div>
          <button style={authCard.btn} type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
          No account? <Link to="/register" style={authCard.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student", rollNumber: "", subject: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Fill required fields."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }
    if (form.password.length < 6) { setError("Password min 6 chars."); return; }
    const res = await register(form);
    if (res.success) { setSuccess("Registered! Redirecting..."); setTimeout(() => navigate("/login"), 1500); }
    else setError(res.message);
  };

  return (
    <div style={authCard.container}>
      <div style={{ ...authCard.card, maxWidth: "460px" }}>
        <div style={authCard.logo}>GD</div>
        <h1 style={authCard.title}>Create Account 🎓</h1>
        <p style={authCard.sub}>Join Gyaan Drishti today</p>
        {error && <div style={authCard.err}>{error}</div>}
        {success && <div style={authCard.suc}>{success}</div>}
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div>
              <label style={authCard.label}>Full Name *</label>
              <input style={authCard.input} placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={authCard.label}>Role *</label>
              <select style={authCard.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <label style={authCard.label}>Email *</label>
          <input style={authCard.input} type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {form.role === "student" && <><label style={authCard.label}>Roll Number</label><input style={authCard.input} placeholder="Roll number" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} /></>}
          {form.role === "teacher" && <><label style={authCard.label}>Subject</label><input style={authCard.input} placeholder="Your subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></>}
          <label style={authCard.label}>Phone</label>
          <input style={authCard.input} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div><label style={authCard.label}>Password *</label><input style={authCard.input} type="password" placeholder="Min 6 chars" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div><label style={authCard.label}>Confirm *</label><input style={authCard.input} type="password" placeholder="Re-enter" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
          </div>
          <button style={authCard.btn} type="submit">Create Account</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Have account? <Link to="/login" style={authCard.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const { forgotPassword, loading } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    const res = await forgotPassword(email);
    if (res.success) setMsg(res.message); else setErr(res.message);
  };

  return (
    <div style={authCard.container}>
      <div style={{ ...authCard.card, textAlign: "center" }}>
        <div style={authCard.logo}>🔐</div>
        <h2 style={authCard.title}>Forgot Password?</h2>
        <p style={authCard.sub}>Enter your email to get a reset link</p>
        {msg && <div style={authCard.suc}>{msg}</div>}
        {err && <div style={authCard.err}>{err}</div>}
        <form onSubmit={submit}>
          <label style={{ ...authCard.label, textAlign: "left" }}>Email Address</label>
          <input style={authCard.input} type="email" placeholder="Registered email" value={email} onChange={e => setEmail(e.target.value)} />
          <button style={authCard.btn} type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
        </form>
        <Link to="/login" style={{ ...authCard.link, display: "block", marginTop: "16px", fontSize: "14px" }}>← Back to Login</Link>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
    const res = await resetPassword(token, form.password);
    if (res.success) { setMsg("Password reset! Redirecting..."); setTimeout(() => navigate("/login"), 1500); }
    else setErr(res.message);
  };

  return (
    <div style={authCard.container}>
      <div style={{ ...authCard.card, textAlign: "center" }}>
        <div style={authCard.logo}>🔑</div>
        <h2 style={authCard.title}>Reset Password</h2>
        <p style={authCard.sub}>Enter your new password</p>
        {msg && <div style={authCard.suc}>{msg}</div>}
        {err && <div style={authCard.err}>{err}</div>}
        <form onSubmit={submit}>
          <label style={{ ...authCard.label, textAlign: "left" }}>New Password</label>
          <input style={authCard.input} type="password" placeholder="Min 6 chars" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <label style={{ ...authCard.label, textAlign: "left" }}>Confirm Password</label>
          <input style={authCard.input} type="password" placeholder="Re-enter" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          <button style={authCard.btn} type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};
