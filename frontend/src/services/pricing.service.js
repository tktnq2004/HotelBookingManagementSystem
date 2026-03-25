import api from "./api";

const pricingService = {
  getRules: (params) => api.get("/pricing", { params }),
  createRule: (data) => api.post("/pricing", data),
  updateRule: (id, data) => api.put(`/pricing/${id}`, data),
  deleteRule: (id) => api.delete(`/pricing/${id}`),
  calculatePrice: (roomTypeId, checkIn, checkOut) =>
    api.get("/pricing/calculate", { params: { roomTypeId, checkIn, checkOut } }),
};

export default pricingService;