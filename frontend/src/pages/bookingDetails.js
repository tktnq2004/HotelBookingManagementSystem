const STATUS_STYLE = {
  pending:   { background: "rgba(201,153,58,0.12)",  color: "#B8832A", label: "Pending"   },
  confirmed: { background: "rgba(58,125,90,0.12)",   color: "#2E6B4F", label: "Confirmed" },
  cancelled: { background: "rgba(185,64,64,0.12)",   color: "#B94040", label: "Cancelled" },
  completed: { background: "rgba(28,26,22,0.08)",    color: "#5A5650", label: "Completed" },
};

const STATUS_LIST = ["pending", "confirmed", "cancelled", "completed"];

function Badge({ status }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span style={{
      ...st,
      fontSize: 9, fontWeight: 700, letterSpacing: "1.8px",
      textTransform: "uppercase", padding: "5px 12px", borderRadius: 2,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {st.label}
    </span>
  );
}

function Field({ label, value, full = false, accent = false }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 9, letterSpacing: "1.8px", textTransform: "uppercase", color: "#8A8278", marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: accent ? "#C9993A" : "#1C1A16", fontWeight: accent ? 600 : 400, fontFamily: accent ? "'Playfair Display', serif" : "'DM Sans', sans-serif" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 18px" }}>
      <span style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "#C9993A", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(201,153,58,0.2)" }} />
    </div>
  );
}

function RoomCard({ room }) {
  const hasRule = room.appliedRules?.length > 0;
  const rule = room.appliedRules?.[0];

  return (
    <div style={{
      border: "1px solid rgba(28,26,22,0.09)", borderRadius: 4,
      overflow: "hidden", marginBottom: 12,
    }}>
      <div style={{
        height: 90,
        background: room.image ? `url(${room.image}) center/cover` : (room.gradient || "linear-gradient(135deg,#1C1A16,#7A5C35)"),
        display: "flex", alignItems: "flex-end",
        padding: "10px 16px",
        position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,26,22,0.7), transparent)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#F7F3EC", fontWeight: 400 }}>
            Room #{room.roomNumber}
          </div>
          <div style={{ fontSize: 11, color: "rgba(247,243,236,0.65)", fontFamily: "'DM Sans', sans-serif" }}>
            {room.roomTypeName}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px", background: "#FDFAF6" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 16px" }}>
          <Field label="Base Price" value={`$${room.basePrice?.toLocaleString()}`} />
          <Field label="Multiplier" value={hasRule ? `×${rule.multiplier}` : "×1"} />
          <Field label="Final / Night" value={`$${room.pricePerNight?.toLocaleString()}`} accent />
        </div>

        {hasRule && (
          <div style={{
            marginTop: 12, background: "rgba(58,125,90,0.08)",
            border: "1px solid rgba(58,125,90,0.18)", borderRadius: 3,
            padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13, color: "#3A7D5A" }}>✦</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2E6B4F", fontFamily: "'DM Sans', sans-serif" }}>
                {rule.ruleName}
              </div>
              <div style={{ fontSize: 10, color: "#5A9070", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                {formatDate(rule.startDate)} → {formatDate(rule.endDate)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#2E6B4F", fontWeight: 700, background: "rgba(58,125,90,0.12)", padding: "3px 8px", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}>
              ×{rule.multiplier}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BookingDetails({ booking, onClose, onUpdateStatus, isAdmin = false }) {
  if (!booking) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(28,26,22,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 4,
          width: 580, maxWidth: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(28,26,22,0.25)",
          fontFamily: "'DM Sans', sans-serif",
          scrollbarWidth: "thin",
        }}
      >
        <div style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid rgba(28,26,22,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          position: "sticky", top: 0, background: "#fff", zIndex: 10,
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 6 }}>
              Booking Details
            </div>
            <span style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#C9993A" }}>
              #{booking.id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status={booking.status} />
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8278", fontSize: 20, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: "8px 32px 32px" }}>

          {/* ── Customer Info ── */}
          <Divider label="Customer Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
            <Field label="Full Name"     value={booking.customer?.name} />
            <Field label="Phone"         value={booking.customer?.phone} />
            <Field label="Email Address" value={booking.customer?.email} full />
          </div>

          {/* ── Rooms ── */}
          <Divider label={`Room${booking.rooms?.length > 1 ? "s" : ""} · ${booking.rooms?.length}`} />
          {booking.rooms?.map((room, i) => (
            <RoomCard key={room.roomId || i} room={room} />
          ))}

          {/* ── Booking Summary ── */}
          <Divider label="Booking Summary" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px", marginBottom: 20 }}>
            <Field label="Check-in"  value={formatDate(booking.checkIn)} />
            <Field label="Check-out" value={formatDate(booking.checkOut)} />
            <Field label="Nights"    value={booking.nights} />
            <Field label="Guests"    value={`${booking.guests} guest${booking.guests > 1 ? "s" : ""}`} />
          </div>

          {/* Total price bar */}
          <div style={{
            background: "#F7F3EC", borderRadius: 3,
            padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 24,
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "1.8px", textTransform: "uppercase", color: "#8A8278", marginBottom: 4 }}>Total Amount</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#C9993A" }}>
                ${booking.totalPrice?.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, letterSpacing: "1.8px", textTransform: "uppercase", color: "#8A8278", marginBottom: 4 }}>Booked on</div>
              <div style={{ fontSize: 13, color: "#5A5650" }}>{formatDate(booking.createdAt)}</div>
            </div>
          </div>

          {/* ── Admin: Update Status ── */}
          {isAdmin && booking.status !== "cancelled" && booking.status !== "completed" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "1.8px", textTransform: "uppercase", color: "#8A8278", marginBottom: 10 }}>
                Update Status
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUS_LIST
                  .filter((s) => s !== booking.status)
                  .map((s) => {
                    const st2 = STATUS_STYLE[s];
                    return (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus?.(booking.id, s)}
                        style={{
                          ...st2,
                          border: "none", padding: "8px 18px",
                          fontSize: 10, fontWeight: 700,
                          letterSpacing: "1px", textTransform: "uppercase",
                          cursor: "pointer", borderRadius: 2,
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "opacity .15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        → {st2.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: "100%", background: "transparent",
              border: "1.5px solid rgba(28,26,22,0.15)",
              color: "#8A8278", padding: 12,
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              cursor: "pointer", borderRadius: 2,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9993A"; e.currentTarget.style.color = "#C9993A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(28,26,22,0.15)"; e.currentTarget.style.color = "#8A8278"; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}