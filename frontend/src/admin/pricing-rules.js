import { useState, useEffect } from "react";
import pricingService from "../services/pricing.service";
import { getRoomTypes } from "../services/roomType.service";

function Sidebar({ active, onNavigate, onLogout }) {
  const navItems = [
    { icon: "◈", label: "Dashboard", key: "dashboard" },
    {  label: "Room Types", key: "roomTypes" },
    {  label: "Rooms", key: "rooms" },
    {  label: "Bookings", key: "bookings" },
    {  label: "Pricing", key: "pricing" },
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
        <button onClick={onLogout} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(247,243,236,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        > Back to home</button>
      </div>
    </div>
  );
}

function PricingModal({ rule, roomTypes, onSave, onClose }) {
  const [form, setForm] = useState({
    name: rule?.name || "",
    roomTypeId: rule?.roomTypeId?._id || rule?.roomTypeId || "",
    startDate: rule?.startDate ? rule.startDate.split("T")[0] : "",
    endDate: rule?.endDate ? rule.endDate.split("T")[0] : "",
    multiplier: rule?.multiplier || "",
    priority: rule?.priority || 1,
    isActive: rule?.isActive ?? true,
  });

  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.roomTypeId) e.roomTypeId = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = "Must be after start date";
    if (!form.multiplier || isNaN(form.multiplier) || Number(form.multiplier) <= 0)
      e.multiplier = "Must be a positive number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, multiplier: Number(form.multiplier), priority: Number(form.priority) });
  };

  const selectedRoomType = roomTypes.find((r) => r._id === form.roomTypeId);
  const previewPrice = selectedRoomType && form.multiplier
    ? Math.round(selectedRoomType.basePrice * Number(form.multiplier))
    : null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>{rule ? "Edit Pricing Rule" : "Add Pricing Rule"}</div>
        <div style={s.grid}>
          <div style={s.fieldFull}>
            <label style={s.label}>Rule Name *</label>
            <input style={s.input(errors.name)} value={form.name}
              onChange={(e) => set("name", e.target.value)} placeholder="e.g. Summer Peak Season" />
            {errors.name && <div style={s.errText}>{errors.name}</div>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Room Type *</label>
            <select style={s.select} value={form.roomTypeId} onChange={(e) => set("roomTypeId", e.target.value)}>
              <option value="">Select type</option>
              {roomTypes.map((rt) => (
                <option key={rt._id} value={rt._id}>{rt.name} (${rt.basePrice}/night)</option>
              ))}
            </select>
            {errors.roomTypeId && <div style={s.errText}>{errors.roomTypeId}</div>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Priority</label>
            <input style={s.input()} type="number" min="1" value={form.priority}
              onChange={(e) => set("priority", e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Start Date *</label>
            <input style={s.input(errors.startDate)} type="date" value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)} />
            {errors.startDate && <div style={s.errText}>{errors.startDate}</div>}
          </div>

          <div style={s.field}>
            <label style={s.label}>End Date *</label>
            <input style={s.input(errors.endDate)} type="date" value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)} />
            {errors.endDate && <div style={s.errText}>{errors.endDate}</div>}
          </div>

          <div style={s.fieldFull}>
            <label style={s.label}>Multiplier * (1.3 = +30%, 0.8 = -20%)</label>
            <input style={s.input(errors.multiplier)} type="number" step="0.01"
              value={form.multiplier} onChange={(e) => set("multiplier", e.target.value)}
              placeholder="e.g. 1.3" />
            {errors.multiplier && <div style={s.errText}>{errors.multiplier}</div>}
          </div>

          <div style={s.fieldFull}>
            <label style={s.label}>Status</label>
            <select style={s.select} value={form.isActive}
              onChange={(e) => set("isActive", e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {previewPrice && (
          <div style={s.preview}>
            💡 <strong>Preview:</strong> {selectedRoomType.name} ${selectedRoomType.basePrice} × {form.multiplier} = <strong style={{ color: "#C9993A" }}>${previewPrice}/night</strong>
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

// ─── DELETE MODAL ──────────────────────────────────────────────────────────────
function DeleteModal({ rule, onConfirm, onClose }) {
  if (!rule) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Delete Rule?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Are you sure you want to delete <strong style={{ color: "#1C1A16" }}>"{rule.name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>Cancel</button>
          <button onClick={() => onConfirm(rule._id)} style={{ flex: 2, background: "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRICING PAGE ────────────────────────────────────────────────────────
export default function AdminPricing({ onLogout, adminUser, onNavigate }) {
  const [rules, setRules] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [deleteRule, setDeleteRule] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRules();
    fetchRoomTypes();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await pricingService.getRules();
      setRules(res.data.data || []);
    } catch (err) {
      console.error("fetchRules error:", err);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await getRoomTypes();
      setRoomTypes(res.data.data || []);
    } catch (err) {
      console.error("fetchRoomTypes error:", err);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (form) => {
    try {
      if (editRule) {
        await pricingService.updateRule(editRule._id, form);
        showToast("Pricing rule updated!");
      } else {
        await pricingService.createRule(form);
        showToast("Pricing rule added!");
      }
      fetchRules();
      setShowModal(false);
      setEditRule(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await pricingService.deleteRule(id);
      showToast("Pricing rule deleted.");
      fetchRules();
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setDeleteRule(null);
    }
  };

  const filtered = rules.filter((r) => {
    if (filterActive === "active") return r.isActive === true;
    if (filterActive === "inactive") return r.isActive === false;
    return true;
  });

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
          <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 12 }}>✦ Base Prices</p>
          <div style={s.basePriceGrid}>
            {roomTypes.map((rt) => (
              <div key={rt._id} style={s.basePriceCard}>
                <div style={s.bpType}>{rt.name}</div>
                <div style={s.bpPrice}>${rt.basePrice}</div>
                <div style={s.bpLabel}>per night (base)</div>
              </div>
            ))}
          </div>

          <div style={s.filterBar}>
            <select style={s.filterSelect} value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
              <option value="all">All Rules</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={s.resultCount}>{filtered.length} rule{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Rule Name", "Room Type", "Start Date", "End Date", "Multiplier", "Preview", "Priority", "Status", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No pricing rules found</td></tr>
                ) : (
                  filtered.map((rule) => {
                    const rt = rule.roomTypeId;
                    const preview = rt ? Math.round(rt.basePrice * rule.multiplier) : "-";
                    const isIncrease = rule.multiplier >= 1;
                    return (
                      <tr key={rule._id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ ...s.td, fontWeight: 500 }}>{rule.name}</td>
                        <td style={s.td}>{rt?.name || "-"}</td>
                        <td style={s.td}>{new Date(rule.startDate).toLocaleDateString()}</td>
                        <td style={s.td}>{new Date(rule.endDate).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <span style={{ color: isIncrease ? "#3A7D5A" : "#B94040", fontWeight: 600 }}>
                            ×{rule.multiplier} {isIncrease
                              ? `(+${Math.round((rule.multiplier - 1) * 100)}%)`
                              : `(-${Math.round((1 - rule.multiplier) * 100)}%)`}
                          </span>
                        </td>
                        <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#C9993A" }}>
                          ${preview}/night
                        </td>
                        <td style={s.td}>{rule.priority}</td>
                        <td style={s.td}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                            padding: "3px 9px", borderRadius: 1,
                            background: rule.isActive ? "rgba(58,125,90,0.1)" : "rgba(138,130,120,0.1)",
                            color: rule.isActive ? "#3A7D5A" : "#8A8278"
                          }}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
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

      {showModal && (
        <PricingModal
          key={editRule?._id || "new"}
          rule={editRule}
          roomTypes={roomTypes}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditRule(null); }}
        />
      )}
      <DeleteModal rule={deleteRule} onConfirm={handleDelete} onClose={() => setDeleteRule(null)} />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#fff", borderRadius: 4, padding: 40, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 24 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldFull: { gridColumn: "1 / -1" },
  field: {},
  label: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6 },
  input: (err) => ({ width: "100%", border: `1.5px solid ${err ? "#B94040" : "rgba(28,26,22,0.15)"}`, borderRadius: 2, padding: "9px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box", outline: "none" }),
  select: { width: "100%", border: "1.5px solid rgba(28,26,22,0.15)", borderRadius: 2, padding: "9px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box" },
  errText: { fontSize: 11, color: "#B94040", marginTop: 4 },
  preview: { background: "#FDFAF7", border: "1px solid rgba(201,153,58,0.3)", borderRadius: 2, padding: "12px 16px", fontSize: 13, color: "#1C1A16", marginTop: 16, marginBottom: 8 },
  btnRow: { display: "flex", gap: 12, marginTop: 24 },
  btnGhost: { flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: 11, fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
  btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: 11, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 },
  layout: { display: "flex", minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
  main: { flex: 1, overflow: "auto" },
  topbar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  topbarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 },
  btnAdd: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "10px 22px", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  content: { padding: "32px 40px" },
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
