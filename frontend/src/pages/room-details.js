import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ROOMS_DATA = {
  1: {
    id: 1,
    name: "Superior Room",
    type: "Standard",
    price: 120,
    capacity: 2,
    area: 28,
    floor: "3rd – 8th Floor",
    bed: "1 King Bed",
    gradient: "linear-gradient(135deg,#2C2318,#6B4F2C)",
    badge: "Popular",
    description: "A cozy standard room with modern amenities and a beautiful city view. Thoughtfully designed with warm tones and premium bedding, this room offers everything you need for a comfortable stay.",
    amenities: [
      { icon: "📶", label: "Free WiFi" },
      { icon: "❄️", label: "Air Conditioning" },
      { icon: "📺", label: "Smart TV" },
      { icon: "🍷", label: "Minibar" },
      { icon: "🛁", label: "Bathtub" },
      { icon: "☕", label: "Coffee Maker" },
      { icon: "🔒", label: "In-room Safe" },
      { icon: "📞", label: "Room Service" },
    ],
    policies: [
      { label: "Check-in", value: "From 2:00 PM" },
      { label: "Check-out", value: "Before 12:00 PM" },
      { label: "Cancellation", value: "Free cancellation 24h before check-in" },
      { label: "Smoking", value: "Non-smoking room" },
      { label: "Pets", value: "Not allowed" },
      { label: "Extra bed", value: "Available upon request (+$30/night)" },
    ],
  },
  2: {
    id: 2,
    name: "Deluxe Room",
    type: "Deluxe",
    price: 220,
    capacity: 2,
    area: 42,
    floor: "9th – 15th Floor",
    bed: "1 King Bed",
    gradient: "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
    badge: "Featured",
    description: "A spacious deluxe room with luxury furnishings, panoramic ocean views, and complimentary breakfast. Designed to elevate your stay with refined comfort and style.",
    amenities: [
      { icon: "📶", label: "High-speed WiFi" },
      { icon: "❄️", label: "Air Conditioning" },
      { icon: "📺", label: 'Smart TV 65"' },
      { icon: "🍷", label: "Premium Minibar" },
      { icon: "🛁", label: "Jacuzzi Bathtub" },
      { icon: "☕", label: "Nespresso Machine" },
      { icon: "🌊", label: "Ocean View" },
      { icon: "🍳", label: "Breakfast Included" },
      { icon: "🔒", label: "In-room Safe" },
      { icon: "📞", label: "24h Room Service" },
    ],
    policies: [
      { label: "Check-in", value: "From 2:00 PM" },
      { label: "Check-out", value: "Before 12:00 PM" },
      { label: "Cancellation", value: "Free cancellation 24h before check-in" },
      { label: "Smoking", value: "Non-smoking room" },
      { label: "Pets", value: "Not allowed" },
      { label: "Breakfast", value: "Included for 2 guests" },
    ],
  },
  3: {
    id: 3,
    name: "Grand Suite",
    type: "Suite",
    price: 450,
    capacity: 4,
    area: 85,
    floor: "16th – 20th Floor",
    bed: "2 King Beds",
    gradient: "linear-gradient(135deg,#1A1A2E,#4A3060)",
    badge: "Premium",
    description: "A luxurious suite featuring a separate living room, private Jacuzzi, and breathtaking 180° bay views. Every detail has been crafted to create an unforgettable luxury experience.",
    amenities: [
      { icon: "📶", label: "High-speed WiFi" },
      { icon: "❄️", label: "Climate Control" },
      { icon: "📺", label: '2x Smart TV 75"' },
      { icon: "🍷", label: "Premium Minibar" },
      { icon: "🛁", label: "Private Jacuzzi" },
      { icon: "☕", label: "Nespresso Machine" },
      { icon: "🌊", label: "180° Bay View" },
      { icon: "🍳", label: "Breakfast Included" },
      { icon: "🛎️", label: "Butler Service" },
      { icon: "🚗", label: "Free Parking" },
      { icon: "🔒", label: "In-room Safe" },
      { icon: "📞", label: "24h Room Service" },
    ],
    policies: [
      { label: "Check-in", value: "From 1:00 PM (early check-in)" },
      { label: "Check-out", value: "Before 1:00 PM (late check-out)" },
      { label: "Cancellation", value: "Free cancellation 48h before check-in" },
      { label: "Smoking", value: "Non-smoking room" },
      { label: "Pets", value: "Small pets allowed (+$50/stay)" },
      { label: "Breakfast", value: "Included for up to 4 guests" },
    ],
  },
  4: {
    id: 4,
    name: "Presidential Suite",
    type: "Presidential",
    price: 980,
    capacity: 6,
    area: 200,
    floor: "Top Floor (Penthouse)",
    bed: "3 King Beds",
    gradient: "linear-gradient(135deg,#1C1A16,#5C3A18)",
    badge: "VIP",
    description: "The pinnacle of luxury at LuxeStay. This exclusive penthouse suite offers 3 separate bedrooms, a private dining room, fully equipped kitchen, and a sweeping 270° city view balcony. Reserved for the most discerning guests.",
    amenities: [
      { icon: "📶", label: "Dedicated WiFi" },
      { icon: "❄️", label: "Smart Climate" },
      { icon: "📺", label: '3x Smart TV 85"' },
      { icon: "🍷", label: "Stocked Bar" },
      { icon: "🛁", label: "Jacuzzi & Sauna" },
      { icon: "☕", label: "Full Kitchen" },
      { icon: "🌆", label: "270° City View" },
      { icon: "🍳", label: "Full Board Meals" },
      { icon: "🛎️", label: "24h Butler" },
      { icon: "✈️", label: "Airport Transfer" },
      { icon: "🚗", label: "Valet Parking" },
      { icon: "💆", label: "Private Spa" },
    ],
    policies: [
      { label: "Check-in", value: "Flexible (butler assistance)" },
      { label: "Check-out", value: "Flexible (butler assistance)" },
      { label: "Cancellation", value: "Free cancellation 72h before check-in" },
      { label: "Smoking", value: "Designated balcony area" },
      { label: "Pets", value: "All pets welcome" },
      { label: "Meals", value: "Full board included for all guests" },
    ],
  },
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getNextDay() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diff / 86400000));
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onBack, onLogin, onLogout, onMyBookings, user, s }) {
  return (
    <nav style={s.nav}>
      <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
      <div style={s.navLinks}>
        <button style={s.backBtn} onClick={onBack}>← Back to Rooms</button>

        {/* My Bookings - chỉ hiện khi đã đăng nhập */}
        {user && (
          <span style={s.navLink} onClick={onMyBookings}>My Bookings</span>
        )}

        {/* Chưa đăng nhập */}
        {!user && (
          <>
            <button style={s.btnNavOutline} onClick={() => onLogin?.("login")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Sign In</button>
            <button style={s.btnNav} onClick={() => onLogin?.("register")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
            >Register</button>
          </>
        )}

        {/* Đã đăng nhập */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
            <button style={s.btnNavOutline} onClick={onLogout}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── ROOM DETAIL PAGE ─────────────────────────────────────────────────────────
export default function RoomDetail({ roomId = 1, onBack, onBook, onLogin, onLogout, onMyBookings, user }) {
  const room = ROOMS_DATA[roomId] || ROOMS_DATA[1];
  const today = getToday();

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(getNextDay);
  const [guests, setGuests] = useState("2");
  const [toast, setToast] = useState(null);

  const nights = calcNights(checkIn, checkOut);
  const subtotal = room.price * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    if (checkOut <= val) {
      const d = new Date(val);
      d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split("T")[0]);
    }
  };

  const handleBook = () => {
    if (!checkIn || !checkOut) {
      showToast("Please select check-in and check-out dates", "error");
      return;
    }
    if (checkIn >= checkOut) {
      showToast("Check-out date must be after check-in date", "error");
      return;
    }
    // Nếu chưa đăng nhập thì chuyển sang login
    if (!user) {
      showToast("Please sign in to book a room", "error");
      setTimeout(() => onLogin?.("login"), 1000);
      return;
    }
    onBook?.({ room, checkIn, checkOut, guests, nights, total });
  };

  const s = {
    page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },
    nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(28,26,22,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, letterSpacing: "1.5px", cursor: "pointer", color: "#1C1A16" },
    navLinks: { display: "flex", alignItems: "center", gap: 24 },
    backBtn: { background: "transparent", border: "none", color: "#8A8278", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 },
    navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer", fontWeight: 400 },
    btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.3)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8 },
    btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" },
    hero: { height: 480, background: room.gradient, display: "flex", alignItems: "flex-end", padding: "0 48px 48px", position: "relative", overflow: "hidden" },
    heroBg: { position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(45deg,#C9993A 0,#C9993A 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" },
    heroIcon: { position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", fontFamily: "'Playfair Display', serif", fontSize: 200, color: "rgba(247,243,236,0.04)", lineHeight: 1 },
    heroContent: { position: "relative", zIndex: 2 },
    heroType: { fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 10 },
    heroName: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: 300, color: "#F7F3EC", lineHeight: 1.1, marginBottom: 12 },
    heroMeta: { display: "flex", gap: 24, alignItems: "center" },
    heroPrice: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#E8D5A3" },
    heroBadge: { background: "#C9993A", color: "#1C1A16", fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: 1 },
    heroStat: { fontSize: 12, color: "rgba(247,243,236,0.6)", display: "flex", alignItems: "center", gap: 6 },
    body: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, padding: "48px", maxWidth: 1300, margin: "0 auto" },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.08)" },
    desc: { fontSize: 14, lineHeight: 1.9, color: "#5A5450", marginBottom: 40 },
    amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 },
    amenityItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3 },
    amenityIcon: { fontSize: 18, flexShrink: 0 },
    amenityLabel: { fontSize: 12, color: "#5A5450", fontWeight: 400 },
    policiesList: { listStyle: "none", padding: 0 },
    policyItem: { display: "flex", gap: 16, padding: "13px 0", borderBottom: "1px solid rgba(28,26,22,0.06)", fontSize: 13 },
    policyLabel: { color: "#1C1A16", fontWeight: 600, minWidth: 110, flexShrink: 0 },
    policyValue: { color: "#5A5450" },
    statsBar: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(28,26,22,0.08)", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 40 },
    statItem: { background: "#fff", padding: "16px 20px", textAlign: "center" },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#1C1A16", marginBottom: 4 },
    statLabel: { fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#8A8278" },
    sidebar: { position: "sticky", top: 84, height: "fit-content", background: "#1C1A16", borderRadius: 4, padding: 32 },
    sidebarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F7F3EC", marginBottom: 24 },
    sidebarField: { marginBottom: 18 },
    sidebarLabel: { display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(247,243,236,0.5)", marginBottom: 8 },
    sidebarInput: { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#F7F3EC", padding: "10px 14px", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" },
    divider: { height: 1, background: "rgba(255,255,255,0.1)", margin: "20px 0" },
    priceRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(247,243,236,0.65)", marginBottom: 10 },
    totalRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
    totalLabel: { fontSize: 13, color: "#F7F3EC", fontWeight: 500 },
    totalPrice: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#C9993A" },
    btnBook: { width: "100%", background: "#C9993A", color: "#1C1A16", border: "none", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, marginTop: 20, transition: "all .2s" },
    btnBookDisabled: { width: "100%", background: "rgba(255,255,255,0.1)", color: "rgba(247,243,236,0.4)", border: "none", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "not-allowed", borderRadius: 2, marginTop: 20 },
    btnSignIn: { width: "100%", background: "transparent", color: "#C9993A", border: "1px solid #C9993A", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, marginTop: 20, transition: "all .2s" },
    noteText: { fontSize: 11, color: "rgba(247,243,236,0.4)", textAlign: "center", marginTop: 12, lineHeight: 1.6 },
  };

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <Navbar onBack={onBack} onLogin={onLogin} onLogout={onLogout} onMyBookings={onMyBookings} user={user} s={s} />

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroIcon}>❖</div>
        <div style={s.heroContent}>
          <p style={s.heroType}>{room.type} Room</p>
          <h1 style={s.heroName}>{room.name}</h1>
          <div style={s.heroMeta}>
            <div style={s.heroPrice}>${room.price}<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(247,243,236,0.5)", fontWeight: 400 }}> / night</span></div>
            <div style={s.heroBadge}>{room.badge}</div>
            <div style={s.heroStat}>👤 Up to {room.capacity} guests</div>
            <div style={s.heroStat}>📐 {room.area} m²</div>
            <div style={s.heroStat}>🛏️ {room.bed}</div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>
        {/* LEFT COLUMN */}
        <div>
          <div style={s.statsBar}>
            {[
              { value: `${room.area} m²`, label: "Room Size" },
              { value: room.bed, label: "Bed Type" },
              { value: `${room.capacity} Guests`, label: "Max Capacity" },
              { value: room.floor, label: "Floor" },
            ].map((stat) => (
              <div key={stat.label} style={s.statItem}>
                <div style={s.statValue}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <h2 style={s.sectionTitle}>About This Room</h2>
          <p style={s.desc}>{room.description}</p>

          <h2 style={s.sectionTitle}>Amenities</h2>
          <div style={s.amenitiesGrid}>
            {room.amenities.map((a) => (
              <div key={a.label} style={s.amenityItem}>
                <span style={s.amenityIcon}>{a.icon}</span>
                <span style={s.amenityLabel}>{a.label}</span>
              </div>
            ))}
          </div>

          <h2 style={s.sectionTitle}>Room Policies</h2>
          <ul style={s.policiesList}>
            {room.policies.map((p) => (
              <li key={p.label} style={s.policyItem}>
                <span style={s.policyLabel}>{p.label}</span>
                <span style={s.policyValue}>{p.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SIDEBAR */}
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>Reserve Your Stay</div>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Check-in Date</label>
            <input type="date" value={checkIn} min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              style={s.sidebarInput}
              onFocus={(e) => (e.target.style.borderColor = "#C9993A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Check-out Date</label>
            <input type="date" value={checkOut}
              min={(() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}
              onChange={(e) => setCheckOut(e.target.value)}
              style={s.sidebarInput}
              onFocus={(e) => (e.target.style.borderColor = "#C9993A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Guests</label>
            <select value={guests} onChange={(e) => setGuests(e.target.value)} style={s.sidebarInput}>
              {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          <div style={s.divider} />

          {nights > 0 ? (
            <>
              <div style={s.priceRow}>
                <span>${room.price} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span>${subtotal}</span>
              </div>
              <div style={s.priceRow}>
                <span>Taxes & fees (10%)</span>
                <span>${tax}</span>
              </div>
              <div style={s.divider} />
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalPrice}>${total}</span>
              </div>
              {user ? (
                <button style={s.btnBook} onClick={handleBook}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#b8883a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#C9993A")}
                >Book Now</button>
              ) : (
                <button style={s.btnSignIn} onClick={() => onLogin?.("login")}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,153,58,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >Sign In to Book</button>
              )}
            </>
          ) : (
            <>
              <div style={{ ...s.priceRow, color: "rgba(247,243,236,0.3)" }}>
                <span>Select dates to see pricing</span>
              </div>
              <button style={s.btnBookDisabled} disabled>Select Dates First</button>
            </>
          )}

          <p style={s.noteText}>Free cancellation available · No payment charged yet</p>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}