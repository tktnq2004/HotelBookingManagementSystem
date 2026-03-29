import API from "./api.js";

const bookingService = {

  createBooking: (data) => API.post("/bookings", data),

  getBookings: (params = {}) => API.get("/bookings", { params }),

  getBooking: (id) => API.get(`/bookings/${id}`),

  cancelBooking: (id) => API.patch(`/bookings/${id}/cancel`),
  
  updateBookingStatus: (id, status) => API.patch(`/bookings/${id}/status`, { status }),
};

export default bookingService;