import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#e8ecf0";
const SHADOW_RAISED = "10px 10px 20px #c5cad2, -10px -10px 20px #ffffff";
const SHADOW_SM = "5px 5px 12px #c5cad2, -5px -5px 12px #ffffff";
const SHADOW_INSET = "inset 5px 5px 12px #c5cad2, inset -5px -5px 12px #ffffff";
const SHADOW_BTN = "5px 5px 14px #c5cad2, -3px -3px 10px #ffffff";
const ACCENT = "#667eea";
const RADIUS = "16px";
const RADIUS_SM = "12px";

const neo = {
  page: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: BG,
    padding: "20px",
  },
  card: {
    background: BG,
    borderRadius: "24px",
    padding: "44px 40px",
    width: "100%", maxWidth: "420px",
    boxShadow: SHADOW_RAISED,
  },
  logo: {
    width: "60px", height: "60px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    borderRadius: "18px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "900", color: "white", fontSize: "20px",
    margin: "0 auto 14px",
    boxShadow: "6px 6px 14px rgba(102,126,234,0.4), -3px -3px 8px rgba(255,255,255,0.9)",
  },
  title: {
    fontSize: "22px", fontWeight: "900", color: "#1a1d2e",
    textAlign: "center", margin: "0 0 4px", letterSpacing: "0.3px",
  },
  sub: {
    fontSize: "13px", color: "#636e72",
    textAlign: "center", margin: "0 0 28px",
  },
  label: {
    display: "block", fontSize: "12px", fontWeight: "700",
    color: "#636e72", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px",
  },
  inputWrap: { marginBottom: "18px" },
  input: {
    width: "100%", padding: "13px 16px",
    background: BG, border: "none",
    boxShadow: SHADOW_INSET,
    borderRadius: RADIUS_SM,
    fontSize: "14px", color: "#2d3436",
    outline: "none", boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white", border: "none",
    borderRadius: RADIUS_SM,
    fontSize: "15px", fontWeight: "800",
    cursor: "pointer", marginTop: "6px",
    boxShadow: "6px 6px 14px rgba(102,126,234,0.45), -3px -3px 8px rgba(255,255,255,0.9)",
    letterSpacing: "0.3px",
    transition: "all 0.2s ease",
  },
  err: {
    background: BG,
    boxShadow: "inset 3px 3px 8px rgba(229,62,62,0.15), inset -3px -3px 8px #ffffff",
    borderLeft: "4px solid #e53e3e",
    color: "#e53e3e", padding: "12px 16px",
    borderRadius: RADIUS_SM, fontSize: "13px", marginBottom: "16px",
    fontWeight: "600",
  },
  suc: {
    background: BG,
    boxShadow: "inset 3px 3px 8px rgba(72,187,120,0.15), inset -3px -3px 8px #ffffff",
    borderLeft: "4px solid #48bb78",
    color: "#276749", padding: "12px 16px",
    borderRadius: RADIUS_SM, fontSize: "13px", marginBottom: "16px",
    fontWeight: "600",
  },
  link: { color: ACCENT, fontWeight: "700", textDecoration: "none" },
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setPending(false); setError("");
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    const res = await login(form.email, form.password);
    if (res.success) {
      if (res.user.role === "student") navigate("/student/dashboard");
      else if (res.user.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/admin/dashboard");
    } else if (res.pending) {
      setPending(true);
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={neo.page}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: "-10%", left: "-5%", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={neo.card}>
        <div style={neo.logo}>GD</div>
        <h1 style={neo.title}>GYAAN DRISHTI</h1>
        <p style={neo.sub}>Student Performance Analytics System</p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #c5cad2)" }} />
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#636e72" }}>Welcome Back 👋</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #c5cad2)" }} />
        </div>

        {error && <div style={neo.err}>⚠️ {error}</div>}

        {pending && (
          <div style={{
            background: BG,
            boxShadow: "inset 4px 4px 10px rgba(237,137,54,0.12), inset -4px -4px 10px #ffffff",
            borderLeft: "4px solid #ed8936",
            padding: "16px", borderRadius: RADIUS_SM, marginBottom: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>⏳</div>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#744210", marginBottom: "4px" }}>Account Pending Approval</div>
            <div style={{ fontSize: "12px", color: "#975a16", opacity: 0.9 }}>Your registration is awaiting admin approval.</div>
          </div>
        )}

        <form onSubmit={submit}>
          <div style={neo.inputWrap}>
            <label style={neo.label}>Email</label>
            <input style={neo.input} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={neo.inputWrap}>
            <label style={neo.label}>Password</label>
            <input style={neo.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "20px" }}>
            <Link to="/forgot-password" style={{ ...neo.link, fontSize: "13px" }}>Forgot Password?</Link>
          </div>
          <button style={neo.btn} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >{loading ? "Logging in..." : "Login →"}</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#636e72" }}>
          No account? <Link to="/register" style={neo.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};

// ── Register ──────────────────────────────────────────────────────────────────
export const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student", rollNumber: "", subject: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminExists, setAdminExists] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/check-admin")
      .then(r => setAdminExists(r.data.adminExists))
      .catch(() => setAdminExists(true));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Fill required fields."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }
    if (form.password.length < 6) { setError("Password min 6 characters."); return; }
    const res = await register(form);
    if (res.success) {
      if (res.pending) setSuccess("pending");
      else { setSuccess("Registered! Redirecting..."); setTimeout(() => navigate("/login"), 1500); }
    } else setError(res.message);
  };

  const gridInput = { ...neo.input, marginBottom: 0 };

  return (
    <div style={neo.page}>
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ ...neo.card, maxWidth: "480px" }}>
        <div style={neo.logo}>GD</div>
        <h1 style={neo.title}>Create Account 🎓</h1>
        <p style={neo.sub}>Join Gyaan Drishti today</p>

        {error && <div style={neo.err}>⚠️ {error}</div>}

        {success === "pending" ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: "56px", marginBottom: "14px" }}>⏳</div>
            <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "18px", fontWeight: "800" }}>Registration Submitted!</h3>
            <p style={{ color: "#636e72", fontSize: "13px", lineHeight: "1.7", margin: "0 0 20px" }}>
              Your account is <strong>pending admin approval</strong>.<br />
              You'll be notified once the admin approves your request.
            </p>
            <Link to="/login" style={{ ...neo.link, fontSize: "14px" }}>← Back to Login</Link>
          </div>
        ) : success ? (
          <div style={neo.suc}>✅ {success}</div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div>
                <label style={neo.label}>Full Name *</label>
                <input style={gridInput} placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={neo.label}>Role *</label>
                <select style={gridInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  {!adminExists && <option value="admin">Admin (First Setup)</option>}
                </select>
                {!adminExists && <p style={{ fontSize: "11px", color: "#ed8936", marginTop: "6px", fontWeight: "700" }}>⚠️ No admin found.</p>}
              </div>
            </div>

            <div style={neo.inputWrap}>
              <label style={neo.label}>Email *</label>
              <input style={neo.input} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            {form.role === "student" && (
              <div style={neo.inputWrap}>
                <label style={neo.label}>Roll Number</label>
                <input style={neo.input} placeholder="Roll number" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
            )}
            {form.role === "teacher" && (
              <div style={neo.inputWrap}>
                <label style={neo.label}>Subject</label>
                <input style={neo.input} placeholder="Your subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
            )}

            <div style={neo.inputWrap}>
              <label style={neo.label}>Phone</label>
              <input style={neo.input} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div>
                <label style={neo.label}>Password *</label>
                <input style={gridInput} type="password" placeholder="Min 6 chars" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label style={neo.label}>Confirm *</label>
                <input style={gridInput} type="password" placeholder="Re-enter" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            </div>

            <button style={neo.btn} type="submit"
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >Create Account →</button>
          </form>
        )}

        {!success && (
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#636e72" }}>
            Have account? <Link to="/login" style={neo.link}>Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

// ── Forgot Password ───────────────────────────────────────────────────────────
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
    <div style={neo.page}>
      <div style={{ ...neo.card, textAlign: "center" }}>
        <div style={neo.logo}>🔐</div>
        <h2 style={neo.title}>Forgot Password?</h2>
        <p style={neo.sub}>Enter your email to get a reset link</p>
        {msg && <div style={neo.suc}>{msg}</div>}
        {err && <div style={neo.err}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ ...neo.inputWrap, textAlign: "left" }}>
            <label style={neo.label}>Email Address</label>
            <input style={neo.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button style={neo.btn} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >{loading ? "Sending..." : "Send Reset Link"}</button>
        </form>
        <Link to="/login" style={{ ...neo.link, display: "block", marginTop: "20px", fontSize: "14px" }}>← Back to Login</Link>
      </div>
    </div>
  );
};

// ── Reset Password ────────────────────────────────────────────────────────────
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
    <div style={neo.page}>
      <div style={{ ...neo.card, textAlign: "center" }}>
        <div style={neo.logo}>🔑</div>
        <h2 style={neo.title}>Reset Password</h2>
        <p style={neo.sub}>Enter your new password</p>
        {msg && <div style={neo.suc}>{msg}</div>}
        {err && <div style={neo.err}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ ...neo.inputWrap, textAlign: "left" }}>
            <label style={neo.label}>New Password</label>
            <input style={neo.input} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div style={{ ...neo.inputWrap, textAlign: "left" }}>
            <label style={neo.label}>Confirm Password</label>
            <input style={neo.input} type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button style={neo.btn} type="submit"
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >Reset Password</button>
        </form>
      </div>
    </div>
  );
};