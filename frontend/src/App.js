import { useState, useEffect } from "react";
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
import authService from "./services/auth.service";

export default function App() {
  const [page, setPage] = useState("home");
  const [authTab, setAuthTab] = useState("login");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [user, setUser] = useState(null);
  const [bookingDates, setBookingDates] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch (err) {
        console.log("Not logged in");
      }
    };

    initAuth();
  }, []);

  const handleLogin = (tab = "login") => {
    setAuthTab(tab);
    setPage("auth");
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setPage("home");
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setPage("home");
  };
  const handleViewRoom = (room, dates) => {
    setSelectedRoomId(room._id);
    setBookingDates(dates);
    setPage("room-detail");
  };

  const handleBookNow = (roomOrRooms, priceInfo, dates) => {
    if (!user) {
      setAuthTab("login");
      setPage("auth");
      return;
    }

    setBookingData(
      dates?.isMulti
        ? { isMulti: true, selectedRooms: roomOrRooms, checkIn: dates.checkIn, checkOut: dates.checkOut, guests: dates.guests }
        : { isMulti: false, room: roomOrRooms, priceInfo, checkIn: dates.checkIn, checkOut: dates.checkOut, guests: dates.guests }
    );

    setPage("booking");
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
        onBack={() => setPage("home")}
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
        onBook={handleBookNow}
      />
    );
  }

  return (
    <Home
      {...commonProps}
      onViewRoom={handleViewRoom}
      onBookNow={handleBookNow}
      onAdminDashboard={() => setPage("admin-dashboard")}
    />
  );

}