import axios from 'axios';

const API_BASE_URL = 'https://examshield-hsf4.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('examshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('examshield_token');
      // localStorage.removeItem('examshield_user');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Exam Services
export const examService = {
  getAllExams: () => api.get('/exams'),
  getExamById: (id) => api.get(`/exams/${id}`),
  createExam: (data) => api.post('/exams', data),
  addQuestion: (examId, data) => api.post(`/exams/${examId}/questions`, data),
  updateQuestion: (qId, data) => api.put(`/questions/${qId}`, data),
  deleteQuestion: (qId) => api.delete(`/questions/${qId}`),
  reorderQuestions: (examId, questionIds) => api.post(`/exams/${examId}/questions/reorder`, questionIds),
};

// Paper Workflow Services
export const paperService = {
  getAllPapers: () => api.get('/papers'),
  getPaperById: (id) => api.get(`/papers/${id}`),
  getPaperByExamId: (examId) => api.get(`/papers/exam/${examId}`),
  submitPaper: (id) => api.post(`/papers/${id}/submit`),
  approvePaper: (id, comments) => api.post(`/papers/${id}/approve`, { approved: true, comments }),
  rejectPaper: (id, comments) => api.post(`/papers/${id}/reject`, { approved: false, comments }),
  finalizePaper: (id) => api.post(`/papers/${id}/finalize`),
  scheduleRelease: (id, releaseTime) => api.post(`/papers/${id}/schedule-release?releaseTime=${encodeURIComponent(releaseTime)}`),
  releasePaper: (id) => api.post(`/papers/${id}/release`),
  verifyIntegrity: (id) => api.get(`/papers/${id}/verify-integrity`),
  tamperPaper: (id) => api.post(`/papers/${id}/tamper`),
  restorePaper: (id) => api.post(`/papers/${id}/restore`),
  getDecryptedContent: (id) => api.get(`/papers/${id}/content`),
};

// Blockchain Services
export const blockchainService = {
  getBlocks: () => api.get('/blockchain'),
  verifyBlockchain: () => api.get('/blockchain/verify'),
  tamperBlock: (blockIndex, payload) => api.post('/blockchain/tamper', { blockIndex, payload }),
  restoreBlockchain: () => api.post('/blockchain/restore'),
};

// Audit Log Services
export const auditService = {
  getLogs: (params) => api.get('/audit-logs', { params }),
};

// Security Alert Services
export const alertService = {
  getAlerts: () => api.get('/alerts'),
  getActiveAlerts: () => api.get('/alerts/active'),
  resolveAlert: (id) => api.post(`/alerts/${id}/resolve`),
};

// User Management Services (Admin)
export const userService = {
  getUsers: () => api.get('/users'),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  updateRoles: (id, roles) => api.put(`/users/${id}/roles`, { roles }),
};

export default api;
