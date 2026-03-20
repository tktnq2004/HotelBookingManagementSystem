import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_BOOKINGS = [
  { id: "LS-A1B2C3", customer: "James Wilson", email: "james@email.com", room: "Grand Suite", roomNumber: "301", checkIn: "2026-03-20", checkOut: "2026-03-23", nights: 3, guests: 2, total: 1485, status: "confirmed", specialRequest: "Anniversary decoration", createdAt: "2026-03-15" },
  { id: "LS-D4E5F6", customer: "Sarah Johnson", email: "sarah@email.com", room: "Deluxe Room", roomNumber: "201", checkIn: "2026-03-22", checkOut: "2026-03-24", nights: 2, guests: 2, total: 484, status: "pending", specialRequest: "", createdAt: "2026-03-16" },
  { id: "LS-G7H8I9", customer: "Michael Chen", email: "michael@email.com", room: "Presidential Suite", roomNumber: "401", checkIn: "2026-03-25", checkOut: "2026-03-28", nights: 3, guests: 4, total: 3234, status: "confirmed", specialRequest: "Airport transfer", createdAt: "2026-03-14" },
  { id: "LS-J1K2L3", customer: "Emily Davis", email: "emily@email.com", room: "Superior Room", roomNumber: "101", checkIn: "2026-03-21", checkOut: "2026-03-22", nights: 1, guests: 1, total: 132, status: "cancelled", specialRequest: "", createdAt: "2026-03-13" },
  { id: "LS-M4N5O6", customer: "Robert Brown", email: "robert@email.com", room: "Deluxe Room", roomNumber: "202", checkIn: "2026-03-26", checkOut: "2026-03-29", nights: 3, guests: 2, total: 726, status: "pending", specialRequest: "High floor room", createdAt: "2026-03-17" },
  { id: "LS-P7Q8R9", customer: "Linda Martinez", email: "linda@email.com", room: "Grand Suite", roomNumber: "302", checkIn: "2026-04-01", checkOut: "2026-04-05", nights: 4, guests: 3, total: 1980, status: "confirmed", specialRequest: "Baby crib needed", createdAt: "2026-03-18" },
];

const STATUS_LIST = ["pending", "confirmed", "cancelled"];
const STATUS_STYLE = {
  confirmed: { background: "rgba(39,174,96,0.1)",  color: "#3A7D5A", label: "Confirmed" },
  pending:   { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Pending" },
  cancelled: { background: "rgba(185,64,64,0.1)",  color: "#B94040", label: "Cancelled" },
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNavigate, onLogout, adminUser }) {
  const navItems = [
    { icon: "◈", label: "Dashboard", key: "dashboard" },
    { icon: "🛏", label: "Rooms", key: "rooms" },
    { icon: "📋", label: "Bookings", key: "bookings" },
    { icon: "💰", label: "Pricing", key: "pricing" },
  ];
  return (
    <div style={{ width: 240, background: "#1C1A16", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#F7F3EC", letterSpacing: "1px" }}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={{ fontSize: 10, color: "rgba(247,243,236,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginTop: 4 }}>Admin Panel</div>
      </div>
      <div style={{ flex: 1, padding: "16px 0" }}>
        {navItems.map((item) => (
          <div key={item.key}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 24px", fontSize: 13, color: item.key === active ? "#F7F3EC" : "rgba(247,243,236,0.5)", background: item.key === active ? "rgba(255,255,255,0.08)" : "transparent", cursor: "pointer", borderLeft: `3px solid ${item.key === active ? "#C9993A" : "transparent"}`, transition: "all .2s" }}
            onClick={() => onNavigate?.(item.key)}
            onMouseEnter={(e) => { if (item.key !== active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { if (item.key !== active) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{adminUser?.email?.[0]?.toUpperCase() || "A"}</div>
          <div>
            <div style={{ fontSize: 13, color: "#F7F3EC", fontWeight: 500 }}>{adminUser?.name || "Admin"}</div>
            <div style={{ fontSize: 10, color: "rgba(247,243,236,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Administrator</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(247,243,236,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >Sign Out</button>
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL MODAL ─────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, onUpdateStatus }) {
  if (!booking) return null;
  const st = STATUS_STYLE[booking.status];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, width: 520, maxWidth: "95vw", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid rgba(28,26,22,0.08)" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Booking Details</div>
            <span style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#C9993A" }}>{booking.id}</span>
          </div>
          <span style={{ ...st, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: 1 }}>{st.label}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 20 }}>
          {[
            { label: "Guest", value: booking.customer },
            { label: "Email", value: booking.email },
            { label: "Room", value: `${booking.room} (#${booking.roomNumber})` },
            { label: "Guests", value: `${booking.guests} guests` },
            { label: "Check-in", value: booking.checkIn },
            { label: "Check-out", value: booking.checkOut },
            { label: "Nights", value: booking.nights },
            { label: "Total", value: `$${booking.total.toLocaleString()}` },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: "#1C1A16", fontWeight: item.label === "Total" ? 600 : 400 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {booking.specialRequest && (
          <div style={{ background: "#F7F3EC", borderRadius: 2, padding: "10px 14px", fontSize: 13, color: "#8A8278", marginBottom: 20 }}>
            📝 <strong>Special Request:</strong> {booking.specialRequest}
          </div>
        )}

        {/* Update Status */}
        {booking.status !== "cancelled" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {STATUS_LIST.filter((s) => s !== booking.status).map((s) => {
                const st2 = STATUS_STYLE[s];
                return (
                  <button key={s} onClick={() => onUpdateStatus(booking.id, s)}
                    style={{ ...st2, border: "none", padding: "7px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
                  >→ {st2.label}</button>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>Close</button>
      </div>
    </div>
  );
}

// ─── ADMIN BOOKINGS PAGE ──────────────────────────────────────────────────────
export default function AdminBookings({ onLogout, adminUser, onNavigate }) {
  const [bookings, setBookings] = useState(INIT_BOOKINGS);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
    setSelectedBooking((prev) => prev ? { ...prev, status: newStatus } : null);
    showToast(`Booking status updated to ${STATUS_STYLE[newStatus].label}`);
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchSearch = b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.room.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    All: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    main: { flex: 1, overflow: "auto" },
    topbar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    topbarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 },
    content: { padding: "32px 40px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
    statCard: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "16px 20px" },
    statVal: (color) => ({ fontFamily: "'Playfair Display', serif", fontSize: 28, color: color || "#1C1A16", marginBottom: 4 }),
    statLbl: { fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" },
    filterBar: { display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" },
    searchInput: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "9px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", width: 260 },
    filterSelect: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "9px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" },
    resultCount: { fontSize: 12, color: "#8A8278", marginLeft: "auto" },
    tableWrap: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(28,26,22,0.08)", fontWeight: 500, background: "#FDFAF7" },
    td: { fontSize: 13, padding: "14px 16px", borderBottom: "1px solid rgba(28,26,22,0.05)", color: "#1C1A16", verticalAlign: "middle" },
    btnView: { background: "transparent", border: "1px solid rgba(28,26,22,0.15)", color: "#1C1A16", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  };

  return (
    <div style={s.layout}>
      <Sidebar active="bookings" onNavigate={onNavigate} onLogout={onLogout} adminUser={adminUser} />

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Booking Management</div>
        </div>

        <div style={s.content}>
          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Total Bookings", value: counts.All, color: "#1C1A16" },
              { label: "Confirmed", value: counts.confirmed, color: "#3A7D5A" },
              { label: "Pending", value: counts.pending, color: "#C9993A" },
              { label: "Cancelled", value: counts.cancelled, color: "#B94040" },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <div style={s.statVal(stat.color)}>{stat.value}</div>
                <div style={s.statLbl}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={s.filterBar}>
            <input style={s.searchInput} placeholder="Search by ID, guest or room..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={s.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
            </select>
            <span style={s.resultCount}>{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Booking ID", "Guest", "Room", "Check-in", "Check-out", "Nights", "Total", "Status", "Action"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No bookings found</td></tr>
                ) : (
                  filtered.map((b) => {
                    const st = STATUS_STYLE[b.status];
                    return (
                      <tr key={b.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ ...s.td, color: "#C9993A", fontWeight: 500 }}>{b.id}</td>
                        <td style={s.td}>
                          <div>{b.customer}</div>
                          <div style={{ fontSize: 11, color: "#8A8278" }}>{b.email}</div>
                        </td>
                        <td style={s.td}>{b.room}</td>
                        <td style={s.td}>{b.checkIn}</td>
                        <td style={s.td}>{b.checkOut}</td>
                        <td style={s.td}>{b.nights}</td>
                        <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>${b.total.toLocaleString()}</td>
                        <td style={s.td}>
                          <span style={{ ...st, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 1 }}>{st.label}</span>
                        </td>
                        <td style={s.td}>
                          <button style={s.btnView} onClick={() => setSelectedBooking(b)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >View</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onUpdateStatus={handleUpdateStatus} />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}