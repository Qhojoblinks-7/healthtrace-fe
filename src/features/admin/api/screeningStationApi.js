import api from "@/api";

export const screeningStationApi = {
  getAll: () => api.get("/stations/"),
  getById: (id) => api.get(`/stations/${id}/`),
  create: (data) => api.post("/stations/", data),
  update: (id, data) => api.put(`/stations/${id}/`, data),
  patch: (id, data) => api.patch(`/stations/${id}/`, data),
  delete: (id) => api.delete(`/stations/${id}/`),
};
