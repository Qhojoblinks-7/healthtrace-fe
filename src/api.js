import axios from 'axios';

// API base URL - change this to your Render URL when deploying
// For local development, use http://localhost:8000
// For production, use your Render deployment URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or clear token
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Screening API endpoints
export const screeningAPI = {
  // Get all screenings
  getAll: () => api.get('/screenings/'),
  
  // Get screening by ID
  getById: (id) => api.get(`/screenings/${id}/`),
  
  // Create new screening
  create: (data) => api.post('/screenings/', data),
  
  // Update screening
  update: (id, data) => api.put(`/screenings/${id}/`),
  
  // Delete screening
  delete: (id) => api.delete(`/screenings/${id}/`),
  
  // Get screenings by patient
  getByPatient: (patientId) => api.get(`/screenings/?patient=${patientId}`),
  
  // Get screening statistics
  getStats: () => api.get('/screenings/stats/'),
};

// Patient API endpoints
export const patientAPI = {
  // Get all patients
  getAll: () => api.get('/patients/'),
  
  // Get patient by ID
  getById: (id) => api.get(`/patients/${id}/`),
  
  // Create new patient
  create: (data) => api.post('/patients/', data),
  
  // Update patient
  update: (id, data) => api.put(`/patients/${id}/`),
  
  // Delete patient
  delete: (id) => api.delete(`/patients/${id}/`),
};

// Auth API endpoints
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login/', credentials),
  
  // Logout
  logout: () => api.post('/auth/logout/'),
  
  // Get current user
  me: () => api.get('/auth/me/'),
  
  // Refresh token
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
};

export default api;
