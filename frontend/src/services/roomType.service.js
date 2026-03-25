import api from "./api";

export const getRoomTypes = () =>
  api.get("/room-types");

export const createRoomType = (data) =>
  api.post("/room-types", data);

export const updateRoomType = (id, data) =>
  api.put(`/room-types/${id}`, data);

export const deleteRoomType = (id) =>
  api.delete(`/room-types/${id}`);