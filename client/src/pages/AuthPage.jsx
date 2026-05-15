import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

/* ─── Styles ─────────────────────────────────────────────────── */
const S = {
  wrap: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", padding: 20,
    background: "radial-gradient(ellipse 80% 60% at 20% 40%,rgba(99,102,241,.14) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 70%,rgba(139,92,246,.1) 0%,transparent 60%),#07090f",
  },
  card: {
    width: "min(420px, 92vw)", borderRadius: 24, padding: "clamp(24px, 6vw, 40px)",
    background: "rgba(255,255,255,.04)",
    backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,.09)",
    boxShadow: "0 0 80px rgba(99,102,241,.1),0 32px 64px rgba(0,0,0,.5)",
    animation: "scaleIn .25s ease",
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    letterSpacing: 1, textTransform: "uppercase",
    color: "#818cf8", marginBottom: 7,
  },
  input: {
    width: "100%", padding: "12px 15px", borderRadius: 11,
    background: "rgba(255,255,255,.05)",
    border: "1.5px solid rgba(255,255,255,.09)",
    color: "#e2e8f0", fontSize: 14, outline: "none",
    fontFamily: "'Inter',sans-serif", transition: "border-color .2s, background .2s",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: 13, borderRadius: 12, border: "none",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff", fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Inter',sans-serif",
    transition: "all .25s", boxShadow: "0 4px 20px rgba(99,102,241,.3)",
  },
  err: {
    fontSize: 13, color: "#f87171", padding: "9px 13px",
    background: "rgba(248,113,113,.08)",
    border: "1px solid rgba(248,113,113,.18)",
    borderRadius: 9, marginBottom: 14,
  },
  success: {
    fontSize: 13, color: "#34d399", padding: "9px 13px",
    background: "rgba(52,211,153,.08)",
    border: "1px solid rgba(52,211,153,.2)",
    borderRadius: 9, marginBottom: 14,
  },
  link: { color: "#818cf8", cursor: "pointer", fontWeight: 600 },
  divider: { height: 1, background: "rgba(255,255,255,.07)", marginBottom: 28 },
};

/* ─── Field Component ────────────────────────────────────────── */
function Field({ label, type, placeholder, value, onChange, onSubmit }) {
  const handleFocus = (e) => {
    e.target.style.borderColor = "rgba(99,102,241,.6)";
    e.target.style.background = "rgba(99,102,241,.07)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,.09)";
    e.target.style.background = "rgba(255,255,255,.05)";
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      <input
        style={S.input}
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={e => e.key === "Enter" && onSubmit()}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
      />
    </div>
  );
}

/* ─── Brand Header (shared across all modes) ─────────────────── */
function Brand() {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 0 28px rgba(99,102,241,.4)" }}>
        <Icon name="logo" size={24} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd,#f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        learnbot
      </div>
      <div style={{ fontSize: 12, color: "rgba(165,180,252,.45)", marginTop: 4, letterSpacing: 1 }}>
        AI Study Assistant for Engineers
      </div>
    </div>
  );
}

/* ─── Auth Page ──────────────────────────────────────────────── */
export default function AuthPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  // ── Check URL for reset token on load ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset");
    }
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setErr("");
    setSuccess("");
  };

  const submit = useCallback(async () => {
    setErr(""); setSuccess(""); setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email) { setErr("Please enter your email."); setLoading(false); return; }
        const { api } = await import("../utils/api");
        await api.forgot({ email });
        setSuccess("✓ If that email exists, a reset link has been sent. Check your inbox.");
        setLoading(false);
        return;
      }

      if (mode === "reset") {
        if (!newPassword) { setErr("Please enter a new password."); setLoading(false); return; }
        if (newPassword.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
        if (newPassword !== confirmNew) { setErr("Passwords do not match."); setLoading(false); return; }
        const { api } = await import("../utils/api");
        await api.reset(resetToken, { password: newPassword, confirmPassword: confirmNew });
        setSuccess("✓ Password reset successful! You can now sign in.");
        setNewPassword("");
        setConfirmNew("");
        setTimeout(() => {
          setMode("login");
          setSuccess("");
          window.history.replaceState({}, "", window.location.pathname);
        }, 2000);
        setLoading(false);
        return;
      }

      if (mode === "register") {
        if (!name || !email || !password) { setErr("All fields are required."); setLoading(false); return; }
        if (password.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
        if (password !== confirm) { setErr("Passwords do not match."); setLoading(false); return; }
        await register(name, email, password);
        return;
      }

      if (!email || !password) { setErr("Email and password are required."); setLoading(false); return; }
      await login(email, password);

    } catch (e) {
      setErr(e.message || "Something went wrong.");
      setLoading(false);
    }
  }, [mode, name, email, password, confirm, newPassword, confirmNew, resetToken, login, register]);

  const btnLabel = loading ? "Please wait…"
    : mode === "login" ? "Sign In"
      : mode === "register" ? "Create Account"
        : mode === "forgot" ? "Send Reset Link"
          : "Reset Password";

  const heading = mode === "login" ? "Welcome back"
    : mode === "register" ? "Create your account"
      : mode === "forgot" ? "Forgot password?"
        : "Set new password";

  const subtitle = mode === "login" ? "Sign in to continue learning"
    : mode === "register" ? "Join thousands of engineering students"
      : mode === "forgot" ? "Enter your email to receive reset instructions"
        : "Choose a strong password for your account";

  return (
    <div style={S.wrap}>
      <div style={S.card}>

        <Brand />
        <div style={S.divider} />

        <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
          {heading}
        </div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
          {subtitle}
        </div>

        {err && <div style={S.err}>⚠ {err}</div>}
        {success && <div style={S.success}>{success}</div>}

        {mode === "register" && (
          <Field label="Full Name" placeholder="Your full name"
            value={name} onChange={e => setName(e.target.value)} onSubmit={submit} />
        )}

        {(mode === "login" || mode === "register" || mode === "forgot") && (
          <Field label="Email" type="email" placeholder="you@university.edu"
            value={email} onChange={e => setEmail(e.target.value)} onSubmit={submit} />
        )}

        {(mode === "login" || mode === "register") && (
          <Field label="Password" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} onSubmit={submit} />
        )}

        {mode === "register" && (
          <Field label="Confirm Password" type="password" placeholder="Same as above"
            value={confirm} onChange={e => setConfirm(e.target.value)} onSubmit={submit} />
        )}

        {mode === "reset" && (
          <>
            <Field label="New Password" type="password" placeholder="Min. 6 characters"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} onSubmit={submit} />
            <Field label="Confirm New Password" type="password" placeholder="Same as above"
              value={confirmNew} onChange={e => setConfirmNew(e.target.value)} onSubmit={submit} />
          </>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 16, marginTop: -8 }}>
            <span onClick={() => switchMode("forgot")} style={{ ...S.link, fontSize: 12 }}>
              Forgot password?
            </span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{ ...S.btn, opacity: loading ? .7 : 1 }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,.45)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,.3)"; }}
        >
          {btnLabel}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          {mode === "login" && <>Don't have an account?{" "}<span onClick={() => switchMode("register")} style={S.link}>Register free</span></>}
          {mode === "register" && <>Already registered?{" "}<span onClick={() => switchMode("login")} style={S.link}>Sign in</span></>}
          {(mode === "forgot" || mode === "reset") && (
            <span onClick={() => switchMode("login")} style={S.link}>← Back to sign in</span>
          )}
        </div>

      </div>
    </div>
  );
}