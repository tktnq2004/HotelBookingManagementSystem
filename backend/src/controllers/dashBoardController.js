import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";
import RoomType from "../models/roomTypeModel.js";

export const getDashboard = async (req, res) => {
  try {

    const today = new Date();

    // ===== 1. STATS =====

    const bookings = await Booking.find();

    const totalBookings = bookings.length;

    // 👉 chỉ tính revenue đã PAID
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // unique customers
    const totalCustomers = new Set(
      bookings.map(b => b.customerId?.toString())
    ).size;

    // ===== OCCUPANCY (REAL-TIME) =====

    const totalRooms = await Room.countDocuments();

    const activeBookings = await Booking.find({
      status: "confirmed",
      checkIn: { $lte: today },
      checkOut: { $gte: today }
    });

    const occupiedRoomIds = new Set();

    activeBookings.forEach(b => {
      b.rooms.forEach(r => {
        occupiedRoomIds.add(r.roomId.toString());
      });
    });

    const occupancyRate = totalRooms === 0
      ? 0
      : Math.round((occupiedRoomIds.size / totalRooms) * 100);

    // ===== 2. RECENT BOOKINGS =====

    const recentBookingsRaw = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = recentBookingsRaw.map(b => ({
      id: b._id,
      guest: b.customerName,
      room: b.rooms.map(r => r.roomTypeName).join(", "),
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      total: b.totalPrice,
      status: b.status
    }));

    // ===== 3. ROOM OCCUPANCY BY TYPE =====

    const roomTypes = await RoomType.find();

    const occupancy = await Promise.all(
      roomTypes.map(async (type) => {

        const total = await Room.countDocuments({
          roomTypeId: type._id
        });

        let booked = 0;

        activeBookings.forEach(b => {
          b.rooms.forEach(r => {
            if (r.roomTypeId.toString() === type._id.toString()) {
              booked++;
            }
          });
        });

        const rate = total === 0
          ? 0
          : Math.round((booked / total) * 100);

        return {
          name: type.name,
          total,
          booked,
          rate
        };
      })
    );

    // ===== 4. MONTHLY REVENUE =====

    const monthlyData = await Booking.aggregate([
      {
        $match: { paymentStatus: "paid" }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          value: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const monthlyRevenue = monthlyData.map(m => ({
      month: monthNames[m._id - 1],
      value: m.value
    }));

    // ===== RESPONSE =====

    res.json({
      stats: {
        totalRevenue,
        totalBookings,
        totalCustomers,
        occupancyRate,
        revenueGrowth: 0,
        bookingsGrowth: 0,
        customersGrowth: 0,
        occupancyGrowth: 0
      },
      recentBookings,
      occupancy,
      monthlyRevenue
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};