import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const screeningAPI = {
  getAll: (params = {}) => api.get("/patients/", { params }),

  getById: (id) => api.get(`/patients/${id}/`),

  create: (data) => api.post("/patients/", data),

  update: (id, data) => api.put(`/patients/${id}/`, data),

  patch: (id, data) => api.patch(`/patients/${id}/`, data),

  delete: (id) => api.delete(`/patients/${id}/`),

  consult: (id, data) => api.post(`/patients/${id}/discharge/`, data),

  getNotifications: () =>
    api.get("/patients/", { params: { is_completed: false } }).then(
      (res) => ({
        data: {
          notifications: (res.data.results || res.data).map((p) => ({
            id: p.id,
            patient_id: p.id,
            title: p.patient_name,
            message: `Token ${p.token_id} - ${p.is_urgent ? "URGENT" : "Active"}`,
            type: p.is_urgent ? "critical" : "info",
            timestamp: p.updated_at,
            read: false,
          })),
          unread_count: (res.data.results || res.data).filter((p) => !p.is_completed).length,
        },
      }),
    ),

  markNotificationRead: (patientId) =>
    api.post(`/patients/${patientId}/mark-read/`).then((res) => ({
      data: { unread_count: 0 },
    })),

  getByPatient: (patientId) =>
    api.get(`/patients/${patientId}/`),

  getStats: () => api.get("/patients/analytics/"),
};

export const patientAPI = {
  getAll: () => api.get("/patients/"),

  getById: (id) => api.get(`/patients/${id}/`),

  create: (data) => api.post("/patients/", data),

  update: (id, data) => api.put(`/patients/${id}/`, data),

  delete: (id) => api.delete(`/patients/${id}/`),
};

export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),

  logout: () => api.post("/auth/logout/"),

  me: () => api.get("/auth/me/"),

  refresh: (refreshToken) =>
    api.post("/auth/refresh/", { refresh: refreshToken }),
};

export default api;

// HealthTrace API client - endpoints mapped to backend PatientWorkflow routes
