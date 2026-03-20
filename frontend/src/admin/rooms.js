import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_ROOMS = [
  { id: 1, roomNumber: "101", type: "Standard", name: "Superior Room", status: "available", price: 120, capacity: 2, floor: "1st Floor" },
  { id: 2, roomNumber: "201", type: "Deluxe", name: "Deluxe Room", status: "occupied", price: 220, capacity: 2, floor: "2nd Floor" },
  { id: 3, roomNumber: "301", type: "Suite", name: "Grand Suite", status: "available", price: 450, capacity: 4, floor: "3rd Floor" },
  { id: 4, roomNumber: "302", type: "Suite", name: "Grand Suite", status: "maintenance", price: 450, capacity: 4, floor: "3rd Floor" },
  { id: 5, roomNumber: "401", type: "Presidential", name: "Presidential Suite", status: "available", price: 980, capacity: 6, floor: "Top Floor" },
  { id: 6, roomNumber: "102", type: "Standard", name: "Superior Room", status: "occupied", price: 120, capacity: 2, floor: "1st Floor" },
];

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Presidential"];
const STATUS_LIST = ["available", "occupied", "maintenance"];

const STATUS_STYLE = {
  available:   { background: "rgba(39,174,96,0.1)",  color: "#3A7D5A", label: "Available" },
  occupied:    { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Occupied" },
  maintenance: { background: "rgba(185,64,64,0.1)",  color: "#B94040", label: "Maintenance" },
};

const EMPTY_FORM = { roomNumber: "", type: "Standard", name: "Superior Room", status: "available", price: "", capacity: "", floor: "" };

// ─── SIDEBAR (shared) ─────────────────────────────────────────────────────────
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {adminUser?.email?.[0]?.toUpperCase() || "A"}
          </div>
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

// ─── ROOM FORM MODAL ──────────────────────────────────────────────────────────
function RoomModal({ room, onSave, onClose }) {
  const [form, setForm] = useState(room || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.roomNumber) e.roomNumber = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Must be a positive number";
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) <= 0) e.capacity = "Must be a positive number";
    if (!form.floor) e.floor = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, price: Number(form.price), capacity: Number(form.capacity) });
  };

  const s = {
    overlay: { position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#fff", borderRadius: 4, padding: 40, width: 560, maxWidth: "95vw", boxShadow: "0 12px 48px rgba(28,26,22,.2)", maxHeight: "90vh", overflowY: "auto" },
    title: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid rgba(28,26,22,0.08)" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 },
    field: { marginBottom: 16 },
    fieldFull: { marginBottom: 16, gridColumn: "1 / -1" },
    label: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6, fontWeight: 500 },
    input: (err) => ({ width: "100%", border: `1.5px solid ${err ? "#B94040" : "rgba(28,26,22,0.12)"}`, borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", boxSizing: "border-box" }),
    select: (err) => ({ width: "100%", border: `1.5px solid ${err ? "#B94040" : "rgba(28,26,22,0.12)"}`, borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" }),
    errText: { fontSize: 11, color: "#B94040", marginTop: 4 },
    btnRow: { display: "flex", gap: 12, marginTop: 24 },
    btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 },
    btnGhost: { flex: 1, background: "transparent", color: "#8A8278", border: "1.5px solid rgba(28,26,22,0.15)", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
  };

  // Auto-fill name based on type
  const typeNameMap = { Standard: "Superior Room", Deluxe: "Deluxe Room", Suite: "Grand Suite", Presidential: "Presidential Suite" };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>{room ? "Edit Room" : "Add New Room"}</div>
        <div style={s.grid}>
          <div style={s.field}>
            <label style={s.label}>Room Number *</label>
            <input style={s.input(errors.roomNumber)} value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} placeholder="e.g. 101" />
            {errors.roomNumber && <div style={s.errText}>{errors.roomNumber}</div>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Floor</label>
            <input style={s.input(errors.floor)} value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 1st Floor" />
            {errors.floor && <div style={s.errText}>{errors.floor}</div>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Room Type</label>
            <select style={s.select()} value={form.type} onChange={(e) => { set("type", e.target.value); set("name", typeNameMap[e.target.value]); }}>
              {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Status</label>
            <select style={s.select()} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Price / Night ($) *</label>
            <input style={s.input(errors.price)} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 120" />
            {errors.price && <div style={s.errText}>{errors.price}</div>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Max Capacity *</label>
            <input style={s.input(errors.capacity)} type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 2" />
            {errors.capacity && <div style={s.errText}>{errors.capacity}</div>}
          </div>
          <div style={s.fieldFull}>
            <label style={s.label}>Room Name</label>
            <input style={s.input()} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Superior Room" />
          </div>
        </div>
        <div style={s.btnRow}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={handleSave}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >{room ? "Save Changes" : "Add Room"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({ room, onConfirm, onClose }) {
  if (!room) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Delete Room?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Are you sure you want to delete room <strong style={{ color: "#1C1A16" }}>#{room.roomNumber} – {room.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>Cancel</button>
          <button onClick={() => onConfirm(room.id)} style={{ flex: 2, background: "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ROOMS PAGE ─────────────────────────────────────────────────────────
export default function AdminRooms({ onLogout, adminUser, onNavigate }) {
  const [rooms, setRooms] = useState(INIT_ROOMS);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = () => { setEditRoom(null); setShowModal(true); };
  const handleEdit = (room) => { setEditRoom(room); setShowModal(true); };

  const handleSave = (form) => {
    if (editRoom) {
      setRooms((prev) => prev.map((r) => r.id === editRoom.id ? { ...r, ...form } : r));
      showToast("Room updated successfully!");
    } else {
      setRooms((prev) => [...prev, { ...form, id: Date.now() }]);
      showToast("Room added successfully!");
    }
    setShowModal(false);
    setEditRoom(null);
  };

  const handleDelete = (id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setDeleteRoom(null);
    showToast("Room deleted.");
  };

  const filtered = rooms.filter((r) => {
    const matchType = filterType === "All" || r.type === filterType;
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    main: { flex: 1, overflow: "auto" },
    topbar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    topbarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 },
    btnAdd: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "10px 22px", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    content: { padding: "32px 40px" },
    // Filter bar
    filterBar: { display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" },
    searchInput: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "9px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", width: 220 },
    filterSelect: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "9px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" },
    resultCount: { fontSize: 12, color: "#8A8278", marginLeft: "auto" },
    // Stats
    statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
    statCard: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 },
    statIcon: { fontSize: 24 },
    statVal: { fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1C1A16" },
    statLbl: { fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" },
    // Table
    tableWrap: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(28,26,22,0.08)", fontWeight: 500, background: "#FDFAF7" },
    td: { fontSize: 13, padding: "14px 16px", borderBottom: "1px solid rgba(28,26,22,0.05)", color: "#1C1A16", verticalAlign: "middle" },
    btnEdit: { background: "transparent", border: "1px solid rgba(28,26,22,0.15)", color: "#1C1A16", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
    btnDelete: { background: "transparent", border: "1px solid rgba(185,64,64,0.3)", color: "#B94040", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  };

  const statCounts = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  return (
    <div style={s.layout}>
      <Sidebar active="rooms" onNavigate={onNavigate} onLogout={onLogout} adminUser={adminUser} />

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Room Management</div>
          <button style={s.btnAdd} onClick={handleAdd}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >+ Add Room</button>
        </div>

        <div style={s.content}>
          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { icon: "🏨", label: "Total Rooms", value: statCounts.total },
              { icon: "✅", label: "Available", value: statCounts.available, color: "#3A7D5A" },
              { icon: "🔴", label: "Occupied", value: statCounts.occupied, color: "#C9993A" },
              { icon: "🔧", label: "Maintenance", value: statCounts.maintenance, color: "#B94040" },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <span style={s.statIcon}>{stat.icon}</span>
                <div>
                  <div style={{ ...s.statVal, color: stat.color || "#1C1A16" }}>{stat.value}</div>
                  <div style={s.statLbl}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={s.filterBar}>
            <input style={s.searchInput} placeholder="Search room number or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={s.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select style={s.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
            </select>
            <span style={s.resultCount}>{filtered.length} room{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Room No.", "Name", "Type", "Floor", "Capacity", "Price / Night", "Status", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No rooms found</td>
                  </tr>
                ) : (
                  filtered.map((room) => {
                    const st = STATUS_STYLE[room.status];
                    return (
                      <tr key={room.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ ...s.td, fontWeight: 600, color: "#C9993A" }}>#{room.roomNumber}</td>
                        <td style={s.td}>{room.name}</td>
                        <td style={s.td}>{room.type}</td>
                        <td style={s.td}>{room.floor}</td>
                        <td style={s.td}>{room.capacity} guests</td>
                        <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>${room.price}</td>
                        <td style={s.td}>
                          <span style={{ ...st, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 1 }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={s.td}>
                          <button style={s.btnEdit} onClick={() => handleEdit(room)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >Edit</button>
                          <button style={s.btnDelete} onClick={() => setDeleteRoom(room)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(185,64,64,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >Delete</button>
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

      {/* MODALS */}
      {showModal && <RoomModal room={editRoom} onSave={handleSave} onClose={() => { setShowModal(false); setEditRoom(null); }} />}
      <DeleteModal room={deleteRoom} onConfirm={handleDelete} onClose={() => setDeleteRoom(null)} />

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}