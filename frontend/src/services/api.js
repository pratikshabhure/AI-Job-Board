import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getMe: () => api.get('/auth/me'),
};

// Jobs API
export const jobsAPI = {
  getAll: (params = {}) => api.get('/jobs/', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs/', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
  search: (params) => api.get('/jobs/search/', { params }),
};

// Candidates API
export const candidatesAPI = {
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates/', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
};

// Applications API
export const applicationsAPI = {
  create: (data) => api.post('/applications/', data),
  getByJob: (jobId) => api.get(`/applications/jobs/${jobId}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  getMyApplications: () => api.get('/applications/me'),
};

// Dashboard API
export const dashboardAPI = {
  getAdminSummary: () => api.get('/dashboard/admin-summary'),
};

// AI Matching API
export const aiAPI = {
  matchJobs: (data) => api.post('/ai/match', data),
};

// Utility APIs
export const utilsAPI = {
  healthCheck: () => api.get('/health'),
  seedData: () => api.post('/seed-demo-data'),
};

export default api;