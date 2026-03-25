import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    id: "LS-A1B2C3",
    room: { name: "Grand Suite", type: "Suite", gradient: "linear-gradient(135deg,#1A1A2E,#4A3060)" },
    checkIn: "2026-03-20",
    checkOut: "2026-03-23",
    nights: 3,
    guests: 2,
    total: 1485,
    status: "confirmed",
    specialRequest: "High floor, anniversary decoration",
    createdAt: "2026-03-15",
  },
  {
    id: "LS-D4E5F6",
    room: { name: "Deluxe Room", type: "Deluxe", gradient: "linear-gradient(135deg,#1A2A3A,#2E5E8A)" },
    checkIn: "2026-04-10",
    checkOut: "2026-04-12",
    nights: 2,
    guests: 2,
    total: 484,
    status: "pending",
    specialRequest: "",
    createdAt: "2026-03-16",
  },
  {
    id: "LS-G7H8I9",
    room: { name: "Superior Room", type: "Standard", gradient: "linear-gradient(135deg,#2C2318,#6B4F2C)" },
    checkIn: "2026-02-05",
    checkOut: "2026-02-07",
    nights: 2,
    guests: 1,
    total: 264,
    status: "cancelled",
    specialRequest: "Late check-in after 10PM",
    createdAt: "2026-01-20",
  },
  {
    id: "LS-J1K2L3",
    room: { name: "Presidential Suite", type: "Presidential", gradient: "linear-gradient(135deg,#1C1A16,#5C3A18)" },
    checkIn: "2026-01-10",
    checkOut: "2026-01-13",
    nights: 3,
    guests: 4,
    total: 3234,
    status: "confirmed",
    specialRequest: "Airport transfer, butler service",
    createdAt: "2025-12-20",
  },
];

const STATUS_TABS = ["All", "Confirmed", "Pending", "Cancelled"];

const STATUS_STYLE = {
  confirmed: { background: "rgba(39,174,96,0.1)", color: "#3A7D5A", label: "Confirmed" },
  pending:   { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Pending" },
  cancelled: { background: "rgba(185,64,64,0.1)", color: "#B94040", label: "Cancelled" },
};

// ─── CANCEL MODAL ─────────────────────────────────────────────────────────────
function CancelModal({ booking, onConfirm, onClose }) {
  if (!booking) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 4, padding: 40, maxWidth: 420, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 12 }}>Cancel Booking?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 8 }}>
          You are about to cancel booking <strong style={{ color: "#1C1A16" }}>{booking.id}</strong> for <strong style={{ color: "#1C1A16" }}>{booking.room.name}</strong>.
        </p>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Per our policy, cancellations made more than 24 hours before check-in are fully refunded.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}
          >Keep Booking</button>
          <button
            onClick={() => onConfirm(booking.id)}
            style={{ flex: 2, background: "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}
          >Yes, Cancel It</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING CARD ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel }) {
  const st = STATUS_STYLE[booking.status];
  const canCancel = booking.status === "confirmed" || booking.status === "pending";

  // Check if cancellation is within 24h
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate - now) / 3600000;
  const tooLateToCancel = hoursUntilCheckIn < 24;

  return (
    <div style={{ background: "#fff", border: "1px solid rgba(28,26,22,0.1)", borderRadius: 3, overflow: "hidden", display: "grid", gridTemplateColumns: "140px 1fr auto", transition: "box-shadow .2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(28,26,22,.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Thumbnail */}
      <div style={{ background: booking.room.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 40, color: "rgba(247,243,236,0.15)" }}>
        ❖
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278" }}>
            {booking.id}
          </span>
          <span style={{ ...st, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 1 }}>
            {st.label}
          </span>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 12 }}>
          {booking.room.name}
        </h3>
        <div style={{ display: "flex", gap: 28, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 3 }}>Check-in</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{booking.checkIn}</div>
          </div>
          <div style={{ color: "#8A8278", alignSelf: "flex-end", marginBottom: 2, fontSize: 16 }}>→</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 3 }}>Check-out</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{booking.checkOut}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 3 }}>Nights</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{booking.nights}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 3 }}>Guests</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{booking.guests}</div>
          </div>
        </div>
        {booking.specialRequest && (
          <div style={{ fontSize: 11, color: "#8A8278", background: "#F7F3EC", padding: "5px 10px", borderRadius: 2, display: "inline-block" }}>
            📝 {booking.specialRequest}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "20px 24px", borderLeft: "1px solid rgba(28,26,22,0.06)", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", minWidth: 150 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1C1A16", textAlign: "right" }}>
          ${booking.total}
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#8A8278", fontWeight: 400, letterSpacing: "0.5px" }}>total paid</div>
        </div>
        {canCancel && (
          <button
            onClick={() => onCancel(booking)}
            disabled={tooLateToCancel}
            title={tooLateToCancel ? "Cannot cancel within 24h of check-in" : "Cancel this booking"}
            style={{
              border: `1px solid ${tooLateToCancel ? "rgba(28,26,22,0.1)" : "rgba(185,64,64,0.3)"}`,
              background: "transparent",
              color: tooLateToCancel ? "#ccc" : "#B94040",
              padding: "7px 16px",
              fontSize: 11,
              fontWeight: 500,
              cursor: tooLateToCancel ? "not-allowed" : "pointer",
              borderRadius: 2,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => { if (!tooLateToCancel) { e.currentTarget.style.background = "rgba(185,64,64,0.06)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {tooLateToCancel ? "Cannot Cancel" : "Cancel"}
          </button>
        )}
        {booking.status === "cancelled" && (
          <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
        )}
      </div>
    </div>
  );
}

// ─── MY BOOKINGS PAGE ─────────────────────────────────────────────────────────
export default function MyBookings({ user, onBack, onLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState("All");
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCancelConfirm = (id) => {
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)
    );
    setCancelTarget(null);
    showToast("Booking cancelled successfully. Refund will be processed in 3–5 business days.");
  };

  const filtered = activeTab === "All"
    ? bookings
    : bookings.filter((b) => b.status === activeTab.toLowerCase());

  const counts = {
    All: bookings.length,
    Confirmed: bookings.filter((b) => b.status === "confirmed").length,
    Pending: bookings.filter((b) => b.status === "pending").length,
    Cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const s = {
    page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    navLinks: { display: "flex", alignItems: "center", gap: 24 },
    navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer", fontWeight: 400 },
    btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.3)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    userBadge: { display: "flex", alignItems: "center", gap: 10 },
    userAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 },
  };

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={s.navLinks}>
          <span style={s.navLink} onClick={onBack}>Home</span>
          <span style={{ ...s.navLink, color: "#1C1A16", fontWeight: 500 }}>My Bookings</span>
          {user ? (
            <div style={s.userBadge}>
              <div style={s.userAvatar}>{user.email?.[0]?.toUpperCase() || "U"}</div>
              <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
              <button style={s.btnNavOutline} onClick={onLogout}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Sign Out</button>
            </div>
          ) : (
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
          )}
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ padding: "48px 40px 0" }}>
        <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 10 }}>✦ Account</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 300, marginBottom: 6 }}>My Bookings</h1>
        <p style={{ fontSize: 13, color: "#8A8278", marginBottom: 0 }}>
          {user ? `Welcome back, ${user.name || user.email}` : "Manage all your reservations"}
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, padding: "28px 40px 0" }}>
        {[
          { label: "Total Bookings", value: bookings.length, color: "#1C1A16" },
          { label: "Confirmed", value: counts.Confirmed, color: "#3A7D5A" },
          { label: "Pending", value: counts.Pending, color: "#C9993A" },
          { label: "Cancelled", value: counts.Cancelled, color: "#B94040" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "20px 24px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, padding: "28px 40px 0", borderBottom: "1px solid rgba(28,26,22,0.08)", marginTop: 4 }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: "transparent", border: "none", borderBottom: `2px solid ${isActive ? "#C9993A" : "transparent"}`, marginBottom: -1, padding: "10px 20px", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#1C1A16" : "#8A8278", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}
            >
              {tab} <span style={{ fontSize: 11, color: isActive ? "#C9993A" : "#ccc", marginLeft: 4 }}>({counts[tab]})</span>
            </button>
          );
        })}
      </div>

      {/* BOOKINGS LIST */}
      <div style={{ padding: "28px 40px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8A8278" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◈</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 300, marginBottom: 12 }}>No bookings found</p>
            <p style={{ fontSize: 13 }}>
              {activeTab === "All" ? "You haven't made any bookings yet." : `No ${activeTab.toLowerCase()} bookings.`}
            </p>
            <button onClick={onBack}
              style={{ marginTop: 24, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "12px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
            >Browse Rooms</button>
          </div>
        ) : (
          filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(b) => setCancelTarget(b)}
            />
          ))
        )}
      </div>

      {/* CANCEL MODAL */}
      <CancelModal
        booking={cancelTarget}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}