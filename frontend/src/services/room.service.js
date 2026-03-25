import api from "./api";

const getRooms = (params) =>
  api.get("/rooms", { params });

const createRoom = (data) =>
  api.post("/rooms", data);

const updateRoom = (id, data) =>
  api.put(`/rooms/${id}`, data);

const deleteRoom = (id) =>
  api.delete(`/rooms/${id}`);

const uploadImages = (roomId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append("images", file));

  return api.post(`/rooms/upload/${roomId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

const deleteImage = (roomId, image) => {
  return api.delete(`/rooms/image/${roomId}`, {
    data: { image }
  });
};

export default {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteImage,
  uploadImages
};