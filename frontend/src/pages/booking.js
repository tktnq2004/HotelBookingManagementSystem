import { useState } from "react";
import bookingService from "../services/booking.service";
import BookingDetails from "./bookingDetails";

const GRADIENTS = [
  "linear-gradient(135deg,#2C2318,#6B4F2C)",
  "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
  "linear-gradient(135deg,#1C1A16,#5C3A18)",
];

function formatCard(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.floor((new Date(checkOut) - new Date(checkIn)) / 86400000));
}

function Steps({ current }) {
  const steps = ["Guest Info", "Payment"];
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

function SuccessModal({ booking, onViewBooking, onClose }) {
  if (!booking) return null;
  const rooms = booking.rooms ?? [];
  const isMulti = rooms.length > 1;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,26,22,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 4, padding: "48px 40px", width: 480, maxWidth: "100%", boxShadow: "0 24px 64px rgba(28,26,22,0.25)", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(58,125,90,0.1)", border: "2px solid rgba(58,125,90,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 24px", color: "#3A7D5A" }}>✓</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, marginBottom: 8 }}>Payment Successful!</div>
        <div style={{ fontSize: 13, color: "#8A8278", marginBottom: 28, lineHeight: 1.6 }}>
          Your booking has been confirmed and saved.
        </div>

        <div style={{ background: "#F7F3EC", borderRadius: 3, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278" }}>Reference</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#C9993A", letterSpacing: "1px" }}>#{booking._id?.slice(-8).toUpperCase()}</span>
          </div>

          {/* Rooms list */}
          {isMulti ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278", marginBottom: 8 }}>
                {rooms.length} Rooms
              </div>
              {rooms.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#1C1A16", padding: "4px 0", borderBottom: i < rooms.length - 1 ? "1px solid rgba(28,26,22,0.06)" : "none" }}>
                  <span>{r.roomTypeName} · #{r.roomNumber}</span>
                  <span style={{ color: "#8A8278" }}>${r.pricePerNight}/night</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#8A8278" }}>Room</span>
              <span style={{ fontSize: 12, color: "#1C1A16" }}>{rooms[0]?.roomTypeName} · #{rooms[0]?.roomNumber}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#8A8278" }}>Stay</span>
            <span style={{ fontSize: 12, color: "#1C1A16" }}>{booking.checkIn?.split("T")[0]} → {booking.checkOut?.split("T")[0]}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(28,26,22,0.08)", marginTop: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C1A16" }}>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#C9993A" }}>${booking.totalPrice?.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontSize: 12, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9993A")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(28,26,22,0.15)")}
          >Close</button>
          <button onClick={onViewBooking}
            style={{ flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "11px", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#C9993A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >View Booking →</button>
        </div>
      </div>
    </div>
  );
}

function toDetailShape(raw, user) {
  return {
    id:        raw._id,
    status:    raw.status,
    createdAt: raw.createdAt,
    customer: {
      name:  user?.name  ?? "—",
      email: user?.email ?? "—",
      phone: user?.phone ?? "—",
    },
    rooms: (raw.rooms ?? []).map((r, i) => ({
      roomId:        r.roomId,
      roomNumber:    r.roomNumber,
      roomTypeName:  r.roomTypeName,
      basePrice:     r.basePrice,
      pricePerNight: r.pricePerNight,
      image:         r.images ?? null,
      gradient:      GRADIENTS[i % GRADIENTS.length],
      appliedRules:  r.appliedRules ? [r.appliedRules] : [],
    })),
    checkIn:    raw.checkIn,
    checkOut:   raw.checkOut,
    nights:     raw.nights,
    guests:     raw.guests,
    totalPrice: raw.totalPrice,
  };
}


export default function Booking({ bookingData, onBack,  onLogin, onLogout, onMyBookings, user }) {
  const isMulti = bookingData?.isMulti === true;
  const selectedRooms = bookingData?.selectedRooms ?? []; 

  const room     = bookingData?.room;
  const roomType = room?.roomTypeId;

  const checkIn  = bookingData?.checkIn;
  const checkOut = bookingData?.checkOut;
  const guests   = bookingData?.guests || 1;
  const nights   = bookingData?.nights || calcNights(checkIn, checkOut);

  // ── Price calculations ────────────────────────────────────────────────────
  let totalPrice = 0;
  let roomLines  = []; // [{label, basePrice, finalPrice, hasDiscount, ruleName}]

  if (isMulti) {
    selectedRooms.forEach(({ room: r, priceInfo }) => {
      const rt        = r.roomTypeId;
      const base      = priceInfo?.basePrice  || rt?.basePrice || 0;
      const final     = priceInfo?.finalPrice || base;
      const perNight  = final;
      const roomTotal = perNight * nights;
      totalPrice += roomTotal;
      roomLines.push({
        roomId:     r._id,
        roomNumber: r.roomNumber,
        typeName:   rt?.name || "Room",
        basePrice:  base,
        finalPrice: final,
        hasDiscount: priceInfo?.hasPricing && final !== base,
        ruleName:   priceInfo?.ruleName || null,
        roomTotal,
      });
    });
  } else {
    const pricePerNight = bookingData?.pricePerNight || roomType?.basePrice || 0;
    const base          = roomType?.basePrice || 0;
    const subtotal      = bookingData?.total || pricePerNight * nights;
    totalPrice          = subtotal;
    roomLines.push({
      roomId:     room?._id,
      roomNumber: room?.roomNumber,
      typeName:   roomType?.name || "Room",
      basePrice:  base,
      finalPrice: pricePerNight,
      hasDiscount: bookingData?.ruleName && pricePerNight !== base,
      ruleName:   bookingData?.ruleName || null,
      roomTotal:  subtotal,
    });
  }

  // ── Form state ────────────────────────────────────────────────────────────
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName,  setLastName]  = useState(user?.name?.split(" ")[1]  || "");
  const [email,     setEmail]     = useState(user?.email || "");
  const [phone,     setPhone]     = useState(user?.phone || "");
  const [cardNumber,  setCardNumber]  = useState("");
  const [cardExpiry,  setCardExpiry]  = useState("");
  const [cardCvv,     setCardCvv]     = useState("");
  const [cardName,    setCardName]    = useState("");

  const [createdBooking, setCreatedBooking] = useState(null);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [detailBooking,  setDetailBooking]  = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleConfirm = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      showToast("Please enter a valid card number", "error"); return;
    }
    if (!cardExpiry) { showToast("Please enter expiry date", "error"); return; }
    if (!cardCvv || cardCvv.length < 3) { showToast("Please enter CVV", "error"); return; }
    if (!cardName)   { showToast("Please enter cardholder name", "error"); return; }

    try {
      setSubmitting(true);

      const roomIds = isMulti
        ? selectedRooms.map(({ room: r }) => r._id)
        : [room._id];

      const res = await bookingService.createBooking({
        rooms:   roomIds,
        checkIn,
        checkOut,
        guests:  Number(guests),
      });

      const raw = res.data.data;
      setCreatedBooking(raw);
      setShowSuccess(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Booking failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBooking = () => {
    setShowSuccess(false);
    setDetailBooking(toDetailShape(createdBooking, user));
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onMyBookings?.();
  };


  const s = {
    page:    { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    nav:     { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo:    { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    backBtn: { background: "transparent", border: "none", color: "#8A8278", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    navLinks:{ display: "flex", alignItems: "center", gap: 16 },
    navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer" },
    btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.3)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
    btnNav:  { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    body:    { display: "grid", gridTemplateColumns: "1fr 400px", gap: 48, padding: "48px", maxWidth: 1200, margin: "0 auto" },
    formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.08)" },
    formGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 },
    formGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 },
    formGroupFull: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 20, gridColumn: "1 / -1" },
    label:   { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", fontWeight: 500 },
    input:   { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", transition: "border-color .2s" },
    btnRow:  { display: "flex", gap: 12, marginTop: 8 },
    btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 },
    btnGhost:   { flex: 1, background: "transparent", color: "#8A8278", border: "1.5px solid rgba(28,26,22,0.15)", padding: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
    cardVisual: { background: "linear-gradient(135deg,#1C1A16,#7A5C35)", borderRadius: 12, padding: 24, color: "#F7F3EC", marginBottom: 20, position: "relative", overflow: "hidden" },
    cardChip:   { width: 36, height: 28, background: "#C9993A", borderRadius: 4, marginBottom: 20 },
    cardNum:    { fontFamily: "monospace", fontSize: 18, letterSpacing: "3px", marginBottom: 16 },
    cardInfo:   { display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.6 },
    summary:    { background: "#fff", border: "1px solid rgba(28,26,22,0.1)", borderRadius: 4, padding: 28, position: "sticky", top: 84, height: "fit-content", maxHeight: "calc(100vh - 120px)", overflowY: "auto" },
    summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, marginBottom: 16 },
    summaryLine:  { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8A8278", padding: "8px 0", borderBottom: "1px solid rgba(28,26,22,0.06)" },
    summaryTotal: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 0" },
    totalLabel:   { fontSize: 13, fontWeight: 600, color: "#1C1A16" },
    totalPrice:   { fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#C9993A" },
  };

  const fo = (e) => (e.target.style.borderColor = "#C9993A");
  const bl = (e) => (e.target.style.borderColor = "rgba(28,26,22,0.12)");

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
              <button style={s.btnNavOutline} onClick={() => onLogin?.("login")}>Sign In</button>
              <button style={s.btnNav} onClick={() => onLogin?.("register")}>Register</button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
              <button style={s.btnNavOutline} onClick={onLogout}>Sign Out</button>
            </div>
          )}
        </div>
      </nav>

      <div style={s.body}>
        {/* ── LEFT: Form ── */}
        <div>
          <Steps current={step} />

          {step === 1 && (
            <div>
              <h2 style={s.formTitle}>Guest Information</h2>
              <div style={s.formGrid}>
                <div style={s.formGroup}><label style={s.label}>First Name</label><input style={s.input} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} onFocus={fo} onBlur={bl} /></div>
                <div style={s.formGroup}><label style={s.label}>Last Name</label><input style={s.input} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} onFocus={fo} onBlur={bl} /></div>
                <div style={s.formGroup}><label style={s.label}>Email Address</label><input style={s.input} type="email" placeholder="@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={fo} onBlur={bl} /></div>
                <div style={s.formGroup}><label style={s.label}>Phone Number</label><input style={s.input} type="tel" placeholder="+84" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={fo} onBlur={bl} /></div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={onBack}>← Back</button>
                <button style={s.btnPrimary} onClick={() => setStep(2)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
                >Continue →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={s.formTitle}>Payment Details</h2>
              <div style={s.cardVisual}>
                <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.05 }}>◯</div>
                <div style={s.cardChip} />
                <div style={s.cardNum}>{cardNumber || "•••• •••• •••• ••••"}</div>
                <div style={s.cardInfo}><span>{cardName || "CARDHOLDER NAME"}</span><span>{cardExpiry || "MM/YY"}</span></div>
              </div>
              <div style={s.formGrid}>
                <div style={s.formGroupFull}>
                  <label style={s.label}>Card Number</label>
                  <input style={s.input} placeholder="1234 5678 9012 3456" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} onFocus={fo} onBlur={bl} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Expiry Date</label>
                  <input style={s.input} placeholder="MM/YY" maxLength={5} value={cardExpiry}
                    onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4); setCardExpiry(v); }}
                    onFocus={fo} onBlur={bl} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>CVV</label>
                  <input style={s.input} placeholder="•••" maxLength={3} type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))} onFocus={fo} onBlur={bl} />
                </div>
                <div style={{ ...s.formGroup, gridColumn: "1 / -1" }}>
                  <label style={s.label}>Cardholder Name</label>
                  <input style={s.input} placeholder="JOHN DOE" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} onFocus={fo} onBlur={bl} />
                </div>
              </div>
              <div style={s.btnRow}>
                <button style={s.btnGhost} onClick={() => setStep(1)}>← Back</button>
                <button
                  style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                  onClick={handleConfirm}
                  disabled={submitting}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#3A7D5A"; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#1C1A16"; }}
                >
                  {submitting ? "Processing..." : `✓ Confirm ${isMulti ? `${selectedRooms.length} Rooms` : "Booking"}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary Sidebar ── */}
        <div style={s.summary}>
          <div style={s.summaryTitle}>
            {isMulti ? `Booking Summary · ${selectedRooms.length} Rooms` : "Booking Summary"}
          </div>

          {/* Multi-room: list each room */}
          {isMulti ? (
            <div style={{ marginBottom: 4 }}>
              {roomLines.map((rl, i) => (
                <div key={rl.roomId} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < roomLines.length - 1 ? "1px solid rgba(28,26,22,0.06)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1A16" }}>Room #{rl.roomNumber}</div>
                      <div style={{ fontSize: 11, color: "#8A8278" }}>{rl.typeName}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {rl.hasDiscount && (
                        <div style={{ fontSize: 10, color: "#8A8278", textDecoration: "line-through" }}>${rl.basePrice}/night</div>
                      )}
                      <div style={{ fontSize: 13, color: rl.hasDiscount ? "#B94040" : "#1C1A16", fontWeight: 600 }}>${rl.finalPrice}/night</div>
                    </div>
                  </div>
                  {rl.ruleName && (
                    <div style={{ fontSize: 10, color: "#3A7D5A", background: "rgba(58,125,90,0.08)", padding: "2px 8px", borderRadius: 1, display: "inline-block" }}>
                      ✦ {rl.ruleName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Single room
            <>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, marginBottom: 4 }}>Room #{roomLines[0]?.roomNumber}</div>
              <div style={{ fontSize: 11, color: "#8A8278", marginBottom: 16 }}>{roomLines[0]?.typeName} · {guests} guest{guests > 1 ? "s" : ""}</div>
              {roomLines[0]?.ruleName && (
                <div style={{ fontSize: 11, color: "#3A7D5A", marginBottom: 12 }}>✦ {roomLines[0].ruleName} applied</div>
              )}
            </>
          )}

          {/* Shared lines */}
          <div style={s.summaryLine}><span>Check-in</span><span>{checkIn}</span></div>
          <div style={s.summaryLine}><span>Check-out</span><span>{checkOut}</span></div>
          <div style={s.summaryLine}><span>Nights</span><span>{nights}</span></div>
          <div style={s.summaryLine}><span>Guests</span><span>{guests}</span></div>

          {isMulti && (
            <div style={s.summaryLine}>
              <span>Rooms</span>
              <span>{selectedRooms.length}</span>
            </div>
          )}

          <div style={s.summaryTotal}>
            <span style={s.totalLabel}>Total</span>
            <span style={s.totalPrice}>${Math.round(totalPrice).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        booking={showSuccess ? createdBooking : null}
        onViewBooking={handleViewBooking}
        onClose={handleSuccessClose}
      />

      {/* BookingDetails drawer */}
      <BookingDetails
        booking={detailBooking}
        onClose={handleSuccessClose}
        isAdmin={false}
      />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 300, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}