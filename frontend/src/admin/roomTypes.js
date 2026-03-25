import { useState, useEffect } from "react";
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from "../services/roomType.service";

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

function RoomTypeModal({ type, onSave, onClose }) {
  const [form, setForm] = useState({
    name: type?.name || "",
    capacity: type?.capacity || "",
    basePrice: type?.basePrice || "",
    amenities: type?.amenities?.join(", ") || "",
    // Policy fields
    cancellation: type?.policy?.cancellation || "free",
    cancelDeadlineHours: type?.policy?.cancelDeadlineHours ?? 24,
    refundPercent: type?.policy?.refundPercent ?? 100,
    checkInTime: type?.policy?.checkInTime || "14:00",
    checkOutTime: type?.policy?.checkOutTime || "12:00",
    extraGuestFee: type?.policy?.extraGuestFee ?? 0,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    const payload = {
      name: form.name,
      capacity: Number(form.capacity),
      basePrice: Number(form.basePrice),
      amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()) : [],
      policy: {
        cancellation: form.cancellation,
        cancelDeadlineHours: Number(form.cancelDeadlineHours),
        refundPercent: Number(form.refundPercent),
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        extraGuestFee: Number(form.extraGuestFee),
      },
    };
    onSave(payload);
  };

  // Cancellation type → tự động gợi ý refundPercent
  const handleCancellationChange = (val) => {
    set("cancellation", val);
    if (val === "free") { set("refundPercent", 100); set("cancelDeadlineHours", 24); }
    if (val === "non-refundable") { set("refundPercent", 0); set("cancelDeadlineHours", 0); }
  };

  const CANCEL_OPTIONS = [
    { value: "free", label: "Free — Hoàn 100% trước deadline" },
    { value: "partial", label: "Partial — Hoàn một phần" },
    { value: "non-refundable", label: "Non-refundable — Không hoàn tiền" },
  ];

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>{type ? "Edit Room Type" : "Add Room Type"}</div>

        {/* ── Basic Info ── */}
        <div style={s.sectionLabel}>Basic Info</div>
        <div style={s.grid}>
          <div style={s.fieldFull}>
            <label style={s.label}>Type Name *</label>
            <input style={s.input()} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Luxury Suite" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Capacity (Guests) *</label>
            <input style={s.input()} type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="2" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Base Price / Night ($) *</label>
            <input style={s.input()} type="number" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} placeholder="150" />
          </div>
          <div style={s.fieldFull}>
            <label style={s.label}>Amenities (comma separated)</label>
            <textarea style={{ ...s.input(), height: 72, resize: "none" }} value={form.amenities}
              onChange={(e) => set("amenities", e.target.value)} placeholder="Wifi, Minibar, Ocean View..." />
          </div>
        </div>

        {/* ── Policy ── */}
        <div style={s.sectionLabel}>Policy</div>
        <div style={s.grid}>
          {/* Cancellation type */}
          <div style={s.fieldFull}>
            <label style={s.label}>Cancellation Type</label>
            <select style={{ ...s.input(), cursor: "pointer" }} value={form.cancellation}
              onChange={(e) => handleCancellationChange(e.target.value)}>
              {CANCEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Chỉ hiện nếu không phải non-refundable */}
          {form.cancellation !== "non-refundable" && (
            <>
              <div style={s.field}>
                <label style={s.label}>Cancel Deadline (hours before check-in)</label>
                <input style={s.input()} type="number" min={0} value={form.cancelDeadlineHours}
                  onChange={(e) => set("cancelDeadlineHours", e.target.value)} placeholder="24" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Refund % (if cancelled in time)</label>
                <input style={s.input()} type="number" min={0} max={100}
                  value={form.refundPercent} disabled={form.cancellation === "free"}
                  onChange={(e) => set("refundPercent", e.target.value)} placeholder="100" />
              </div>
            </>
          )}

          {/* Check-in / Check-out */}
          <div style={s.field}>
            <label style={s.label}>Check-in Time</label>
            <input style={s.input()} type="time" value={form.checkInTime}
              onChange={(e) => set("checkInTime", e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Check-out Time</label>
            <input style={s.input()} type="time" value={form.checkOutTime}
              onChange={(e) => set("checkOutTime", e.target.value)} />
          </div>


          <div style={s.fieldFull}>
            <label style={s.label}>Extra Guest Fee / Night ($)</label>
            <input style={s.input()} type="number" min={0} value={form.extraGuestFee}
              onChange={(e) => set("extraGuestFee", e.target.value)} placeholder="0" />
          </div>
        </div>


        <div style={s.policyBadge(form.cancellation)}>
          {form.cancellation === "free" && `✓ Hoàn 100% nếu hủy trước ${form.cancelDeadlineHours}h check-in`}
          {form.cancellation === "partial" && `⚡ Hoàn ${form.refundPercent}% nếu hủy trước ${form.cancelDeadlineHours}h check-in`}
          {form.cancellation === "non-refundable" && `✕ Không hoàn tiền trong mọi trường hợp`}
        </div>

        <div style={s.btnRow}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={handleSave}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >{type ? "Save Changes" : "Create Type"}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ type, onConfirm, onClose }) {
  if (!type) return null;
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Delete Room Type?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Are you sure you want to delete <strong style={{ color: "#1C1A16" }}>{type.name}</strong>? This will affect all rooms assigned to this type.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={s.btnGhost}>Cancel</button>
          <button onClick={() => onConfirm(type._id)} style={{ ...s.btnPrimary, background: "#B94040", flex: 2 }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRoomTypes({ onLogout, adminUser, onNavigate }) {
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const res = await getRoomTypes();
      setRoomTypes(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (form) => {
    try {
      if (editType) {
        await updateRoomType(editType._id, form);
        showToast("Room type updated!");
      } else {
        await createRoomType(form);
        showToast("Room type created!");
      }
      fetchRoomTypes();
      setShowModal(false);
      setEditType(null);
    } catch (err) { showToast(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoomType(id);
      showToast("Room type deleted.");
      fetchRoomTypes();
    } catch (err) { showToast("Delete failed", "error"); }
    finally { setDeleteType(null); }
  };

  return (
    <div style={s.layout}>
      <Sidebar active="roomTypes" onNavigate={onNavigate} onLogout={onLogout} adminUser={adminUser} />

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Room Type Management</div>
          <button style={s.btnAdd} onClick={() => { setEditType(null); setShowModal(true); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >+ Add Room Type</button>
        </div>

        <div style={s.content}>
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <span style={s.statIcon}>🏷</span>
              <div>
                <div style={s.statVal}>{roomTypes.length}</div>
                <div style={s.statLbl}>Total Types</div>
              </div>
            </div>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Type Name", "Capacity", "Base Price", "Amenities", "Policy", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roomTypes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No room types found</td>
                  </tr>
                ) : (
                  roomTypes.map((type) => (
                    <tr key={type._id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...s.td, fontWeight: 600, color: "#C9993A" }}>{type.name}</td>
                      <td style={s.td}>{type.capacity} Guests</td>
                      <td style={{ ...s.td, fontFamily: "'Playfair Display', serif", fontSize: 16 }}> ${type.basePrice} </td>
                      <td style={{ ...s.td, fontSize: 12, color: "#8A8278", maxWidth: 300 }}>
                        {type.amenities?.join(" • ")}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10,
                          fontWeight: 600, letterSpacing: "0.5px",
                          background: type.policy?.cancellation === "free" ? "rgba(58,125,90,0.1)"
                            : type.policy?.cancellation === "partial" ? "rgba(201,153,58,0.1)"
                              : "rgba(185,64,64,0.1)",
                          color: type.policy?.cancellation === "free" ? "#3A7D5A"
                            : type.policy?.cancellation === "partial" ? "#9A7020"
                              : "#B94040",
                        }}>
                          {type.policy?.cancellation || "free"}
                        </span>
                        <div style={{ fontSize: 11, color: "#8A8278", marginTop: 4 }}>
                          {type.policy?.cancellation !== "non-refundable"
                            ? `${type.policy?.cancelDeadlineHours ?? 24}h • ${type.policy?.refundPercent ?? 100}% refund`
                            : "No refund"}
                        </div>
                      </td>
                      <td style={s.td}>
                        <button style={s.btnEdit} onClick={() => { setEditType(type); setShowModal(true); }}>Edit</button>
                        <button style={s.btnDelete} onClick={() => setDeleteType(type)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && <RoomTypeModal type={editType} onSave={handleSave} onClose={() => setShowModal(false)} />}
      <DeleteModal type={deleteType} onConfirm={handleDelete} onClose={() => setDeleteType(null)} />

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
  btnAdd: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "10px 22px", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  content: { padding: "32px 40px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
  statCard: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 },
  statIcon: { fontSize: 24 },
  statVal: { fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1C1A16" },
  statLbl: { fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" },
  tableWrap: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(28,26,22,0.08)", fontWeight: 500, background: "#FDFAF7" },
  td: { fontSize: 13, padding: "14px 16px", borderBottom: "1px solid rgba(28,26,22,0.05)", color: "#1C1A16", verticalAlign: "middle" },
  btnEdit: { background: "transparent", border: "1px solid rgba(28,26,22,0.15)", color: "#1C1A16", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
  btnDelete: { background: "transparent", border: "1px solid rgba(185,64,64,0.3)", color: "#B94040", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#fff", borderRadius: 4, padding: 40, width: 560, maxWidth: "95vw", boxShadow: "0 12px 48px rgba(28,26,22,.2)", maxHeight: "90vh", overflowY: "auto" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid rgba(28,26,22,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 },
  field: { marginBottom: 16 },
  fieldFull: { marginBottom: 16, gridColumn: "1 / -1" },
  label: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6, fontWeight: 500 },
  input: () => ({ width: "100%", border: "1.5px solid rgba(28,26,22,0.12)", borderRadius: 2, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none", background: "#fff", boxSizing: "border-box" }),
  btnRow: { display: "flex", gap: 12, marginTop: 24 },
  btnPrimary: { flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 },
  btnGhost: { flex: 1, background: "transparent", color: "#8A8278", border: "1.5px solid rgba(28,26,22,0.15)", padding: "13px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 },
  sectionLabel: {
    fontSize: 10, letterSpacing: "2px", textTransform: "uppercase",
    color: "#C9993A", fontWeight: 700, marginBottom: 12, marginTop: 8,
    paddingBottom: 6, borderBottom: "1px solid rgba(201,153,58,0.2)"
  },

  policyBadge: (type) => ({
    background: type === "free" ? "rgba(58,125,90,0.08)" : type === "partial" ? "rgba(201,153,58,0.08)" : "rgba(185,64,64,0.08)",
    border: `1px solid ${type === "free" ? "rgba(58,125,90,0.25)" : type === "partial" ? "rgba(201,153,58,0.25)" : "rgba(185,64,64,0.25)"}`,
    color: type === "free" ? "#3A7D5A" : type === "partial" ? "#9A7020" : "#B94040",
    borderRadius: 2, padding: "10px 14px", fontSize: 12, marginBottom: 4,
  })
};