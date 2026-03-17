import { useState } from "react";

const ROOMS = [
  {
    id: 1,
    name: "Superior Room",
    type: "Standard",
    price: 120,
    capacity: 2,
    badge: "Phổ biến",
    gradient: "linear-gradient(135deg,#2C2318,#6B4F2C)",
    amenities: ["WiFi miễn phí", "Điều hòa", "Smart TV", "Minibar"],
    description: "Phòng tiêu chuẩn ấm cúng với đầy đủ tiện nghi hiện đại, tầm nhìn ra thành phố tuyệt đẹp.",
  },
  {
    id: 2,
    name: "Deluxe Room",
    type: "Deluxe",
    price: 220,
    capacity: 2,
    badge: "Nổi bật",
    gradient: "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
    amenities: ["WiFi tốc độ cao", 'Smart TV 65"', "Bữa sáng", "Tầm nhìn biển"],
    description: "Phòng rộng rãi với nội thất sang trọng, tầm nhìn panorama. Bao gồm bữa sáng miễn phí.",
  },
  {
    id: 3,
    name: "Grand Suite",
    type: "Suite",
    price: 450,
    capacity: 4,
    badge: "Cao cấp",
    gradient: "linear-gradient(135deg,#1A1A2E,#4A3060)",
    amenities: ["WiFi tốc độ cao", "Jacuzzi", "Butler riêng", "Bữa sáng"],
    description: "Suite sang trọng với phòng khách riêng, bồn tắm Jacuzzi và tầm nhìn 180° ra vịnh.",
  },
  {
    id: 4,
    name: "Presidential Suite",
    type: "Presidential",
    price: 980,
    capacity: 6,
    badge: "VIP",
    gradient: "linear-gradient(135deg,#1C1A16,#5C3A18)",
    amenities: ["3 phòng ngủ", "Butler 24/7", "Spa riêng", "Đón sân bay"],
    description: "Đỉnh cao xa hoa – 3 phòng ngủ, spa riêng, butler service và đón tiễn sân bay.",
  },
];

const ROOM_TYPES = ["Tất cả", "Standard", "Deluxe", "Suite", "Presidential"];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getNextDay() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function RoomCard({ room, onView, onBook }) {
  return (
    <div
      style={{ border: "1px solid rgba(28,26,22,0.1)", borderRadius: 3, overflow: "hidden", cursor: "pointer", background: "#fff", transition: "all .3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(28,26,22,.14)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 200, background: room.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, color: "rgba(247,243,236,0.1)" }}>❖</span>
        <div style={{ position: "absolute", top: 14, left: 14, background: "#C9993A", color: "#1C1A16", fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", padding: "4px 9px", borderRadius: 1 }}>
          {room.badge}
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6 }}>
          {room.type} · {room.capacity} khách
        </p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 10, lineHeight: 1.2 }}>
          {room.name}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {room.amenities.slice(0, 4).map((a) => (
            <span key={a} style={{ fontSize: 10, color: "#8A8278", background: "#F7F3EC", padding: "3px 9px", borderRadius: 1 }}>{a}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(28,26,22,0.08)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1C1A16" }}>
            ${room.price}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8A8278", fontWeight: 400 }}> / đêm</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onView}
              style={{ border: "1px solid #1C1A16", background: "transparent", color: "#1C1A16", padding: "7px 14px", fontSize: 11, fontWeight: 500, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1C1A16"; e.currentTarget.style.color = "#F7F3EC"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1C1A16"; }}
            >Chi tiết</button>
            <button onClick={onBook}
              style={{ background: "#C9993A", border: "1px solid #C9993A", color: "#1C1A16", padding: "7px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#b8883a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#C9993A"; }}
            >Đặt ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
      {toast.msg}
    </div>
  );
}

export default function Home({ onViewRoom, onBookNow, onMyBookings }) {
  const [checkIn, setCheckIn] = useState(getToday);
  const [checkOut, setCheckOut] = useState(getNextDay);
  const [guests, setGuests] = useState("2");
  const [roomType, setRoomType] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSearch = () => {
    if (checkIn && checkOut && checkIn >= checkOut) {
      showToast("Ngày trả phòng phải sau ngày nhận phòng", "error");
      return;
    }
    const filtered = roomType ? ROOMS.filter((r) => r.type === roomType) : ROOMS;
    showToast(`Tìm thấy ${filtered.length} phòng phù hợp`);
    document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredRooms = (() => {
    const byTab = activeTab === "Tất cả" ? ROOMS : ROOMS.filter((r) => r.type === activeTab);
    return roomType ? byTab.filter((r) => r.type === roomType) : byTab;
  })();

  const s = {
    page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    navLinks: { display: "flex", alignItems: "center", gap: 32 },
    navLink: { fontSize: 13, color: "#8A8278", textDecoration: "none", cursor: "pointer", fontWeight: 400 },
    navLinkActive: { fontSize: 13, color: "#1C1A16", fontWeight: 500, cursor: "pointer" },
    btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    hero: { minHeight: "calc(100vh - 64px)", background: "linear-gradient(160deg,#1C1A16 0%,#3A2510 55%,#7A5C35 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px 40px", position: "relative", overflow: "hidden" },
    heroBg: { position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(45deg,#C9993A 0,#C9993A 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px", pointerEvents: "none" },
    heroContent: { position: "relative", zIndex: 2 },
    heroTag: { fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 16 },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(44px,6vw,76px)", fontWeight: 400, color: "#F7F3EC", lineHeight: 1.08, marginBottom: 18 },
    heroSub: { fontSize: 14, color: "rgba(247,243,236,0.6)", lineHeight: 1.8, maxWidth: 400, marginBottom: 36, fontWeight: 300 },
    heroCta: { display: "flex", gap: 14, marginBottom: 36 },
    btnPrimary: { background: "#C9993A", color: "#1C1A16", border: "none", padding: "12px 28px", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    btnSecondary: { background: "transparent", color: "#F7F3EC", border: "1px solid rgba(247,243,236,0.3)", padding: "12px 28px", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    searchBox: { background: "#fff", borderRadius: 3, padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 110px", gap: 16, alignItems: "end", boxShadow: "0 8px 40px rgba(28,26,22,.22)", maxWidth: 860 },
    sfLabel: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6, fontWeight: 500 },
    sfInput: { width: "100%", border: "none", borderBottom: "1.5px solid rgba(28,26,22,0.12)", background: "transparent", padding: "7px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none" },
    btnSearch: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "11px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, whiteSpace: "nowrap" },
    filtersBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 40px 0" },
    filterTabs: { display: "flex", gap: 4 },
    section: { padding: "32px 40px 60px" },
    secLabel: { fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 8 },
    secTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 36 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 28 },
    emptyState: { textAlign: "center", padding: "80px 0", color: "#8A8278" },
    featured: { display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 900, border: "1px solid rgba(28,26,22,0.1)", borderRadius: 3, overflow: "hidden" },
    featLeft: { background: "linear-gradient(135deg,#1C1A16,#5C3A18)", padding: 48, display: "flex", flexDirection: "column", justifyContent: "flex-end" },
    featRight: { background: "#fff", padding: 36 },
  };

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={s.navLinks}>
          <span style={s.navLinkActive}>Trang chủ</span>
          <span style={s.navLink}>Phòng &amp; Tiện nghi</span>
          <span style={s.navLink}>Dịch vụ</span>
          <span style={s.navLink} onClick={onMyBookings}>Đặt phòng của tôi</span>
          <button style={s.btnNav} onClick={() => onBookNow?.()}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
          >Đặt ngay</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <p style={s.heroTag}>✦ Trải nghiệm 5 sao</p>
          <h1 style={s.heroTitle}>
            Không gian nghỉ dưỡng<br />
            <em style={{ color: "#E8D5A3" }}>đẳng cấp thế giới</em>
          </h1>
          <p style={s.heroSub}>
            Đặt phòng tại LuxeStay – nơi mỗi khoảnh khắc đều được chăm chút từng chi tiết nhỏ nhất, mang đến kỳ nghỉ hoàn hảo cho bạn.
          </p>
          <div style={s.heroCta}>
            <button style={s.btnPrimary}
              onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8883a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C9993A")}
            >Khám phá phòng</button>
            <button style={s.btnSecondary}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(247,243,236,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(247,243,236,0.3)")}
            >Xem dịch vụ</button>
          </div>

          {/* Search Box */}
          <div style={s.searchBox}>
            <div>
              <label style={s.sfLabel}>Ngày nhận phòng</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={s.sfInput} />
            </div>
            <div>
              <label style={s.sfLabel}>Ngày trả phòng</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={s.sfInput} />
            </div>
            <div>
              <label style={s.sfLabel}>Số khách</label>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} style={s.sfInput}>
                {[1, 2, 3, 4, 5, 6].map((n) => (<option key={n} value={n}>{n} khách</option>))}
              </select>
            </div>
            <div>
              <label style={s.sfLabel}>Loại phòng</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={s.sfInput}>
                <option value="">Tất cả</option>
                {["Standard", "Deluxe", "Suite", "Presidential"].map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <button style={s.btnSearch} onClick={handleSearch}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
            >Tìm kiếm</button>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <div style={s.filtersBar}>
        <div style={s.filterTabs}>
          {ROOM_TYPES.map((t) => {
            const isActive = activeTab === t;
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ background: isActive ? "#1C1A16" : "transparent", color: isActive ? "#F7F3EC" : "#8A8278", border: `1px solid ${isActive ? "#1C1A16" : "rgba(28,26,22,0.15)"}`, padding: "7px 18px", fontSize: 12, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" }}
              >{t}</button>
            );
          })}
        </div>
        <span style={{ fontSize: 12, color: "#8A8278" }}>{filteredRooms.length} phòng</span>
      </div>

      {/* ROOMS SECTION */}
      <section id="rooms-section" style={s.section}>
        <p style={s.secLabel}>✦ Bộ sưu tập phòng</p>
        <h2 style={s.secTitle}>Chọn <em>không gian</em> hoàn hảo</h2>
        {filteredRooms.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◈</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 300 }}>Không tìm thấy phòng phù hợp</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onView={() => onViewRoom?.(room)} onBook={() => onBookNow?.(room)} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED */}
      <section style={{ padding: "0 40px 60px" }}>
        <p style={s.secLabel}>✦ Nổi bật</p>
        <h2 style={{ ...s.secTitle, marginBottom: 24 }}>Phòng <em>Presidential</em></h2>
        <div style={s.featured}>
          <div style={s.featLeft}>
            <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 12 }}>Cao cấp nhất</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 400, color: "#F7F3EC", lineHeight: 1.2, marginBottom: 8 }}>
              Presidential<br />Grand Suite
            </h3>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#E8D5A3", marginBottom: 24 }}>$980 / đêm</p>
            <button style={{ ...s.btnPrimary, width: "fit-content" }} onClick={() => onBookNow?.(ROOMS[3])}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8883a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C9993A")}
            >Đặt ngay</button>
          </div>
          <div style={s.featRight}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, marginBottom: 14 }}>Đỉnh cao xa hoa</h3>
            <p style={{ fontSize: 13, color: "#8A8278", lineHeight: 1.8, marginBottom: 20 }}>
              3 phòng ngủ riêng biệt, phòng ăn cao cấp, bếp đầy đủ và ban công rộng với tầm nhìn 270° toàn thành phố. Dành riêng cho những khoảnh khắc không thể quên.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Butler service 24/7", "Đón tiễn sân bay riêng", "Bữa sáng & minibar cao cấp", "Jacuzzi & spa private"].map((a) => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#8A8278" }}>
                  <div style={{ width: 6, height: 6, background: "#C9993A", borderRadius: "50%", flexShrink: 0 }} />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Toast toast={toast} />
    </div>
  );
}