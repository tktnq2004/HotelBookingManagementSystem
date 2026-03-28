import API from "./api.js";

const bookingService = {
  createBooking: (data) => API.post("/bookings", data),

  // Lấy danh sách booking (user xem của mình, admin xem tất cả)
  getBookings: (params = {}) => API.get("/bookings", { params }),

  // Lấy chi tiết 1 booking
  getBooking: (id) => API.get(`/bookings/${id}`),

  // Huỷ booking
  cancelBooking: (id) => API.patch(`/bookings/${id}/cancel`),
};

export default bookingService;