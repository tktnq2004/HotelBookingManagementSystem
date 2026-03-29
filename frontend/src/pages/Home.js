import { useState, useEffect, useCallback } from "react";
import roomService from "../services/room.service";
import { getRoomTypes } from "../services/roomType.service";

const BASE_URL = "http://localhost:5000";

const GRADIENTS = [
  "linear-gradient(135deg,#2C2318,#6B4F2C)",
  "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
  "linear-gradient(135deg,#1A1A2E,#4A3060)",
  "linear-gradient(135deg,#1C1A16,#5C3A18)",
  "linear-gradient(135deg,#0D2137,#1A4A5A)",
  "linear-gradient(135deg,#1E1A0E,#4A3A10)",
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getNextDay(from) {
  const d = new Date(from || new Date());
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function RoomCard({ room, index, onView, onBook, isSelected, onToggleSelect }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const roomType = room.roomTypeId;
  const firstImage = room.images?.[0];
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const isAvailable = room.isAvailable !== false;

  const priceInfo = room.displayPrice;

  const hasDiscount = priceInfo?.hasPricing;
  const basePrice = priceInfo?.basePrice || 0;
  const finalPrice = priceInfo?.finalPrice || basePrice;


  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid rgba(28,26,22,0.1)",
        borderRadius: 4,
        overflow: "hidden",
        background: "#fff",
        transition: "all .35s cubic-bezier(.4,0,.2,1)",
        boxShadow: hovered ? "0 20px 60px rgba(28,26,22,.18)" : "0 2px 12px rgba(28,26,22,.06)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "rgba(201,153,58,0.12)",
          borderBottom: "1px solid rgba(201,153,58,.3)",
          padding: "6px 14px",
          fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
          color: "#C9993A", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 6,
          zIndex: 2,
        }}>
          ✓ Selected for booking
        </div>
      )}

      <div style={{ height: 220, position: "relative", overflow: "hidden", background: gradient }}>
        {firstImage && !imgError ? (
          <img
            src={`${BASE_URL}${firstImage}`}
            alt={roomType?.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform .5s ease",
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, color: "rgba(247,243,236,0.1)" }}>❖</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,26,22,.5) 0%, transparent 50%)" }} />

        {room.images?.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(28,26,22,.6)", backdropFilter: "blur(4px)", color: "#F7F3EC", fontSize: 10, padding: "3px 8px", borderRadius: 2, letterSpacing: "1px" }}>
            +{room.images.length - 1} photos
          </div>
        )}

        {hasDiscount && priceInfo?.ruleName && (
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "#B94040",
            color: "#fff", fontSize: 9, fontWeight: 700,
            letterSpacing: "1px", textTransform: "uppercase",
            padding: "4px 9px", borderRadius: 1
          }}>
            {priceInfo.ruleName}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 22px 22px" }}>
        <p style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6 }}>
          {roomType?.name} · up to {roomType?.capacity} guests
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, marginBottom: 10, lineHeight: 1.2, color: "#1C1A16" }}>
          Room #{room.roomNumber}
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
          {["Free WiFi", "Air Conditioning", "Smart TV"].map((a) => (
            <span key={a} style={{ fontSize: 10, color: "#8A8278", background: "#F7F3EC", padding: "3px 8px", borderRadius: 1 }}>{a}</span>
          ))}
        </div>

        <div style={{ paddingTop: 14, borderTop: "1px solid rgba(28,26,22,0.08)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
              {hasDiscount ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 32, color: "#B94040", fontWeight: 500 }}>
                    ${finalPrice}
                  </span>
                  <span style={{ fontSize: 16, color: "#8A8278", textDecoration: "line-through", opacity: 0.7 }}>
                    ${basePrice}
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8A8278" }}>/night</span>
                </div>
              ) : (
                <div style={{ fontSize: 32, color: "#1C1A16", fontWeight: 500 }}>
                  ${basePrice}
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8A8278", fontWeight: 400 }}> /night</span>
                </div>
              )}
            </div>

            {/* Badge trạng thái nhỏ gọn bên góc phải */}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: isAvailable ? "#3A7D5A" : "#B94040",
              background: isAvailable ? "rgba(58,125,90,0.08)" : "rgba(185,64,64,0.08)",
              padding: "4px 8px",
              borderRadius: 2,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {isAvailable ? "● Available" : "○ Fully Booked"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onView(room); }}
              style={{
                flex: 1, border: "1px solid #1C1A16", background: "transparent",
                color: "#1C1A16", padding: "8px 0", fontSize: 11, fontWeight: 500,
                cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1C1A16"; e.currentTarget.style.color = "#F7F3EC"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1C1A16"; }}
            >Details</button>

            <button
              onClick={(e) => { e.stopPropagation(); if (!isAvailable) return; onToggleSelect(room, priceInfo); }}
              disabled={!isAvailable}
              style={{
                flex: 1,
                background: isSelected ? "#C9993A" : "transparent",
                border: `1px solid ${isSelected ? "#C9993A" : isAvailable ? "#C9993A" : "#D0CBC3"}`,
                color: isSelected ? "#1C1A16" : isAvailable ? "#C9993A" : "#9A958F",
                padding: "8px 0", fontSize: 11, fontWeight: 700,
                cursor: isAvailable ? "pointer" : "not-allowed",
                borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
              }}
            >
              {!isAvailable ? "Unavailable" : isSelected ? "✓ Selected" : "+ Select"}
            </button>

            {isAvailable && !isSelected && (
              <button
                onClick={(e) => { e.stopPropagation(); onBook(room, priceInfo); }}
                style={{
                  flex: 1, background: "#1C1A16", border: "1px solid #1C1A16",
                  color: "#F7F3EC", padding: "8px 0", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#333"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1C1A16"; }}
              >Book</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ border: "1px solid rgba(28,26,22,0.08)", borderRadius: 4, overflow: "hidden", background: "#fff" }}>
      <div style={{ height: 220, background: "linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "20px 22px" }}>
        <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, width: "40%", marginBottom: 12 }} />
        <div style={{ height: 24, background: "#f0ede8", borderRadius: 2, width: "70%", marginBottom: 16 }} />
        <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, width: "90%", marginBottom: 8 }} />
        <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, width: "60%" }} />
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: "#1C1A16", color: "#F7F3EC",
      padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200,
      boxShadow: "0 8px 32px rgba(28,26,22,.2)",
      borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`,
      fontFamily: "'DM Sans', sans-serif",
      animation: "slideUp .3s ease"
    }}>
      {toast.msg}
    </div>
  );
}

export default function Home({ onViewRoom, onBookNow, onMyBookings, onLogin, onLogout, user, onAdminDashboard }) {
  const today = getToday();

  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(getNextDay(today));
  const [guests, setGuests] = useState("2");
  const [searchRoomType, setSearchRoomType] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searched, setSearched] = useState(false);

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getRoomTypes();
        setRoomTypes(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTypes();
  }, []);

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    if (checkOut <= val) setCheckOut(getNextDay(val));
  };

  const handleSearch = async () => {
    if (checkIn >= checkOut) {
      showToast("Check-out must be after check-in", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await roomService.getRooms({
        limit: 50,
        checkIn,
        checkOut,
        guests,
      });

      setRooms(res.data.data || []);
      setSearched(true);
      document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  };


  const filteredRooms = rooms.filter((r) => {
    const matchTab = activeTab === "all" || r.roomTypeId?._id === activeTab;
    const matchSearch = !searchRoomType || r.roomTypeId?._id === searchRoomType;
    const matchGuests = !guests || (r.roomTypeId?.capacity >= Number(guests));
    return matchTab && matchSearch && matchGuests;
  });

  const handleBook = (room, priceInfo) => {
    if (!user) {
      showToast("Please sign in to book a room", "error");
      setTimeout(() => onLogin?.("login"), 800);
      return;
    }
    onBookNow?.(room, priceInfo, { checkIn, checkOut, guests });
  };

  const toggleRoomSelection = (room, priceInfo) => {
    setSelectedRooms(prev => {
      const exists = prev.find(r => r.room._id === room._id);
      if (exists) return prev.filter(r => r.room._id !== room._id);
      return [...prev, { room, priceInfo }];
    });
  };

  const isRoomSelected = (roomId) => selectedRooms.some(r => r.room._id === roomId);

  const handleBookSelected = () => {
    if (!user) {
      showToast("Please sign in to book rooms", "error");
      setTimeout(() => onLogin?.("login"), 800);
      return;
    }

    onBookNow?.(selectedRooms, null, { checkIn, checkOut, guests, isMulti: true });
  };

  const totalSelectedPrice = selectedRooms.reduce((sum, { priceInfo, room }) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) || 1;
    const price = priceInfo?.finalPrice || room.roomTypeId?.basePrice || 0;
    return sum + price * nights;
  }, 0);

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238A8278'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
      `}</style>

      <nav style={s.nav}>
        <div style={s.logo}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
        <div style={s.navLinks}>
          {user?.role === "admin" && (
            <span style={{ ...s.navLink, color: "#C9993A", fontWeight: 600 }} onClick={onAdminDashboard}>Admin ↗</span>
          )}
          <span style={s.navLinkActive}>Home</span>
          {user && <span style={s.navLink} onClick={onMyBookings}>My Bookings</span>}
          {!user ? (
            <>
              <button style={s.btnNavOutline} onClick={() => onLogin?.("login")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Log In</button>
              <button style={s.btnNav} onClick={() => onLogin?.("register")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
              >Register</button>
            </>
          ) : (
            <div style={s.userBadge}>
              <div style={s.userAvatar}>{user.email?.[0]?.toUpperCase() || "U"}</div>
              <span style={s.userName}>{user.name || user.email}</span>
              <button style={{ ...s.btnNavOutline, marginRight: 0 }} onClick={onLogout}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Sign Out</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        {/* Decorative orbs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,153,58,.12) 0%, transparent 70%)", top: -200, right: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,153,58,.08) 0%, transparent 70%)", bottom: 0, left: "20%", pointerEvents: "none" }} />

        <div style={s.heroContent}>
          <p style={s.heroTag}>✦ 5-Star Experience · Ho Chi Minh City</p>
          <h1 style={s.heroTitle}>
            Where luxury<br />
            <em style={{ color: "#E8D5A3", fontStyle: "italic" }}>meets serenity</em>
          </h1>
          <p style={s.heroSub}>
            Discover handcrafted experiences at LuxeStay — every detail considered, every moment curated for the discerning traveler.
          </p>
          <div style={s.heroCta}>
            <button style={s.btnPrimary}
              onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8883a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C9993A")}
            >Explore Rooms</button>
            <button style={s.btnSecondary}>Our Services</button>
          </div>

          {/* ── SEARCH BOX ── */}
          <div style={s.searchBox}>
            <div style={s.sfField}>
              <label style={s.sfLabel}>Check-in</label>
              <input type="date" value={checkIn} min={today}
                onChange={(e) => handleCheckInChange(e.target.value)} style={s.sfInput} />
            </div>
            <div style={s.sfDivider} />
            <div style={s.sfField}>
              <label style={s.sfLabel}>Check-out</label>
              <input type="date" value={checkOut}
                min={getNextDay(checkIn)}
                onChange={(e) => setCheckOut(e.target.value)} style={s.sfInput} />
            </div>
            <div style={s.sfDivider} />
            <div style={s.sfField}>
              <label style={s.sfLabel}>Guests</label>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} style={s.sfInput}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div style={s.sfDivider} />
            <button style={s.btnSearch} onClick={handleSearch}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
            >
              <span style={{ fontSize: 16, marginRight: 6 }}>⌕</span> Search
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 36, marginTop: 32 }}>
            {[
              { val: rooms.length || "–", label: "Rooms Available" },
              { val: roomTypes.length || "–", label: "Room Categories" },
              { val: "24/7", label: "Concierge" },
              { val: "5★", label: "Rated" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#E8D5A3", lineHeight: 1 }}>{stat.val}</div>
                <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(247,243,236,0.45)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <div style={s.filtersBar}>
        <div style={s.filterTabs}>
          <button
            onClick={() => setActiveTab("all")}
            style={{ ...s.filterBtn, ...(activeTab === "all" ? s.filterBtnActive : {}) }}
          >All</button>
          {roomTypes.map((t) => (
            <button key={t._id}
              onClick={() => setActiveTab(t._id)}
              style={{ ...s.filterBtn, ...(activeTab === t._id ? s.filterBtnActive : {}) }}
            >{t.name}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {searched && checkIn && checkOut && (
            <span style={{ fontSize: 11, color: "#C9993A", background: "rgba(201,153,58,.1)", padding: "4px 12px", borderRadius: 1 }}>
              {checkIn} → {checkOut} · {guests} guest{Number(guests) > 1 ? "s" : ""}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#8A8278" }}>
            {loading ? "Loading..." : `${filteredRooms.length} room${filteredRooms.length !== 1 ? "s" : ""} found`}
          </span>
        </div>
      </div>

      {/* ── ROOMS SECTION ── */}
      <section id="rooms-section" style={s.section}>
        <p style={s.secLabel}>✦ Room Collection</p>
        <h2 style={s.secTitle}>Choose your <em>perfect space</em></h2>

        {loading ? (
          <div style={s.grid}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, marginBottom: 16, opacity: 0.2 }}>◈</div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 8 }}>No rooms found</p>
            <p style={{ fontSize: 13, color: "#8A8278" }}>Try adjusting your filters or dates</p>
            <button style={{ ...s.btnPrimary, marginTop: 20, background: "#1C1A16" }}
              onClick={() => { setActiveTab("all"); setSearchRoomType(""); setGuests("1"); }}
            >Clear Filters</button>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredRooms.map((room, i) => (
              <RoomCard
                key={room._id}
                room={room}
                index={i}
                checkIn={checkIn}
                checkOut={checkOut}
                isSelected={isRoomSelected(room._id)}           // <-- thêm
                onToggleSelect={toggleRoomSelection}             // <-- thêm
                onView={(r) => onViewRoom?.(r, { checkIn, checkOut, guests })}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── WHY LUXESTAY ── */}
      <section style={{ background: "#1C1A16", padding: "72px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 12, textAlign: "center" }}>✦ Why LuxeStay</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,3vw,44px)", fontWeight: 400, color: "#F7F3EC", textAlign: "center", marginBottom: 52 }}>
            An experience <em style={{ color: "#E8D5A3" }}>beyond ordinary</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { icon: "◈", title: "Curated Rooms", desc: "Every room is designed with meticulous attention to detail and comfort." },
              { icon: "✦", title: "Dynamic Pricing", desc: "Best rates guaranteed — seasonal deals and early bird discounts available." },
              { icon: "⟡", title: "24/7 Concierge", desc: "Our dedicated team is always available to fulfill your every request." },
              { icon: "❖", title: "Free Cancellation", desc: "Plans change. Cancel up to 24 hours before check-in at no charge." },
            ].map((f) => (
              <div key={f.title} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#C9993A", marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: "#F7F3EC", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(247,243,236,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROOM TYPES PRICING OVERVIEW ── */}
      {roomTypes.length > 0 && (
        <section style={{ padding: "72px 40px", background: "#FDFAF7" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={s.secLabel}>✦ Starting From</p>
            <h2 style={{ ...s.secTitle, marginBottom: 36 }}>Room <em>categories</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {roomTypes.map((rt, i) => (
                <div key={rt._id}
                  onClick={() => { setActiveTab(rt._id); document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "24px 24px 20px", cursor: "pointer", transition: "all .25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9993A"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(28,26,22,.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(28,26,22,0.08)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 36, height: 36, background: GRADIENTS[i % GRADIENTS.length], borderRadius: 2, marginBottom: 14 }} />
                  <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6 }}>{rt.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "#C9993A" }}>${rt.basePrice}</div>
                  <div style={{ fontSize: 11, color: "#8A8278", marginBottom: 12 }}>per night · up to {rt.capacity} guests</div>
                  <div style={{ fontSize: 11, color: "#C9993A", fontWeight: 500 }}>View rooms →</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* ── FLOATING CART BAR ── */}
      {selectedRooms.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#1C1A16",
          borderTop: "1px solid rgba(201,153,58,.3)",
          zIndex: 100,
          padding: "16px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -8px 40px rgba(28,26,22,.4)",
          animation: "slideUp .3s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Left: room list */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#C9993A", marginRight: 4 }}>
              {selectedRooms.length}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#F7F3EC", fontWeight: 600, letterSpacing: "1px" }}>
                ROOM{selectedRooms.length > 1 ? "S" : ""} SELECTED
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {selectedRooms.map(({ room }) => (
                  <span
                    key={room._id}
                    style={{
                      fontSize: 10, color: "rgba(247,243,236,0.55)",
                      background: "rgba(255,255,255,0.06)",
                      padding: "2px 8px", borderRadius: 1,
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    #{room.roomNumber} · {room.roomTypeId?.name}
                    <span
                      onClick={() => toggleRoomSelection(room)}
                      style={{ cursor: "pointer", color: "#B94040", fontWeight: 700, marginLeft: 2 }}
                    >×</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: total + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(247,243,236,0.4)", letterSpacing: "1px" }}>
                ESTIMATED TOTAL
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#E8D5A3", lineHeight: 1 }}>
                ${Math.round(totalSelectedPrice)}
              </div>
              <div style={{ fontSize: 10, color: "rgba(247,243,236,0.35)", marginTop: 2 }}>
                {Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)} night(s)
              </div>
            </div>

            <button
              onClick={() => setSelectedRooms([])}
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(247,243,236,0.5)", padding: "10px 16px",
                fontSize: 11, cursor: "pointer", borderRadius: 2,
              }}
            >Clear</button>

            <button
              onClick={handleBookSelected}
              style={{
                background: "#C9993A", border: "1px solid #C9993A",
                color: "#1C1A16", padding: "10px 28px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                borderRadius: 2, letterSpacing: "0.5px",
                transition: "background .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8883a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C9993A")}
            >
              Book {selectedRooms.length} Room{selectedRooms.length > 1 ? "s" : ""} →
            </button>
          </div>
        </div>
      )}
      <Toast toast={toast} />
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },

  nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(28,26,22,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, letterSpacing: "2px", cursor: "pointer", color: "#1C1A16" },
  navLinks: { display: "flex", alignItems: "center", gap: 24 },
  navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer", fontWeight: 400, transition: "color .2s" },
  navLinkActive: { fontSize: 13, color: "#1C1A16", fontWeight: 600, cursor: "pointer" },
  btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" },
  btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.25)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8, transition: "all .2s" },
  userBadge: { display: "flex", alignItems: "center", gap: 10 },
  userAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 },
  userName: { fontSize: 13, color: "#1C1A16", fontWeight: 500 },

  hero: { minHeight: "calc(100vh - 64px)", background: "linear-gradient(155deg,#1C1A16 0%,#2A1E0E 40%,#3A2A10 70%,#4A3518 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 40px 60px", position: "relative", overflow: "hidden" },
  heroBg: { position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "repeating-linear-gradient(45deg,#C9993A 0,#C9993A 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 2, maxWidth: 900, animation: "fadeIn .8s ease" },
  heroTag: { fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 20 },
  heroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px,6vw,82px)", fontWeight: 400, color: "#F7F3EC", lineHeight: 1.06, marginBottom: 20 },
  heroSub: { fontSize: 14, color: "rgba(247,243,236,0.55)", lineHeight: 1.85, maxWidth: 440, marginBottom: 36, fontWeight: 300 },
  heroCta: { display: "flex", gap: 14, marginBottom: 40 },
  btnPrimary: { background: "#C9993A", color: "#1C1A16", border: "none", padding: "13px 30px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" },
  btnSecondary: { background: "transparent", color: "#F7F3EC", border: "1px solid rgba(247,243,236,0.25)", padding: "13px 30px", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" },

  searchBox: { background: "rgba(255,255,255,0.97)", borderRadius: 3, padding: "20px 24px", display: "flex", alignItems: "center", gap: 0, boxShadow: "0 16px 56px rgba(28,26,22,.32)", maxWidth: 920, backdropFilter: "blur(10px)" },
  sfField: { flex: 1, padding: "0 16px" },
  sfDivider: { width: 1, height: 40, background: "rgba(28,26,22,0.1)", flexShrink: 0 },
  sfLabel: { display: "block", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6, fontWeight: 600 },
  sfInput: { width: "100%", border: "none", background: "transparent", padding: "6px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1C1A16", outline: "none" },
  btnSearch: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "14px 24px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, whiteSpace: "nowrap", marginLeft: 16, display: "flex", alignItems: "center", transition: "all .2s" },

  filtersBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 40px 0", flexWrap: "wrap", gap: 12 },
  filterTabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterBtn: { background: "transparent", color: "#8A8278", border: "1px solid rgba(28,26,22,0.15)", padding: "7px 18px", fontSize: 12, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" },
  filterBtnActive: { background: "#1C1A16", color: "#F7F3EC", borderColor: "#1C1A16" },

  section: { padding: "36px 40px 72px" },
  secLabel: { fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#C9993A", marginBottom: 10 },
  secTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,3vw,44px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 36 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 },
  emptyState: { textAlign: "center", padding: "100px 0", color: "#8A8278" },
};