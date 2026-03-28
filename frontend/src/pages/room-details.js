import { useState, useEffect, useRef } from "react";
import roomService from "../services/room.service";

const BASE_URL = "http://localhost:5000";

const GRADIENTS = [
  "linear-gradient(135deg,#2C2318,#6B4F2C)",
  "linear-gradient(135deg,#1A2A3A,#2E5E8A)",
  "linear-gradient(135deg,#1A1A2E,#4A3060)",
  "linear-gradient(135deg,#1C1A16,#5C3A18)",
  "linear-gradient(135deg,#0D2137,#1A4A5A)",
];

const AMENITY_MAP = {
  Wifi: { icon: "📶", label: "Wi-Fi" },
  AirConditioner: { icon: "❄️", label: "Air Conditioning" },
  Tv: { icon: "📺", label: "TV" },
  Minibar: { icon: "🍸", label: "Minibar" },
  Bathtub: { icon: "🛁", label: "Bathtub" },
  Breakfast: { icon: "🍳", label: "Breakfast Included" },
};


function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getNextDay(from) {
  const d = new Date(from || new Date());
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
}
function ImageGallery({ images, fallbackGradient }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div style={{ height: 480, background: fallbackGradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(45deg,#C9993A 0,#C9993A 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 120, color: "rgba(247,243,236,0.07)" }}>❖</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Image */}
      <div
        style={{ height: 480, position: "relative", overflow: "hidden", background: fallbackGradient, cursor: images.length > 1 ? "zoom-in" : "default" }}
        onClick={() => images.length > 1 && setLightbox(true)}
      >
        {!imgErrors[active] ? (
          <img
            src={`${BASE_URL}${images[active]}`}
            alt="room"
            onError={() => setImgErrors((p) => ({ ...p, [active]: true }))}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 80, color: "rgba(247,243,236,0.1)" }}>❖</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,26,22,.45) 0%, transparent 55%)" }} />
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(28,26,22,.65)", backdropFilter: "blur(4px)", color: "#F7F3EC", fontSize: 11, padding: "5px 12px", borderRadius: 2, letterSpacing: "1px" }}>
            {active + 1} / {images.length} · click to expand
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 48px", background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.06)", overflowX: "auto" }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{ width: 80, height: 56, flexShrink: 0, cursor: "pointer", borderRadius: 2, overflow: "hidden", border: `2px solid ${active === i ? "#C9993A" : "transparent"}`, transition: "border .2s", opacity: active === i ? 1 : 0.55 }}
            >
              {!imgErrors[i] ? (
                <img
                  src={`${BASE_URL}${img}`}
                  alt=""
                  onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: fallbackGradient }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.93)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={`${BASE_URL}${images[active]}`}
            alt=""
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 2 }}
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20, cursor: "pointer" }}>×</button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
                style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 22, cursor: "pointer" }}>‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
                style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 22, cursor: "pointer" }}>›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EC" }}>
      <div style={{ height: 64, background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.08)" }} />
      <div style={{ height: 480, background: "linear-gradient(90deg,#e8e4de 25%,#f0ede8 50%,#e8e4de 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "48px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 52 }}>
        <div>{[240, 120, 180, 140, 200].map((w, i) => (
          <div key={i} style={{ height: 14, background: "#e8e4de", borderRadius: 2, width: w, marginBottom: 18 }} />
        ))}</div>
        <div style={{ height: 520, background: "#e8e4de", borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onBack, onLogin, onLogout, onMyBookings, user }) {
  return (
    <nav style={s.nav}>
      <div style={s.logo} onClick={onBack}>Luxe<span style={{ color: "#C9993A" }}>Stay</span></div>
      <div style={s.navLinks}>
        <button style={s.backBtn} onClick={onBack}>← Back to Rooms</button>
        {user && <span style={s.navLink} onClick={onMyBookings}>My Bookings</span>}
        {!user ? (
          <>
            <button style={s.btnNavOutline}
              onClick={() => onLogin?.("login")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Sign In</button>
            <button style={s.btnNav}
              onClick={() => onLogin?.("register")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7A5C35")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1A16")}
            >Register</button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9993A", color: "#1C1A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <span style={{ fontSize: 13, color: "#1C1A16", fontWeight: 500 }}>{user.name || user.email}</span>
            <button style={s.btnNavOutline} onClick={onLogout}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,26,22,.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function RoomDetail({ roomId, onBack, onBook, onLogin, onLogout, onMyBookings, user, initialCheckIn, initialCheckOut, initialGuests }) {
  const today = getToday();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);

  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || getNextDay(today));
  const [guests, setGuests] = useState(String(initialGuests || "2"));
  const [toast, setToast] = useState(null);

  const nights = calcNights(checkIn, checkOut);
  const roomType = room?.roomTypeId;
  const basePrice = roomType?.basePrice || 0;
  const pricePerNight = priceInfo?.pricePerNight || basePrice;
  const subtotal = pricePerNight * nights;
  const total = priceInfo?.totalPrice || subtotal;
  const hasRule = !!priceInfo?.ruleName;
  const policy = roomType?.policy;
  const amenities = roomType?.amenities || [];
  const isAvailable = room?.availability;

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut || checkIn >= checkOut) return;

    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setPriceLoading(true);
    }

    roomService
      .getRoom(roomId, { checkIn, checkOut })
      .then((res) => {
        const data = res.data.data;
        setRoom(data);
        setPriceInfo(data.pricing);
        isFirstLoad.current = false;
      })
      .catch(() => showToast("Failed to load room", "error"))
      .finally(() => {
        setLoading(false);
        setPriceLoading(false);
      });
  }, [roomId, checkIn, checkOut]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    if (checkOut <= val) setCheckOut(getNextDay(val));
  };

  const formatCancellation = () => {
    if (!policy) return "No policy";

    if (policy.cancellation === "free") {
      return `Free cancellation before ${policy.cancelDeadlineHours}h`;
    }

    if (policy.cancellation === "partial") {
      return `${policy.refundPercent}% refund before ${policy.cancelDeadlineHours}h`;
    }

    return "Non-refundable";
  };

  const handleBook = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      showToast("Please select valid dates", "error");
      return;
    }
    if (!user) {
      showToast("Please sign in to book", "error");
      setTimeout(() => onLogin?.("login"), 800);
      return;
    }
    if (!isAvailable) {
      showToast("Room is not available", "error");
      return;
    }
    onBook?.({ room, checkIn, checkOut, guests: Number(guests), nights, pricePerNight, subtotal, total, ruleName: priceInfo?.ruleName || null, multiplier: priceInfo?.multiplier || 1 });
  };

  if (loading) return <Skeleton />;

  if (!room) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#F7F3EC" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, opacity: 0.2, marginBottom: 12 }}>◈</div>
        <p style={{ fontSize: 18, color: "#8A8278", marginBottom: 20 }}>Room not found</p>
        <button onClick={onBack} style={{ background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "10px 24px", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238A8278'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px !important; }
      `}</style>

      <Navbar onBack={onBack} onLogin={onLogin} onLogout={onLogout} onMyBookings={onMyBookings} user={user} />

      {/* GALLERY */}
      <div style={{ animation: "fadeIn .5s ease" }}>
        <ImageGallery images={room.images} fallbackGradient={GRADIENTS[0]} />
      </div>

      {/* INFO BAR */}
      <div style={s.infoBar}>
        <div style={s.infoBarInner}>
          <div>
            <p style={s.infoBarType}>{roomType?.name} · Room #{room.roomNumber}</p>
            <h1 style={s.infoBarTitle}>
              {roomType?.name} Room
              <span style={s.infoBadge}>
                {isAvailable ? "Available" : "Not Available"}
              </span>
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            {hasRule ? (
              <>
                {/* Base price gạch bỏ */}
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: "#8A8278",
                  textDecoration: "line-through",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  ${basePrice}<span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400 }}> /night</span>
                </div>

                {/* Giá sau rule */}
                <div style={s.infoBarPrice}>
                  ${pricePerNight}
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8A8278", fontWeight: 400 }}> /night</span>
                </div>

                {/* Rule name */}
                <div style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: priceInfo.multiplier > 1 ? "#B94040" : "#3A7D5A",
                  background: priceInfo.multiplier > 1 ? "rgba(185,64,64,0.1)" : "rgba(58,125,90,0.1)",
                  padding: "3px 8px",
                  borderRadius: 2,
                }}>
                  {priceInfo.ruleName}
                </div>
              </>
            ) : (
              <>
                <div style={s.infoBarPrice}>
                  ${pricePerNight}
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8A8278", fontWeight: 400 }}> /night</span>
                </div>
                {basePrice > 0 && (
                  <div style={{ fontSize: 11, color: "#8A8278", marginTop: 4 }}>Base price</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ animation: "fadeIn .7s ease" }}>

          {/* Stats */}
          <div style={s.statsBar}>
            {[
              { value: `${roomType?.capacity || "–"}`, label: "Max Guests" },
              { value: `$${basePrice}`, label: "Base Price" },
              { value: roomType?.name || "–", label: "Room Type" },
              { value: room.images?.length || 0, label: "Photos" },
            ].map((stat) => (
              <div key={stat.label} style={s.statItem}>
                <div style={s.statValue}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          <h2 style={s.sectionTitle}>About This Room</h2>
          <p style={s.desc}>
            Welcome to Room #{room.roomNumber} — a {roomType?.name?.toLowerCase()} category room designed for up to {roomType?.capacity} guests.
            {roomType?.name === "Suite" && " Enjoy the spacious layout and premium furnishings crafted for an unforgettable stay."}
            {roomType?.name === "Deluxe" && " Experience elevated comfort with panoramic views and carefully selected luxury amenities."}
            {roomType?.name === "Standard" && " A thoughtfully designed space offering everything you need for a comfortable and restful stay."}
            {" "}At LuxeStay, every detail is curated to ensure your experience exceeds all expectations.
          </p>

          {/* Amenities */}
          <h2 style={s.sectionTitle}>Amenities</h2>
          <div style={s.amenitiesGrid}>
            {amenities.length > 0 ? (
              amenities.map((key) => {
                const item = AMENITY_MAP[key];
                if (!item) return null;

                return (
                  <div key={key} style={s.amenityItem}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={s.amenityLabel}>{item.label}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "#8A8278", fontSize: 13 }}>
                No amenities listed
              </div>
            )}
          </div>

          {/* Policies */}
          <h2 style={s.sectionTitle}>Room Policies</h2>
          <ul style={s.policiesList}>
            <li style={s.policyItem}>
              <span>🕒 Check-in</span>
              <span>{policy?.checkInTime || "14:00"}</span>
            </li>

            <li style={s.policyItem}>
              <span>🕛 Check-out</span>
              <span>{policy?.checkOutTime || "12:00"}</span>
            </li>

            <li style={s.policyItem}>
              <span>💳 Cancellation</span>
              <span>{formatCancellation()}</span>
            </li>

            <li style={s.policyItem}>
              <span>👤 Extra guest</span>
              <span>
                {policy?.extraGuestFee > 0
                  ? `+$${policy.extraGuestFee}/night`
                  : "Free"}
              </span>
            </li>
          </ul>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>Reserve Your Stay</div>
          <p style={{ fontSize: 12, color: "rgba(247,243,236,0.4)", marginBottom: 24, lineHeight: 1.7 }}>
            Select dates to see the best available price, including any active seasonal rates.
          </p>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Check-in</label>
            <input type="date" value={checkIn} min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              style={s.sidebarInput}
              onFocus={(e) => (e.target.style.borderColor = "#C9993A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Check-out</label>
            <input type="date" value={checkOut}
              min={getNextDay(checkIn)}
              onChange={(e) => setCheckOut(e.target.value)}
              style={s.sidebarInput}
              onFocus={(e) => (e.target.style.borderColor = "#C9993A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>

          <div style={s.sidebarField}>
            <label style={s.sidebarLabel}>Guests</label>
            <select value={guests} onChange={(e) => setGuests(e.target.value)}
              style={{ ...s.sidebarInput, background: "rgba(255,255,255,0.07)" }}>
              {Array.from({ length: roomType?.capacity || 4 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} style={{ background: "#2A2520", color: "#F7F3EC" }}>
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={s.sidebarDivider} />

          {nights > 0 ? (
            <>
              {priceLoading ? (
                <div style={{ fontSize: 12, color: "rgba(247,243,236,0.4)", padding: "8px 0" }}>
                  Updating price...
                </div>
              ) : (
                <>
                  <div style={s.priceRow}>
                    <span>${pricePerNight} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>${subtotal}</span>
                  </div>

                  <div style={s.sidebarDivider} />
                  <div style={s.totalRow}>
                    <span style={s.totalLabel}>Total</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={s.totalPrice}>${total}</div>
                      <div style={{ fontSize: 10, color: "rgba(247,243,236,0.3)", marginTop: 3 }}>
                        for {nights} night{nights > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user ? (
                <button
                  style={s.btnBook}
                  onClick={handleBook}
                  disabled={!isAvailable}
                >
                  {isAvailable ? "Book Now" : "Unavailable"}
                </button>
              ) : (
                <button style={s.btnSignIn} onClick={() => onLogin?.("login")}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,153,58,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >Sign In to Book</button>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "rgba(247,243,236,0.3)", padding: "8px 0 16px" }}>
                Select dates above to see pricing
              </div>
              <button disabled style={s.btnDisabled}>Select Dates First</button>
            </>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1C1A16", color: "#F7F3EC", padding: "12px 20px", borderRadius: 2, fontSize: 12, zIndex: 200, boxShadow: "0 8px 32px rgba(28,26,22,.2)", borderLeft: `3px solid ${toast.type === "error" ? "#B94040" : "#3A7D5A"}`, fontFamily: "'DM Sans', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", color: "#1C1A16" },

  nav: { position: "sticky", top: 0, zIndex: 50, background: "rgba(247,243,236,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(28,26,22,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64 },
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, letterSpacing: "2px", cursor: "pointer", color: "#1C1A16" },
  navLinks: { display: "flex", alignItems: "center", gap: 24 },
  backBtn: { background: "transparent", border: "none", color: "#8A8278", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  navLink: { fontSize: 13, color: "#8A8278", cursor: "pointer" },
  btnNavOutline: { background: "transparent", color: "#1C1A16", border: "1px solid rgba(28,26,22,0.25)", padding: "8px 18px", fontSize: 11, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", marginRight: 8, transition: "all .2s" },
  btnNav: { background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "8px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", transition: "all .2s" },

  infoBar: { background: "#fff", borderBottom: "1px solid rgba(28,26,22,0.07)" },
  infoBarInner: { maxWidth: 1300, margin: "0 auto", padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  infoBarType: { fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#8A8278", marginBottom: 6 },
  infoBarTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: "#1C1A16", display: "flex", alignItems: "center", gap: 12 },
  infoBadge: { background: "rgba(58,125,90,0.1)", color: "#3A7D5A", fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: 1 },
  infoBarPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#C9993A" },

  body: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 52, padding: "48px 48px", maxWidth: 1300, margin: "0 auto" },

  statsBar: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(28,26,22,0.07)", border: "1px solid rgba(28,26,22,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 40 },
  statItem: { background: "#fff", padding: "18px 20px", textAlign: "center" },
  statValue: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#1C1A16", marginBottom: 4 },
  statLabel: { fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A8278" },

  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(28,26,22,0.08)" },
  desc: { fontSize: 14, lineHeight: 1.95, color: "#5A5450", marginBottom: 40 },

  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 40 },
  amenityItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3 },
  amenityLabel: { fontSize: 11, color: "#5A5450" },

  pricingCard: { background: "#fff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 3, padding: "20px 24px", marginBottom: 40 },
  pricingRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5A5450", marginBottom: 10 },
  pricingDivider: { height: 1, background: "rgba(28,26,22,0.07)", margin: "12px 0" },

  policiesList: { listStyle: "none", padding: 0, marginBottom: 40 },
  policyItem: { display: "flex", gap: 16, padding: "13px 0", borderBottom: "1px solid rgba(28,26,22,0.06)", fontSize: 13 },
  policyLabel: { color: "#1C1A16", fontWeight: 600, minWidth: 110, flexShrink: 0 },
  policyValue: { color: "#5A5450" },

  sidebar: { position: "sticky", top: 84, height: "fit-content", background: "#1C1A16", borderRadius: 4, padding: 32 },
  sidebarTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#F7F3EC", marginBottom: 6 },
  sidebarField: { marginBottom: 18 },
  sidebarLabel: { display: "block", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(247,243,236,0.4)", marginBottom: 8 },
  sidebarInput: { width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#F7F3EC", padding: "10px 14px", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border .2s" },
  sidebarDivider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "18px 0" },
  priceRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(247,243,236,0.6)", marginBottom: 10 },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  totalLabel: { fontSize: 13, color: "#F7F3EC", fontWeight: 600 },
  totalPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "#C9993A" },
  btnBook: { width: "100%", background: "#C9993A", color: "#1C1A16", border: "none", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, marginTop: 20, transition: "all .2s" },
  btnSignIn: { width: "100%", background: "transparent", color: "#C9993A", border: "1px solid #C9993A", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, marginTop: 20, transition: "all .2s" },
  btnDisabled: { width: "100%", background: "rgba(255,255,255,0.06)", color: "rgba(247,243,236,0.25)", border: "none", padding: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "not-allowed", borderRadius: 2, marginTop: 20 },
  noteText: { fontSize: 11, color: "rgba(247,243,236,0.35)", textAlign: "center", marginTop: 14, lineHeight: 1.6 },
};