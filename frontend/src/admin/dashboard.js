import { useState } from "react";

const STATS = { totalRevenue: 48250, totalBookings: 124, totalCustomers: 89, occupancyRate: 76, revenueGrowth: 12.5, bookingsGrowth: 8.3, customersGrowth: 5.1, occupancyGrowth: -2.4 };

const RECENT_BOOKINGS = [
  { id: "LS-A1B2C3", guest: "James Wilson", room: "Grand Suite", checkIn: "2026-03-20", checkOut: "2026-03-23", total: 1485, status: "confirmed" },
  { id: "LS-D4E5F6", guest: "Sarah Johnson", room: "Deluxe Room", checkIn: "2026-03-22", checkOut: "2026-03-24", total: 484, status: "pending" },
  { id: "LS-G7H8I9", guest: "Michael Chen", room: "Presidential Suite", checkIn: "2026-03-25", checkOut: "2026-03-28", total: 3234, status: "confirmed" },
  { id: "LS-J1K2L3", guest: "Emily Davis", room: "Superior Room", checkIn: "2026-03-21", checkOut: "2026-03-22", total: 132, status: "cancelled" },
  { id: "LS-M4N5O6", guest: "Robert Brown", room: "Deluxe Room", checkIn: "2026-03-26", checkOut: "2026-03-29", total: 726, status: "pending" },
];

const ROOM_OCCUPANCY = [
  { name: "Superior Room", total: 10, booked: 8, rate: 80 },
  { name: "Deluxe Room", total: 8, booked: 6, rate: 75 },
  { name: "Grand Suite", total: 5, booked: 4, rate: 80 },
  { name: "Presidential Suite", total: 2, booked: 1, rate: 50 },
];

const MONTHLY_REVENUE = [
  { month: "Oct", value: 32000 }, { month: "Nov", value: 28000 },
  { month: "Dec", value: 45000 }, { month: "Jan", value: 38000 },
  { month: "Feb", value: 41000 }, { month: "Mar", value: 48250 },
];

const STATUS_STYLE = {
  confirmed: { background: "rgba(39,174,96,0.1)", color: "#3A7D5A", label: "Confirmed" },
  pending:   { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Pending" },
  cancelled: { background: "rgba(185,64,64,0.1)", color: "#B94040", label: "Cancelled" },
};

function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  const barW = 36, gap = 16, chartH = 120;
  const totalW = data.length * (barW + gap) - gap;
  return (
    <svg width="100%" viewBox={`0 0 ${totalW + 20} ${chartH + 40}`} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * chartH);
        const x = i * (barW + gap);
        const y = chartH - h;
        const isLast = i === data.length - 1;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={isLast ? "#C9993A" : "rgba(28,26,22,0.08)"} />
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" style={{ fontSize: 11, fill: "#8A8278", fontFamily: "'DM Sans',sans-serif" }}>{d.month}</text>
            {isLast && <text x={x + barW / 2} y={y - 6} textAnchor="middle" style={{ fontSize: 10, fill: "#C9993A", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>${(d.value / 1000).toFixed(0)}k</text>}
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboard({ onLogout, adminUser, onNavigate }) {
  const navItems = [
    { icon: "◈", label: "Dashboard", key: "dashboard" },
    { icon: "🛏", label: "Rooms", key: "rooms" },
    { icon: "📋", label: "Bookings", key: "bookings" },
    { icon: "💰", label: "Pricing", key: "pricing" },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    sidebar: { width: 240, background: "#1C1A16", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 },
    main: { flex: 1, overflow: "auto" },
    topbar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    content: { padding: "32px 40px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 },
    statCard: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "22px 24px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 },
    card: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "24px" },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.06)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid rgba(28,26,22,0.08)", fontWeight: 500 },
    td: { fontSize: 13, padding: "12px 12px", borderBottom: "1px solid rgba(28,26,22,0.05)", color: "#1C1A16" },
  };

  return (
    <div style={s.layout}>
      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#F7F3EC", letterSpacing: "1px" }}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
          <div style={{ fontSize: 10, color: "rgba(247,243,236,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginTop: 4 }}>Admin Panel</div>
        </div>
        <div style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            <div key={item.key}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 24px", fontSize: 13, color: item.key === "dashboard" ? "#F7F3EC" : "rgba(247,243,236,0.5)", background: item.key === "dashboard" ? "rgba(255,255,255,0.08)" : "transparent", cursor: "pointer", borderLeft: `3px solid ${item.key === "dashboard" ? "#C9993A" : "transparent"}`, transition: "all .2s" }}
              onClick={() => onNavigate?.(item.key)}
              onMouseEnter={(e) => { if (item.key !== "dashboard") e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (item.key !== "dashboard") e.currentTarget.style.background = "transparent"; }}
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

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 }}>Dashboard</div>
          <span style={{ fontSize: 12, color: "#8A8278" }}>{today}</span>
        </div>
        <div style={s.content}>
          {/* Stats */}
          <div style={s.statsGrid}>
            {[
              { label: "Total Revenue", value: `$${STATS.totalRevenue.toLocaleString()}`, growth: STATS.revenueGrowth },
              { label: "Total Bookings", value: STATS.totalBookings, growth: STATS.bookingsGrowth },
              { label: "Total Customers", value: STATS.totalCustomers, growth: STATS.customersGrowth },
              { label: "Occupancy Rate", value: `${STATS.occupancyRate}%`, growth: STATS.occupancyGrowth },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 10 }}>{stat.label}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, color: "#1C1A16", marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: stat.growth >= 0 ? "#3A7D5A" : "#B94040", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>{stat.growth >= 0 ? "▲" : "▼"}</span>
                  <span>{Math.abs(stat.growth)}% vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardTitle}>Monthly Revenue</div>
              <RevenueChart data={MONTHLY_REVENUE} />
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Room Occupancy</div>
              {ROOM_OCCUPANCY.map((room) => (
                <div key={room.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ minWidth: 130, fontSize: 12, color: "#1C1A16" }}>{room.name}</div>
                  <div style={{ flex: 1, height: 6, background: "rgba(28,26,22,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${room.rate}%`, background: room.rate >= 75 ? "#3A7D5A" : room.rate >= 50 ? "#C9993A" : "#B94040", borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: room.rate >= 75 ? "#3A7D5A" : room.rate >= 50 ? "#C9993A" : "#B94040", minWidth: 36, textAlign: "right" }}>{room.rate}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.06)" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400 }}>Recent Bookings</div>
              <button onClick={() => onNavigate?.("bookings")} style={{ background: "transparent", border: "1px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "6px 16px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}>View All →</button>
            </div>
            <table style={s.table}>
              <thead>
                <tr>{["Booking ID", "Guest", "Room", "Check-in", "Check-out", "Total", "Status"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {RECENT_BOOKINGS.map((b) => {
                  const st = STATUS_STYLE[b.status];
                  return (
                    <tr key={b.id} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.02)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ ...s.td, color: "#C9993A", fontWeight: 500 }}>{b.id}</td>
                      <td style={s.td}>{b.guest}</td>
                      <td style={s.td}>{b.room}</td>
                      <td style={s.td}>{b.checkIn}</td>
                      <td style={s.td}>{b.checkOut}</td>
                      <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>${b.total.toLocaleString()}</td>
                      <td style={s.td}><span style={{ ...st, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 1 }}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}