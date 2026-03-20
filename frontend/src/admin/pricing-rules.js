import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ROOM_TYPES_DATA = [
  { id: 1, name: "Standard", basePrice: 120 },
  { id: 2, name: "Deluxe", basePrice: 220 },
  { id: 3, name: "Suite", basePrice: 450 },
  { id: 4, name: "Presidential", basePrice: 980 },
];

const INIT_RULES = [
  { id: 1, roomTypeId: 1, roomType: "Standard", name: "Summer Peak", startDate: "2026-06-01", endDate: "2026-08-31", multiplier: 1.3, type: "seasonal" },
  { id: 2, roomTypeId: 2, roomType: "Deluxe", name: "New Year Holiday", startDate: "2026-12-25", endDate: "2027-01-05", multiplier: 1.5, type: "holiday" },
  { id: 3, roomTypeId: 3, roomType: "Suite", name: "Weekend Rate", startDate: "2026-04-01", endDate: "2026-12-31", multiplier: 1.2, type: "weekend" },
  { id: 4, roomTypeId: 4, roomType: "Presidential", name: "Low Season", startDate: "2026-01-01", endDate: "2026-03-31", multiplier: 0.85, type: "seasonal" },
];

const RULE_TYPES = ["seasonal", "holiday", "weekend"];
const RULE_TYPE_STYLE = {
  seasonal: { background: "rgba(39,174,96,0.1)", color: "#3A7D5A", label: "Seasonal" },
  holiday:  { background: "rgba(201,153,58,0.1)", color: "#C9993A", label: "Holiday" },
  weekend:  { background: "rgba(58,107,201,0.1)", color: "#3A6BC9", label: "Weekend" },
};

const EMPTY_RULE = { roomTypeId: 1, roomType: "Standard", name: "", startDate: "", endDate: "", multiplier: "", type: "seasonal" };

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

// ─── PRICING RULE MODAL ───────────────────────────────────────────────────────
function PricingModal({ rule, onSave, onClose }) {
  const [form, setForm] = useState(rule || EMPTY_RULE);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = "Must be after start date";
    if (!form.multiplier || isNaN(form.multiplier) || Number(form.multiplier) <= 0) e.multiplier = "Must be a positive number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const roomType = ROOM_TYPES_DATA.find((r) => r.id === Number(form.roomTypeId));
    onSave({ ...form, roomTypeId: Number(form.roomTypeId), roomType: roomType?.name || "", multiplier: Number(form.multiplier) });
  };

  const previewPrice = () => {
    const rt = ROOM_TYPES_DATA.find((r) => r.id === Number(form.roomTypeId));
    if (!rt || !form.multiplier || isNaN(form.multiplier)) return null;
    return Math.round(rt.basePrice * Number(form.multiplier));
  };

  const s = {
    overlay: { position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#fff", borderRadius: 4, padding: 40, width: 540, maxWidth: "95vw", boxShadow: "0 12px 48px rgba(28,26,22,.2)", maxHeight: "90vh", overflowY: "auto" },
    title: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid rgba(28,26,22,0.08)" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    field: { marginBottom: 16 },
    fieldFull: { marginBottom: 16, gridColumn: "1 / -1" },
    label: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6, fontWeight: 500 },
    input: (err) => ({ width: "100%", border: `1.5px solid ${err ? "#B94040" : "rgba(28,26,22,0.12)"}`, borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", boxSizing: "border-box" }),
    select: { width: "100%", border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" },
    errText: { fontSize: 11, color: "#B94040", marginTop: 4 },
    preview: { background: "#F7F3EC", borderRadius: 2, padding: "12px 16px", fontSize: 13, color: "#1C1A16", marginBottom: 16 },
    btnRow: { display: "flex", gap: 12, marginTop: 8 },
    btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 },
    btnGhost: { flex: 1, background: "transparent", color: "#8A8278", border: "1.5px solid rgba(28,26,22,0.15)", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
  };

  const preview = previewPrice();

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>{rule ? "Edit Pricing Rule" : "Add Pricing Rule"}</div>
        <div style={s.grid}>
          <div style={{ ...s.fieldFull }}>
            <label style={s.label}>Rule Name *</label>
            <input style={s.input(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Summer Peak Season" />
            {errors.name && <div style={s.errText}>{errors.name}</div>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Room Type</label>
            <select style={s.select} value={form.roomTypeId} onChange={(e) => set("roomTypeId", e.target.value)}>
              {ROOM_TYPES_DATA.map((rt) => <option key={rt.id} value={rt.id}>{rt.name} (${rt.basePrice}/night)</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Rule Type</label>
            <select style={s.select} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {RULE_TYPES.map((t) => <option key={t} value={t}>{RULE_TYPE_STYLE[t].label}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Start Date *</label>
            <input style={s.input(errors.startDate)} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            {errors.startDate && <div style={s.errText}>{errors.startDate}</div>}
          </div>
          <div style={s.field}>
            <label style={s.label}>End Date *</label>
            <input style={s.input(errors.endDate)} type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            {errors.endDate && <div style={s.errText}>{errors.endDate}</div>}
          </div>
          <div style={{ ...s.fieldFull }}>
            <label style={s.label}>Price Multiplier * (e.g. 1.3 = +30%, 0.8 = -20%)</label>
            <input style={s.input(errors.multiplier)} type="number" step="0.01" value={form.multiplier} onChange={(e) => set("multiplier", e.target.value)} placeholder="e.g. 1.3" />
            {errors.multiplier && <div style={s.errText}>{errors.multiplier}</div>}
          </div>
        </div>

        {/* Price Preview */}
        {preview && (
          <div style={s.preview}>
            💡 <strong>Price Preview:</strong> {form.roomType || ROOM_TYPES_DATA.find((r) => r.id === Number(form.roomTypeId))?.name} base price ${ROOM_TYPES_DATA.find((r) => r.id === Number(form.roomTypeId))?.basePrice} × {form.multiplier} = <strong style={{ color: "#C9993A" }}>${preview}/night</strong>
          </div>
        )}

        <div style={s.btnRow}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={handleSave}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >{rule ? "Save Changes" : "Add Rule"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
function DeleteModal({ rule, onConfirm, onClose }) {
  if (!rule) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Delete Rule?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Are you sure you want to delete pricing rule <strong style={{ color: "#1C1A16" }}>"{rule.name}"</strong>?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>Cancel</button>
          <button onClick={() => onConfirm(rule.id)} style={{ flex: 2, background: "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRICING PAGE ───────────────────────────────────────────────────────
export default function AdminPricing({ onLogout, adminUser, onNavigate }) {
  const [rules, setRules] = useState(INIT_RULES);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [deleteRule, setDeleteRule] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (form) => {
    if (editRule) {
      setRules((prev) => prev.map((r) => r.id === editRule.id ? { ...r, ...form } : r));
      showToast("Pricing rule updated!");
    } else {
      setRules((prev) => [...prev, { ...form, id: Date.now() }]);
      showToast("Pricing rule added!");
    }
    setShowModal(false);
    setEditRule(null);
  };

  const handleDelete = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDeleteRule(null);
    showToast("Pricing rule deleted.");
  };

  const filtered = filterType === "All" ? rules : rules.filter((r) => r.type === filterType);

  const s = {
    layout: { display: "flex", minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    main: { flex: 1, overflow: "auto" },
    topbar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    topbarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 },
    btnAdd: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "10px 22px", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    content: { padding: "32px 40px" },
    // Base prices
    basePriceGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 },
    basePriceCard: { background: "#1C1A16", borderRadius: 3, padding: "20px 24px" },
    bpType: { fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(247,243,236,0.5)", marginBottom: 8 },
    bpPrice: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#C9993A", marginBottom: 4 },
    bpLabel: { fontSize: 11, color: "rgba(247,243,236,0.4)" },
    filterBar: { display: "flex", gap: 12, alignItems: "center", marginBottom: 24 },
    filterSelect: { border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "9px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff" },
    resultCount: { fontSize: 12, color: "#8A8278", marginLeft: "auto" },
    tableWrap: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(28,26,22,0.08)", fontWeight: 500, background: "#FDFAF7" },
    td: { fontSize: 13, padding: "14px 16px", borderBottom: "1px solid rgba(28,26,22,0.05)", color: "#1C1A16", verticalAlign: "middle" },
    btnEdit: { background: "transparent", border: "1px solid rgba(28,26,22,0.15)", color: "#1C1A16", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
    btnDelete: { background: "transparent", border: "1px solid rgba(185,64,64,0.3)", color: "#B94040", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  };

  return (
    <div style={s.layout}>
      <Sidebar active="pricing" onNavigate={onNavigate} onLogout={onLogout} adminUser={adminUser} />

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Pricing Management</div>
          <button style={s.btnAdd} onClick={() => { setEditRule(null); setShowModal(true); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >+ Add Rule</button>
        </div>

        <div style={s.content}>
          {/* Base Prices */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 12 }}>✦ Base Prices</p>
          </div>
          <div style={s.basePriceGrid}>
            {ROOM_TYPES_DATA.map((rt) => (
              <div key={rt.id} style={s.basePriceCard}>
                <div style={s.bpType}>{rt.name}</div>
                <div style={s.bpPrice}>${rt.basePrice}</div>
                <div style={s.bpLabel}>per night (base)</div>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div style={{ background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "16px 24px", marginBottom: 28, fontSize: 13, color: "#8A8278" }}>
            💡 <strong style={{ color: "#1C1A16" }}>Pricing Formula:</strong> Final Price = Base Price × Seasonal Multiplier × Number of Nights
          </div>

          {/* Filter */}
          <div style={s.filterBar}>
            <select style={s.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              {RULE_TYPES.map((t) => <option key={t} value={t}>{RULE_TYPE_STYLE[t].label}</option>)}
            </select>
            <span style={s.resultCount}>{filtered.length} rule{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Rule Name", "Room Type", "Type", "Start Date", "End Date", "Multiplier", "Preview Price", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No pricing rules found</td></tr>
                ) : (
                  filtered.map((rule) => {
                    const rt = ROOM_TYPES_DATA.find((r) => r.id === rule.roomTypeId);
                    const previewPrice = rt ? Math.round(rt.basePrice * rule.multiplier) : "-";
                    const rtStyle = RULE_TYPE_STYLE[rule.type];
                    const isIncrease = rule.multiplier >= 1;
                    return (
                      <tr key={rule.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ ...s.td, fontWeight: 500 }}>{rule.name}</td>
                        <td style={s.td}>{rule.roomType}</td>
                        <td style={s.td}>
                          <span style={{ ...rtStyle, fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 1 }}>{rtStyle.label}</span>
                        </td>
                        <td style={s.td}>{rule.startDate}</td>
                        <td style={s.td}>{rule.endDate}</td>
                        <td style={s.td}>
                          <span style={{ color: isIncrease ? "#3A7D5A" : "#B94040", fontWeight: 600 }}>
                            ×{rule.multiplier} {isIncrease ? `(+${Math.round((rule.multiplier - 1) * 100)}%)` : `(-${Math.round((1 - rule.multiplier) * 100)}%)`}
                          </span>
                        </td>
                        <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#C9993A" }}>${previewPrice}/night</td>
                        <td style={s.td}>
                          <button style={s.btnEdit} onClick={() => { setEditRule(rule); setShowModal(true); }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >Edit</button>
                          <button style={s.btnDelete} onClick={() => setDeleteRule(rule)}
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

      {showModal && <PricingModal rule={editRule} onSave={handleSave} onClose={() => { setShowModal(false); setEditRule(null); }} />}
      <DeleteModal rule={deleteRule} onConfirm={handleDelete} onClose={() => setDeleteRule(null)} />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}