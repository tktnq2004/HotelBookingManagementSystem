import { useState } from "react";
import Home from "./pages/Home";
import Auth from "./pages/auth";
import RoomDetail from "./pages/room-details";
import Booking from "./pages/booking";
import MyBookings from "./pages/my-bookings";
import AdminDashboard from "./admin/dashboard";
import AdminRooms from "./admin/rooms";
import AdminBookings from "./admin/bookings";
import AdminPricing from "./admin/pricing-rules";
import AdminRoomTypes from "./admin/roomTypes";

export default function App() {
  const [page, setPage] = useState("home");
  const [authTab, setAuthTab] = useState("login");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [user, setUser] = useState(null);
  const [bookingDates, setBookingDates] = useState(null);

  const handleLogin = (tab = "login") => {
    setAuthTab(tab);
    setPage("auth");
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  const handleViewRoom = (room,dates) => {
    setSelectedRoomId(room._id);
    setBookingDates(dates);
    setPage("room-detail");
  };

  const handleBook = (data) => {
    if (!user) {
      setAuthTab("login");
      setPage("auth");
      return;
    }
    setBookingData(data);
    setPage("booking");
  };

  const handleBookingSuccess = (result) => {
    setBookingResult(result);
    setPage("success");
  };


  const commonProps = {
    user,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onMyBookings: () => setPage("my-bookings"),
    onHome: () => setPage("home"),
  };


  const adminProps = {
    adminUser: user,
    onLogout: () => setPage("home"),
    onNavigate: (key) => setPage(`admin-${key}`),
  };

  // ── SUCCESS PAGE ──
  if (page === "success" && bookingResult) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F3EC", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(39,174,96,0.1)", border: "2px solid rgba(39,174,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 28 }}>✓</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 300, marginBottom: 12 }}>Booking Confirmed!</h1>
        <p style={{ fontSize: 14, color: "#8A8278", marginBottom: 24 }}>
          Thank you, {bookingResult.firstName}! Your confirmation has been sent to <strong>{bookingResult.email}</strong>
        </p>
        <div style={{ background: "#fff", border: "1px solid rgba(28,26,22,0.1)", borderRadius: 3, padding: "10px 28px", fontSize: 12, letterSpacing: "2px", color: "#C9993A", textTransform: "uppercase", marginBottom: 12 }}>
          Booking Reference: {bookingResult.ref}
        </div>
        <div style={{ fontSize: 13, color: "#8A8278", marginBottom: 36 }}>
          {bookingResult.room.name} · {bookingResult.checkIn} → {bookingResult.checkOut} · {bookingResult.nights} nights · Total: ${bookingResult.total}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setPage("my-bookings")}
            style={{ background: "#1C1A16", color: "#F7F3EC", border: "none", padding: "13px 32px", fontSize: 12, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          >View My Bookings</button>
          <button onClick={() => setPage("home")}
            style={{ background: "transparent", color: "#1C1A16", border: "1.5px solid rgba(28,26,22,0.2)", padding: "13px 32px", fontSize: 12, fontWeight: 500, cursor: "pointer", borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
          >Back to Home</button>
        </div>
      </div>
    );
  }

  if (page === "admin-dashboard") return <AdminDashboard {...adminProps} />;
  if (page === "admin-rooms") return <AdminRooms {...adminProps} />;
  if (page === "admin-bookings") return <AdminBookings {...adminProps} />;
  if (page === "admin-pricing") return <AdminPricing {...adminProps} />;
  if (page === "admin-roomTypes") return <AdminRoomTypes {...adminProps} />;

  if (page === "auth") {
    return (
      <Auth
        defaultTab={authTab}
        onSuccess={handleAuthSuccess}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "my-bookings") {
    return (
      <MyBookings
        {...commonProps}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "booking") {
    return (
      <Booking
        {...commonProps}
        bookingData={bookingData}
        onBack={() => setPage("room-detail")}
        onSuccess={handleBookingSuccess}
      />
    );
  }

  if (page === "room-detail") {
    return (
      <RoomDetail
        {...commonProps}
        roomId={selectedRoomId}
        initialCheckIn={bookingDates?.checkIn}
        initialCheckOut={bookingDates?.checkOut}
        initialGuests={bookingDates?.guests}
        onBack={() => setPage("home")}
        onBook={handleBook}
      />
    );
  }

  return (
    <Home
      {...commonProps}
      onViewRoom={handleViewRoom}
      onBookNow={(room) => { setSelectedRoomId(room?._id); setPage("room-detail"); }}
      onAdminDashboard={() => setPage("admin-dashboard")}
    />
  );
}