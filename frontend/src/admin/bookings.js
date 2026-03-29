import { useState, useEffect } from "react";
import bookingService from "../services/booking.service";
import BookingDetails from "../pages/bookingDetails";

const STATUS_LIST = ["pending", "confirmed", "cancelled", "completed"];
const STATUS_STYLE = {
  confirmed: { background: "rgba(39,174,96,0.1)", color: "#3A7D5A", label: "Confirmed" },
  pending: { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Pending" },
  cancelled: { background: "rgba(185,64,64,0.1)", color: "#B94040", label: "Cancelled" },
  completed: { background: "rgba(28,26,22,0.08)", color: "#5A5650", label: "Completed" },
};

function Sidebar({ active, onNavigate, onLogout }) {
  const navItems = [
    { icon: "◈", label: "Dashboard", key: "dashboard" },
    { label: "Room Types", key: "roomTypes" },
    { label: "Rooms", key: "rooms" },
    { label: "Bookings", key: "bookings" },
    { label: "Pricing", key: "pricing" },
  ];

  return (
    <div style={{ width: 240, background: "#1C1A16", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#F7F3EC", letterSpacing: "1px" }}>
          Luxe<span style={{ color: "#C9993A" }}>Stay</span>
        </div>
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
        <button onClick={onLogout}
          style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(247,243,236,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >Back to home</button>
      </div>
    </div>
  );
}

function formatBooking(b) {
  return {
    id: b._id,
    status: b.status,
    createdAt: b.createdAt,

    customer: {
      name: b.customerId?.name ?? "—",
      email: b.customerId?.email ?? "—",
      phone: b.customerId?.phone ?? "—",
    },

    rooms: b.rooms.map((r) => ({
      roomId: r.roomId?._id ?? r.roomId,
      roomNumber: r.roomId?.roomNumber ?? r.roomNumber,
      roomTypeName: r.roomTypeName,
      basePrice: r.basePrice,
      pricePerNight: r.pricePerNight,
      image: r.images ?? null,
      gradient: r.roomTypeId?.gradient ?? null,
      appliedRules: r.appliedRules        
        ? [r.appliedRules]                    
        : [],
    })),

    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    guests: b.guests,
    totalPrice: b.totalPrice,

    _customerName: b.customerId?.name ?? "—",
    _customerEmail: b.customerId?.email ?? "—",
    _roomSummary: b.rooms.map((r) => r.roomTypeName).join(", "),
    _checkIn: new Date(b.checkIn).toLocaleDateString(),
    _checkOut: new Date(b.checkOut).toLocaleDateString(),
  };
}

export default function AdminBookings({ onLogout, adminUser, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingService.getBookings();
        setBookings(res.data.data.map(formatBooking));
      } catch (err) {
        console.error("Fetch bookings error:", err);
      }
    };
    fetchBookings();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: newStatus } : b)
      );

      setSelectedBooking((prev) =>
        prev?.id === id ? { ...prev, status: newStatus } : prev
      );
      showToast("Status updated");
    } catch (err) {
      console.error("Update status error:", err);
      showToast("Update failed", "error");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      b.id.toLowerCase().includes(q) ||
      b._customerName.toLowerCase().includes(q) ||
      b._roomSummary.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    All: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div style={s.layout}>
      <Sidebar active="bookings" onNavigate={onNavigate} onLogout={onLogout} adminUser={adminUser} />

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Booking Management</div>
        </div>

        <div style={s.content}>
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

          <div style={s.filterBar}>
            <input
              style={s.searchInput}
              placeholder="Search by ID, guest or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              style={s.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>{STATUS_STYLE[st].label}</option>
              ))}
            </select>
            <span style={s.resultCount}>
              {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Booking ID", "Customer", "Room(s)", "Check-in", "Check-out", "Nights", "Total", "Status", ""].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...s.td, color: "#C9993A", fontWeight: 500, fontSize: 11 }}>
                        {b.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={s.td}>
                        <div>{b._customerName}</div>
                        <div style={{ fontSize: 11, color: "#8A8278" }}>{b._customerEmail}</div>
                      </td>
                      <td style={{ ...s.td, fontSize: 12, color: "#5A5650" }}>{b._roomSummary}</td>
                      <td style={s.td}>{b._checkIn}</td>
                      <td style={s.td}>{b._checkOut}</td>
                      <td style={s.td}>{b.nights}</td>
                      <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>
                        ${b.totalPrice?.toLocaleString()}
                      </td>
                      <td style={s.td}>
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          style={{
                            padding: "4px 8px", fontSize: 11,
                            border: "1px solid rgba(28,26,22,0.15)", borderRadius: 2,
                            background: STATUS_STYLE[b.status]?.background,
                            color: STATUS_STYLE[b.status]?.color,
                            fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st}>{STATUS_STYLE[st].label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={s.td}>
                        <button style={s.btnView}
                          onClick={() => setSelectedBooking(b)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookingDetails
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={handleUpdateStatus}
        isAdmin={true}
      />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

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
}