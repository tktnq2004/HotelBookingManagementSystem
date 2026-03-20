import { useState } from "react";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getNextDay() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diff / 86400000));
}

function formatCard(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function Steps({ current }) {
  const steps = ["Guest Info", "Special Requests", "Payment"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#3A7D5A" : active ? "#1C1A16" : "transparent", border: `2px solid ${done ? "#3A7D5A" : active ? "#1C1A16" : "rgba(28,26,22,0.2)"}`, color: done || active ? "#F7F3EC" : "#8A8278", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#1C1A16" : done ? "#3A7D5A" : "#8A8278", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "#3A7D5A" : "rgba(28,26,22,0.12)", margin: "0 16px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Booking({ bookingData, onBack, onSuccess, onLogin, onLogout, onMyBookings, user }) {
  const room = bookingData?.room || {
    id: 1, name: "Superior Room", type: "Standard", price: 120,
    gradient: "linear-gradient(135deg,#2C2318,#6B4F2C)",
  };

  const [step, setStep] = useState(1);
  const [toast, setToast] = useState(null);

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("United States");
  const [idNumber, setIdNumber] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [arrivalTime, setArrivalTime] = useState("2:00 PM – 4:00 PM");
  const [purpose, setPurpose] = useState("Leisure / Vacation");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [checkIn] = useState(bookingData?.checkIn || getToday());
  const [checkOut] = useState(bookingData?.checkOut || getNextDay());
  const [guests] = useState(bookingData?.guests || "2");

  const nights = calcNights(checkIn, checkOut);
  const subtotal = room.price * Math.max(nights, 1);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const validateStep1 = () => {
    if (!firstName || !lastName) { showToast("Please enter your full name", "error"); return false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showToast("Please enter a valid email", "error"); return false; }
    if (!phone) { showToast("Please enter your phone number", "error"); return false; }
    if (!idNumber) { showToast("Please enter your ID / Passport number", "error"); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) { showToast("Please enter a valid card number", "error"); return false; }
    if (!cardExpiry) { showToast("Please enter card expiry date", "error"); return false; }
    if (!cardCvv || cardCvv.length < 3) { showToast("Please enter CVV", "error"); return false; }
    if (!cardName) { showToast("Please enter cardholder name", "error"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleConfirm = () => {
    if (!validateStep3()) return;
    const ref = "LS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    onSuccess?.({ ref, room, checkIn, checkOut, guests, nights, total, firstName, lastName, email });
  };

  const s = {
    page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    backBtn: { background: "transparent", border: "none", color: "#8A8278", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    navLinks: { display: "flex", alignItems: "center", gap: 16 },
    navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer", fontWeight: 400 },
    btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.3)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
    btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    body: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, padding: "48px", maxWidth: 1200, margin: "0 auto" },
    formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.08)" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 },
    formGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 },
    formGroupFull: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20, gridColumn: "1 / -1" },
    label: { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", fontWeight: 500 },
    input: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", transition: "border-color .2s" },
    select: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" },
    textarea: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", resize: "vertical", minHeight: 90 },
    btnRow: { display: "flex", gap: 12, marginTop: 8 },
    btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, transition: "all .2s" },
    btnGhost: { flex: 1, background: "transparent", color: "#8A8278", border: "1.5px solid rgba(28,26,22,0.15)", padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
    cardVisual: { background: "linear-gradient(135deg,#1C1A16,#7A5C35)", borderRadius: 12, padding: 24, color: "#F7F3EC", marginBottom: 20, position: "relative", overflow: "hidden" },
    cardChip: { width: 36, height: 28, background: "#C9993A", borderRadius: 4, marginBottom: 20 },
    cardNumber: { fontFamily: "monospace", fontSize: 18, letterSpacing: "3px", marginBottom: 16 },
    cardInfo: { display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6 },
    mockBadge: { background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: 3, padding: "10px 14px", fontSize: 11, color: "#3A7D5A", marginBottom: 20 },
    summary: { background: "#fff", border: "1px solid rgba(28,26,22,0.1)", borderRadius: 4, padding: 28, position: "sticky", top: 84, height: "fit-content" },
    summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, marginBottom: 20 },
    roomThumb: { height: 80, background: room.gradient, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontFamily: "'Playfair Display', serif", fontSize: 32, color: "rgba(247,243,236,0.15)" },
    roomName: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, marginBottom: 4 },
    roomType: { fontSize: 11, color: "#8A8278", marginBottom: 20 },
    summaryLine: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8A8278", padding: "8px 0", borderBottom: "1px solid rgba(28,26,22,0.06)" },
    summaryTotal: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 0" },
    totalLabel: { fontSize: 13, fontWeight: 600, color: "#1C1A16" },
    totalPrice: { fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#C9993A" },
  };

  const focusStyle = (e) => (e.target.style.borderColor = "#C9993A");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(28,26,22,0.12)");

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={s.navLinks}>
          <button style={s.backBtn} onClick={onBack}>← Back</button>

          {user && <span style={s.navLink} onClick={onMyBookings}>My Bookings</span>}

          {!user ? (
            <>
              <button style={s.btnNavOutline} onClick={() => onLogin?.("login")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Sign In</button>
              <button style={s.btnNav} onClick={() => onLogin?.("register")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
              >Register</button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
              <button style={s.btnNavOutline} onClick={onLogout}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Sign Out</button>
            </div>
          )}
        </div>
      </nav>

      <div style={s.body}>
        <div>
          <Steps current={step} />

          {step === 1 && (
            <div>
              <h2 style={s.formTitle}>Guest Information</h2>
              <div style={s.formGrid}>
                <div style={s.formGroup}><label style={s.label}>First Name</label><input style={s.input} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}><label style={s.label}>Last Name</label><input style={s.input} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}><label style={s.label}>Email Address</label><input style={s.input} type="email" placeholder="john@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}><label style={s.label}>Phone Number</label><input style={s.input} type="tel" placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}>
                  <label style={s.label}>Nationality</label>
                  <select style={s.select} value={nationality} onChange={(e) => setNationality(e.target.value)}>
                    {["United States", "United Kingdom", "Vietnam", "Japan", "South Korea", "Australia", "Canada", "France", "Germany", "Other"].map((n) => (<option key={n}>{n}</option>))}
                  </select>
                </div>
                <div style={s.formGroup}><label style={s.label}>ID / Passport Number</label><input style={s.input} placeholder="Your ID or passport number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} /></div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={onBack}>← Back</button>
                <button style={s.btnPrimary} onClick={handleNext} onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}>Continue →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={s.formTitle}>Special Requests</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Special Notes</label>
                <textarea style={{ ...s.textarea, width: "100%", boxSizing: "border-box", marginTop: 6 }} placeholder="e.g. late check-in, baby crib, high floor..." value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>Estimated Arrival Time</label>
                  <select style={s.select} value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}>
                    {["Before 12:00 PM", "12:00 PM – 2:00 PM", "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM", "After 6:00 PM"].map((t) => (<option key={t}>{t}</option>))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Purpose of Stay</label>
                  <select style={s.select} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    {["Leisure / Vacation", "Business Trip", "Honeymoon", "Family Trip", "Anniversary", "Other"].map((p) => (<option key={p}>{p}</option>))}
                  </select>
                </div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={() => setStep(1)}>← Back</button>
                <button style={s.btnPrimary} onClick={handleNext} onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={s.formTitle}>Payment Details</h2>
              <div style={s.mockBadge}>🔒 This is a mock payment simulation. No real transaction will be processed.</div>
              <div style={s.cardVisual}>
                <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.05 }}>◯</div>
                <div style={s.cardChip} />
                <div style={s.cardNumber}>{cardNumber || "•••• •••• •••• ••••"}</div>
                <div style={s.cardInfo}><span>{cardName || "CARDHOLDER NAME"}</span><span>{cardExpiry || "MM/YY"}</span></div>
              </div>
              <div style={s.formGrid}>
                <div style={s.formGroupFull}><label style={s.label}>Card Number</label><input style={s.input} placeholder="1234 5678 9012 3456" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}><label style={s.label}>Expiry Date</label><input style={s.input} placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4); setCardExpiry(v); }} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={s.formGroup}><label style={s.label}>CVV</label><input style={s.input} placeholder="•••" maxLength={3} type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))} onFocus={focusStyle} onBlur={blurStyle} /></div>
                <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}><label style={s.label}>Cardholder Name</label><input style={s.input} placeholder="JOHN DOE" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} onFocus={focusStyle} onBlur={blurStyle} /></div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={() => setStep(2)}>← Back</button>
                <button style={s.btnPrimary} onClick={handleConfirm} onMouseEnter={(e) => (e.currentTarget.style.background = "#3A7D5A")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}>✓ Confirm Booking</button>
              </div>
            </div>
          )}
        </div>

        <div style={s.summary}>
          <div style={s.summaryTitle}>Booking Summary</div>
          <div style={s.roomThumb}>❖</div>
          <div style={s.roomName}>{room.name}</div>
          <div style={s.roomType}>{room.type} · {guests} guest{guests > 1 ? "s" : ""}</div>
          <div style={s.summaryLine}><span>Check-in</span><span>{checkIn}</span></div>
          <div style={s.summaryLine}><span>Check-out</span><span>{checkOut}</span></div>
          <div style={s.summaryLine}><span>Nights</span><span>{Math.max(nights, 1)}</span></div>
          <div style={s.summaryLine}><span>Price / night</span><span>${room.price}</span></div>
          <div style={s.summaryLine}><span>Subtotal</span><span>${subtotal}</span></div>
          <div style={s.summaryLine}><span>Taxes (10%)</span><span>${tax}</span></div>
          <div style={s.summaryTotal}>
            <span style={s.totalLabel}>Total</span>
            <span style={s.totalPrice}>${total}</span>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}