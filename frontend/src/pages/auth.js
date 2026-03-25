import { useState } from "react";
import { useAuthStore } from "../store/authStore";


export default function Auth({ defaultTab = "login", onSuccess, onBack }) {
  const { login, register } = useAuthStore();
  const [tab, setTab] = useState(defaultTab);
  const [toast, setToast] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPw, setLoginShowPw] = useState(false);

  // Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regShowPw, setRegShowPw] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      const user = await login({
        email: loginEmail,
        password: loginPassword,
      });

      showToast("Login successful!");
      onSuccess?.(user);

    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirm) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (regPassword !== regConfirm) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      showToast("Account created!");
      setTab("login");

    } catch (err) {

      showToast(err.message, "error");
    }
  };
  const focus = (e) => (e.target.style.borderColor = "#C9993A");
  const blur = (e) => (e.target.style.borderColor = "rgba(28,26,22,0.12)");

  const s = {
    page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" },
    nav: { background: "rgba(247,243,236,0.96)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    backBtn: { background: "transparent", border: "none", color: "#8A8278", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 },
    body: { flex: 1, display: "flex" },
    // Left panel
    left: { width: "45%", background: "linear-gradient(160deg,#1C1A16 0%,#3A2510 55%,#7A5C35 100%)", padding: "60px 56px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" },
    leftBg: { position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(45deg,#C9993A 0,#C9993A 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px", pointerEvents: "none" },
    leftIcon: { position: "absolute", right: -20, bottom: -20, fontFamily: "'Playfair Display', serif", fontSize: 240, color: "rgba(247,243,236,0.04)", lineHeight: 1 },
    leftTag: { fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 16 },
    leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,3vw,52px)", fontWeight: 300, color: "#F7F3EC", lineHeight: 1.1, marginBottom: 20 },
    leftSub: { fontSize: 13, color: "rgba(247,243,236,0.55)", lineHeight: 1.8, marginBottom: 40, maxWidth: 320 },
    features: { display: "flex", flexDirection: "column", gap: 14 },
    feature: { display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(247,243,236,0.7)" },
    featureDot: { width: 6, height: 6, background: "#C9993A", borderRadius: "50%", flexShrink: 0 },
    // Right panel
    right: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" },
    card: { width: "100%", maxWidth: 440 },
    cardTag: { fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 10 },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, color: "#1C1A16", marginBottom: 6 },
    cardSub: { fontSize: 13, color: "#8A8278", marginBottom: 28 },
    tabs: { display: "flex", borderBottom: "1px solid rgba(28,26,22,0.1)", marginBottom: 28 },
    tab: (active) => ({ background: "transparent", border: "none", borderBottom: `2px solid ${active ? "#C9993A" : "transparent"}`, marginBottom: -1, padding: "10px 24px", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#1C1A16" : "#8A8278", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }),
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    field: { marginBottom: 18 },
    label: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 7, fontWeight: 500 },
    input: { width: "100%", border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "11px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", boxSizing: "border-box", background: "#fff" },
    inputWrap: { position: "relative" },
    eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8A8278", fontSize: 15, padding: 0, lineHeight: 1 },
    btnPrimary: { width: "100%", background: "#1C1A16", color: "#F7F3EC", border: "none", padding: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, transition: "all .2s" },
    divider: { display: "flex", alignItems: "center", gap: 14, margin: "22px 0", color: "#8A8278", fontSize: 12 },
    divLine: { flex: 1, height: 1, background: "rgba(28,26,22,0.1)" },
    btnGoogle: { width: "100%", background: "#fff", color: "#1C1A16", border: "1.5px solid rgba(28,26,22,0.12)", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
    switchText: { textAlign: "center", fontSize: 13, color: "#8A8278", marginTop: 22 },
    switchLink: { color: "#C9993A", cursor: "pointer", fontWeight: 600 },
    forgotLink: { background: "none", border: "none", color: "#C9993A", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, padding: 0, float: "right", marginTop: 6 },
    // Modal
    overlay: { position: "fixed", inset: 0, background: "rgba(28,26,22,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#fff", borderRadius: 4, padding: 40, maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" },
    modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 8 },
    modalSub: { fontSize: 13, color: "#8A8278", marginBottom: 22, lineHeight: 1.7 },
    modalRow: { display: "flex", gap: 12, marginTop: 18 },
    btnGhost: { flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: 11, fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
  };

  return (
    <div style={s.page}>
      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <button style={s.backBtn} onClick={onBack}>← Back to Home</button>
      </nav>

      <div style={s.body}>
        {/* LEFT PANEL */}
        <div style={s.left}>
          <div style={s.leftBg} />
          <div style={s.leftIcon}>❖</div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={s.leftTag}>✦ LuxeStay</p>
            <h2 style={s.leftTitle}>Experience<br /><em style={{ color: "#E8D5A3" }}>world-class</em><br />hospitality</h2>
            <p style={s.leftSub}>Join thousands of guests who have discovered the art of luxury travel with LuxeStay.</p>
            <div style={s.features}>
              {["Exclusive member rates & early access", "Free cancellation on all bookings", "24/7 concierge & butler service", "Loyalty points on every stay"].map((f) => (
                <div key={f} style={s.feature}><div style={s.featureDot} />{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={s.right}>
          <div style={s.card}>
            <p style={s.cardTag}>✦ Welcome</p>
            <h1 style={s.cardTitle}>{tab === "login" ? "Sign In" : "Create Account"}</h1>
            <p style={s.cardSub}>{tab === "login" ? "Welcome back! Please sign in to continue." : "Join LuxeStay and start your luxury journey."}</p>

            {/* TABS */}
            <div style={s.tabs}>
              <button style={s.tab(tab === "login")} onClick={() => setTab("login")}>Sign In</button>
              <button style={s.tab(tab === "register")} onClick={() => setTab("register")}>Register</button>
            </div>

            {/* ── LOGIN ── */}
            {tab === "login" && (
              <div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type="email" placeholder="your@email.com"
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    onFocus={focus} onBlur={blur}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <input style={{ ...s.input, paddingRight: 44 }}
                      type={loginShowPw ? "text" : "password"} placeholder="Enter your password"
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={focus} onBlur={blur}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button style={s.eyeBtn} onClick={() => setLoginShowPw(!loginShowPw)}>

                    </button>
                  </div>
                  <button style={s.forgotLink} onClick={() => setShowForgot(true)}>Forgot password?</button>
                </div>
                <button style={s.btnPrimary} onClick={handleLogin}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
                >Sign In</button>
                <div style={s.divider}><div style={s.divLine} /><span>or</span><div style={s.divLine} /></div>
                <button style={s.btnGoogle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F3EC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <span style={{ fontSize: 18, fontWeight: 700 }}>G</span> Continue with Google
                </button>
                <p style={s.switchText}>
                  Don't have an account?{" "}
                  <span style={s.switchLink} onClick={() => setTab("register")}>Register here</span>
                </p>
              </div>
            )}

            {/* ── REGISTER ── */}
            {tab === "register" && (
              <div>
                <div style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Full Name</label>
                    <input style={s.input} placeholder="John Doe"
                      value={regName} onChange={(e) => setRegName(e.target.value)}
                      onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Phone Number</label>
                    <input style={s.input} type="tel" placeholder="+1 234 567 890"
                      value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                      onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type="email" placeholder="your@email.com"
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    onFocus={focus} onBlur={blur} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <input style={{ ...s.input, paddingRight: 44 }}
                      type={regShowPw ? "text" : "password"} placeholder="At least 6 characters"
                      value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      onFocus={focus} onBlur={blur} />
                    <button style={s.eyeBtn} onClick={() => setRegShowPw(!regShowPw)}>

                    </button>
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Confirm Password</label>
                  <input style={s.input} type="password" placeholder="Re-enter your password"
                    value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    onFocus={focus} onBlur={blur}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()} />
                </div>
                <button style={s.btnPrimary} onClick={handleRegister}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
                >Create Account</button>
                <p style={s.switchText}>
                  Already have an account?{" "}
                  <span style={s.switchLink} onClick={() => setTab("login")}>Sign in here</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );

}
