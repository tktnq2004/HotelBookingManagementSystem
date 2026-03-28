import { useState, useEffect } from "react";
import roomService from "../services/room.service";
import { getRoomTypes } from "../services/roomType.service";

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
        <button onClick={onLogout} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(247,243,236,0.6)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px", fontSize: 11, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        > Back to home</button>
      </div>
    </div>
  );
}

function RoomModal({ room, onSave, onClose, roomTypes }) {
  const [form, setForm] = useState({
    roomNumber: room?.roomNumber || "",
    roomTypeId: room?.roomTypeId?._id || "",
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(room?.images || []);
  const [deletingImg, setDeletingImg] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    console.log("room.images:", room?.images);
    setForm({
      roomNumber: room?.roomNumber || "",
      roomTypeId: room?.roomTypeId?._id || "",
    });
    setExistingImages(room?.images || []);
    setNewImages([]);
  }, [room]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteExistingImage = async (img) => {
    if (!room?._id) return;
    setDeletingImg(img);
    try {
      await roomService.deleteImage(room._id, img);
      setExistingImages((prev) => prev.filter((i) => i !== img));
    } catch (err) {
      alert("Failed to delete image");
    } finally {
      setDeletingImg(null);
    }
  };

  const handleSave = () => {
    if (!form.roomNumber.trim()) return alert("Please enter room number");
    if (!form.roomTypeId) return alert("Please select room type");
    onSave(form, newImages);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, marginBottom: 24 }}>
          {room ? "Edit Room" : "Add Room"}
        </h2>

        <label style={{ fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" }}>Room Number</label>
        <input
          value={form.roomNumber}
          onChange={(e) => set("roomNumber", e.target.value)}
          placeholder="e.g. 101"
          style={{ width: "100%", marginBottom: 16, marginTop: 6, padding: "9px 12px", border: "1.5px solid rgba(28,26,22,0.15)", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box" }}
        />

        <label style={{ fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" }}>Room Type</label>
        <select
          value={form.roomTypeId}
          onChange={(e) => set("roomTypeId", e.target.value)}
          style={{ width: "100%", marginBottom: 20, marginTop: 6, padding: "9px 12px", border: "1.5px solid rgba(28,26,22,0.15)", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 13, boxSizing: "border-box" }}
        >
          <option value="">Select type</option>
          {roomTypes.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <label style={{ fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" }}>Images</label>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
          style={{ display: "block", marginTop: 6, marginBottom: 12, fontSize: 12 }}
        />

        {(existingImages.length > 0 || newImages.length > 0) && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} style={{ position: "relative", width: 80, height: 80 }}>
                <img
                  src={`http://localhost:5000${img}`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                />
                <button
                  onClick={() => handleDeleteExistingImage(img)}
                  disabled={deletingImg === img}
                  style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {deletingImg === img ? "…" : "×"}
                </button>
              </div>
            ))}


            {newImages.map((img, index) => (
              <div key={`new-${index}`} style={{ position: "relative", width: 80, height: 80 }}>
                <img
                  src={img.preview}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, border: "2px solid #C9993A" }}
                />

                <button
                  onClick={() => handleRemoveNewImage(index)}
                  style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {newImages.length > 0 && (
          <p style={{ fontSize: 11, color: "#C9993A", marginBottom: 16 }}>
            ⚠ {newImages.length} image{newImages.length > 1 ? "s" : ""} pending upload
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: 11, fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}
          >Cancel</button>
          <button
            onClick={handleSave}
            style={{ flex: 2, background: "#1C1A16", color: "#F7F3EC", border: "none", padding: 11, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}
          >Save Room</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ room, onConfirm, onClose }) {
  if (!room) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,26,22,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 4, padding: 40, maxWidth: 400, width: "90%", boxShadow: "0 12px 48px rgba(28,26,22,.2)" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Delete Room?</h2>
        <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.7, marginBottom: 28 }}>
          Are you sure you want to delete room <strong style={{ color: "#1C1A16" }}>#{room.roomNumber} – {room.roomTypeId?.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid rgba(28,26,22,0.15)", color: "#8A8278", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 }}>Cancel</button>
          <button onClick={() => onConfirm(room._id)} style={{ flex: 2, background: "#B94040", color: "#fff", border: "none", padding: "11px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: 2 }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRooms({ onLogout, adminUser, onNavigate }) {
  const [rooms, setRooms] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (editRoom) {
      setExistingImages(editRoom.images || []);
    }
  }, [editRoom]);

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [page, search, filterType]);

  useEffect(() => {
    setPage(1);
  }, [search, filterType]);

  const fetchRooms = async () => {
    try {
      const res = await roomService.adminRooms({
        page,
        limit,
        search,
        roomTypeId: filterType !== "All" ? filterType : undefined
      });

      setRooms(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoomTypes = async () => {
    const res = await getRoomTypes();
    setRoomTypes(res.data.data);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = () => { setEditRoom(null); setShowModal(true); };
  const handleEdit = (room) => { setEditRoom(room); setShowModal(true); };

  const handleSave = async (form, newImages, existingImages) => {
    console.log("form data:", form);
    try {
      let roomId;

      if (editRoom) {
        await roomService.updateRoom(editRoom._id, {
          roomNumber: form.roomNumber,
          roomTypeId: form.roomTypeId,
        });
        roomId = editRoom._id;
      } else {
        const res = await roomService.createRoom({
          roomNumber: form.roomNumber,
          roomTypeId: form.roomTypeId,
        });
        roomId = res.data.data._id;
      }

      if (newImages.length > 0) {
        await roomService.uploadImages(
          roomId,
          newImages.map((img) => img.file)
        );
      }

      showToast(editRoom ? "Updated!" : "Created!");
      fetchRooms();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await roomService.deleteRoom(id);
      showToast("Room deleted.");
      fetchRooms();
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setDeleteRoom(null);
    }
  };

  const filtered = rooms.filter((r) => {
    const matchType =
      filterType === "All" ||
      r.roomTypeId?._id === filterType;

    const matchSearch =
      (r.roomNumber || "").toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  const statCounts = {
    total: rooms.length,
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
              { label: "Total Rooms", value: statCounts.total }
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
            <input style={s.searchInput} placeholder="Search room number" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              {roomTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span style={s.resultCount}>{filtered.length} room{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Room Number", "Room Type", "Images", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ ...s.td, textAlign: "center", color: "#8A8278", padding: "40px" }}>No rooms found</td>
                  </tr>
                ) : (
                  filtered.map((room) => {
                    return (
                      <tr key={room._id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.015)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ ...s.td, fontWeight: 600, color: "#C9993A" }}>#{room.roomNumber}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: "#C9993A" }}>{room.roomTypeId?.name}</td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {room.images?.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={`http://localhost:5000${img}`}
                                alt=""
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 4
                                }}
                              />
                            ))}

                            {room.images?.length > 3 && (
                              <div style={{
                                width: 40,
                                height: 40,
                                fontSize: 11,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0,0,0,0.05)",
                                borderRadius: 4
                              }}>
                                +{room.images.length - 3}
                              </div>
                            )}
                          </div>
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
          <div style={s.pagination}>
            <button
              style={{
                ...s.pageBtn,
                opacity: page === 1 ? 0.4 : 1,
                cursor: page === 1 ? "not-allowed" : "pointer"
              }}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  ...s.pageBtn,
                  ...(page === i + 1 ? s.pageBtnActive : {})
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              style={{
                ...s.pageBtn,
                opacity: page === totalPages ? 0.4 : 1,
                cursor: page === totalPages ? "not-allowed" : "pointer"
              }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <RoomModal
          room={editRoom}
          roomTypes={roomTypes}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditRoom(null);
          }}
        />
      )}
      <DeleteModal room={deleteRoom} onConfirm={handleDelete} onClose={() => setDeleteRoom(null)} />

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
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 28, },
  pageBtn: { minWidth: 34, height: 34, padding: "0 10px", border: "1px solid rgba(28,26,22,0.15)", background: "#fff", color: "#1C1A16", fontSize: 12, borderRadius: 4, cursor: "pointer", transition: "all .2s ease", fontFamily: "'DM Sans', sans-serif" },
  pageBtnActive: { background: "#1C1A16", color: "#F7F3EC", border: "1px solid #1C1A16", fontWeight: 600 }

};