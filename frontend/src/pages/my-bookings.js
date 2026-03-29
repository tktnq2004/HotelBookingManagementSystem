import { useState, useEffect } from "react";
import bookingService from "../services/booking.service";
import BookingDetails from "./bookingDetails";

const STATUS_TABS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_STYLE = {
  confirmed: { background: "rgba(39,174,96,0.1)",  color: "#3A7D5A", label: "Confirmed" },
  pending:   { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Pending"   },
  cancelled: { background: "rgba(185,64,64,0.1)",  color: "#B94040", label: "Cancelled" },
  completed: { background: "rgba(28,26,22,0.06)",  color: "#8A8278", label: "Completed" },
};

const GRADIENTS = [
  "linear-gradient(135deg,#2C2318,#6B4F2C)",
  "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
  "linear-gradient(135deg,#1A1A2E,#4A3060)",
  "linear-gradient(135deg,#1C1A16,#5C3A18)",
  "linear-gradient(135deg,#0D2137,#1A4A5A)",
];

function mapBooking(b, i) {
  const firstRoom = b.rooms?.[0];
  return {
    id:       b._id,
    status:   b.status,
    createdAt: b.createdAt?.split("T")[0],
    rawCheckIn: b.checkIn,

    room: {
      name:     firstRoom?.roomTypeName || "Room",
      number:   firstRoom?.roomNumber   || "",
      gradient: GRADIENTS[i % GRADIENTS.length],
      image:    firstRoom?.images?.[0]  || null,
    },
    checkIn:  b.checkIn?.split("T")[0],
    checkOut: b.checkOut?.split("T")[0],
    nights:   b.nights,
    guests:   b.guests,
    total:    b.totalPrice,

    _detail: {
      id:       b._id,
      status:   b.status,
      createdAt: b.createdAt,
      customer: {
        name:  b.customerId?.name  ?? "—",
        email: b.customerId?.email ?? "—",
        phone: b.customerId?.phone ?? "—",
      },
      rooms: b.rooms.map((r, ri) => ({
        roomId:       r.roomId?._id  ?? r.roomId,
        roomNumber:   r.roomId?.roomNumber ?? r.roomNumber,
        roomTypeName: r.roomTypeName,
        basePrice:    r.basePrice,
        pricePerNight: r.pricePerNight,
        image:        r.images ?? null,
        gradient:     GRADIENTS[ri % GRADIENTS.length],
        appliedRules: r.appliedRules ? [r.appliedRules] : [],
      })),
      checkIn:    b.checkIn,
      checkOut:   b.checkOut,
      nights:     b.nights,
      guests:     b.guests,
      totalPrice: b.totalPrice,
    },
  };
}

// ─── CANCEL MODAL ─────────────────────────────────────────────────────────────
function CancelModal({ booking, onConfirm, onClose, cancelling }) {
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
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, marginBottom: 12 }}>Cancel Booking?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 8 }}>
          You are about to cancel booking for{" "}
          <strong style={{ color: "#1C1A16" }}>{booking.room.name}</strong>.
        </p>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Cancellations made more than 24 hours before check-in are fully refunded.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            disabled={cancelling}
            style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}
          >Keep Booking</button>
          <button
            onClick={() => onConfirm(booking.id)}
            disabled={cancelling}
            style={{ flex: 2, background: cancelling ? "#c97a7a" : "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: cancelling ? "not-allowed" : "pointer", borderRadius: 2 }}
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel It"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING CARD ─────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5000";

function BookingCard({ booking, onCancel, onView }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
  const hoursUntil = (new Date(booking.rawCheckIn) - new Date()) / 3600000;
  const tooLate   = booking.status === "confirmed" && hoursUntil < 24;
  const canCancel = booking.status === "confirmed" || booking.status === "pending";

  const roomImage = booking.room?.image; 

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid rgba(28,26,22,0.1)",
        borderRadius: 4,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        marginBottom: 16,
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
        boxShadow: hovered ? "0 8px 40px rgba(28,26,22,.12)" : "0 2px 8px rgba(28,26,22,.04)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* ── Ảnh phòng ── */}
      <div style={{ position: "relative", overflow: "hidden", background: booking.room.gradient }}>
        {roomImage && !imgError ? (
          <img
            src={`${BASE_URL}${roomImage}`}
            alt={booking.room.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform .5s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, color: "rgba(247,243,236,0.12)" }}>❖</span>
          </div>
        )}
        {/* overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(28,26,22,.15))" }} />

        {/* Status badge trên ảnh */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          ...st,
          fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 1,
        }}>
          {st.label}
        </div>
      </div>

      {/* ── Nội dung ── */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 24px" }}>

        {/* Top: tên phòng + tổng tiền */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278", marginBottom: 5 }}>
              {booking.room.name}
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "#1C1A16", lineHeight: 1.2 }}>
              Room #{booking.room.number}
            </h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1C1A16", lineHeight: 1 }}>
              ${booking.total?.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: "#8A8278", marginTop: 3 }}>total</div>
          </div>
        </div>

        {/* Mid: info pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { icon: "→", label: `${booking.checkIn} – ${booking.checkOut}` },
            { icon: "◷", label: `${booking.nights} night${booking.nights > 1 ? "s" : ""}` },
            { icon: "◎", label: `${booking.guests} guest${booking.guests > 1 ? "s" : ""}` },
          ].map((item) => (
            <span key={item.label} style={{
              fontSize: 11, color: "#5C5650",
              background: "#F7F3EC",
              padding: "4px 10px", borderRadius: 1,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ color: "#C9993A", fontSize: 10 }}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>

        {/* Bottom: booked date + buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(28,26,22,0.07)" }}>
          <span style={{ fontSize: 10, color: "#B0AA9F" }}>Booked {booking.createdAt}</span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onView(booking)}
              style={{
                background: "transparent", border: "1px solid rgba(28,26,22,0.2)",
                color: "#1C1A16", padding: "7px 16px",
                fontSize: 11, fontWeight: 500, cursor: "pointer",
                borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9993A"; e.currentTarget.style.color = "#C9993A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(28,26,22,0.2)"; e.currentTarget.style.color = "#1C1A16"; }}
            >Details</button>

            {canCancel && (
              <button
                onClick={() => onCancel(booking)}
                disabled={tooLate}
                title={tooLate ? "Cannot cancel within 24h of check-in" : ""}
                style={{
                  background: "transparent",
                  border: `1px solid ${tooLate ? "rgba(28,26,22,0.1)" : "rgba(185,64,64,0.35)"}`,
                  color: tooLate ? "#ccc" : "#B94040",
                  padding: "7px 16px", fontSize: 11, fontWeight: 500,
                  cursor: tooLate ? "not-allowed" : "pointer",
                  borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
                }}
                onMouseEnter={(e) => { if (!tooLate) e.currentTarget.style.background = "rgba(185,64,64,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {tooLate ? "Cannot cancel" : "Cancel"}
              </button>
            )}

            {booking.status === "cancelled" && (
              <span style={{ fontSize: 11, color: "#B94040", padding: "7px 0" }}>Cancelled</span>
            )}
            {booking.status === "completed" && (
              <span style={{ fontSize: 11, color: "#3A7D5A", padding: "7px 0" }}>Completed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MY BOOKINGS PAGE ─────────────────────────────────────────────────────────
const s = {
  page:         { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
  nav:          { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
  logo:         { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
  navLinks:     { display: "flex", alignItems: "center", gap: 24 },
  navLink:      { fontSize: 13, color: "#8A8278", cursor: "pointer", fontWeight: 400 },
  btnNavOutline:{ background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.3)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  btnNav:       { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  userBadge:    { display: "flex", alignItems: "center", gap: 10 },
  userAvatar:   { width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 },
};

export default function MyBookings({ user, onBack, onLogin, onLogout }) {
  const [activeTab,    setActiveTab]    = useState("All");
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [viewBooking,  setViewBooking]  = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    bookingService
      .getBookings()
      .then((res) => setBookings((res.data?.data || []).map(mapBooking)))
      .catch(() => showToast("Failed to load bookings", "error"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancelConfirm = async (id) => {
    try {
      setCancelling(true);
      await bookingService.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => b.id === id
          ? { ...b, status: "cancelled", _detail: { ...b._detail, status: "cancelled" } }
          : b
        )
      );
      setCancelTarget(null);
      showToast("Booking cancelled successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Cancel failed", "error");
    } finally {
      setCancelling(false);
    }
  };

  const handleView = (booking) => setViewBooking(booking._detail);

  const filtered = activeTab === "All"
    ? bookings
    : bookings.filter((b) => b.status === activeTab.toLowerCase());

  const counts = {
    All:       bookings.length,
    Pending:   bookings.filter((b) => b.status === "pending").length,
    Confirmed: bookings.filter((b) => b.status === "confirmed").length,
    Cancelled: bookings.filter((b) => b.status === "cancelled").length,
    Completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={s.navLinks}>
          <span style={s.navLink} onClick={onBack}>Home</span>
          <span style={{ ...s.navLink, color: "#1C1A16", fontWeight: 500 }}>My Bookings</span>
          {user ? (
            <div style={s.userBadge}>
              <div style={s.userAvatar}>{user.email?.[0]?.toUpperCase() || "U"}</div>
              <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
              <button style={s.btnNavOutline} onClick={onLogout}>Sign Out</button>
            </div>
          ) : (
            <button style={s.btnNav} onClick={() => onLogin?.("login")}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: "48px 40px 0" }}>
        <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 10 }}>✦ Account</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 6 }}>My Bookings</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "28px 40px 0", borderBottom: "1px solid rgba(28,26,22,0.08)", marginTop: 4 }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: "transparent", border: "none", borderBottom: `2px solid ${isActive ? "#C9993A" : "transparent"}`, marginBottom: -1, padding: "10px 20px", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#1C1A16" : "#8A8278", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              {tab} <span style={{ fontSize: 11, color: isActive ? "#C9993A" : "#ccc", marginLeft: 4 }}>({counts[tab] || 0})</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ padding: "28px 40px 60px" }}>
        {loading ? (
          <div style={{ height: 130, background: "#fff", borderRadius: 3, animation: "shimmer 1.5s infinite" }} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8A8278" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>No bookings found</p>
          </div>
        ) : (
          filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={setCancelTarget}
              onView={handleView}
            />
          ))
        )}
      </div>

      <CancelModal
        booking={cancelTarget}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
        cancelling={cancelling}
      />

      <BookingDetails
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
        isAdmin={false}
      />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}