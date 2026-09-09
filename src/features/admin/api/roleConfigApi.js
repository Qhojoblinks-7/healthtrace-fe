import api from "@/api";

export const roleConfigApi = {
  getAll: () => api.get("/roles/"),
  getById: (id) => api.get(`/roles/${id}/`),
  create: (data) => api.post("/roles/", data),
  update: (id, data) => api.put(`/roles/${id}/`, data),
  patch: (id, data) => api.patch(`/roles/${id}/`, data),
  delete: (id) => api.delete(`/roles/${id}/`),
};
