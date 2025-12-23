import api from './api';

// ==================== AUTH ====================

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// ==================== ADMIN ====================

export const adminAPI = {
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),

    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    toggleUserStatus: (id) => api.post(`/admin/users/${id}/toggle-status`),

    // Student Assignment
    assignStudents: (data) => api.post('/admin/assign-students', data),

    // Stats
    getQuestionStats: () => api.get('/admin/questions/stats'),
    getExamStats: () => api.get('/admin/exams/stats')
};

// ==================== TEACHER ====================

export const teacherAPI = {
    // Questions
    getQuestions: (params) => api.get('/teacher/questions', { params }),
    createQuestion: (data) => api.post('/teacher/questions', data),
    updateQuestion: (id, data) => api.put(`/teacher/questions/${id}`, data),
    deleteQuestion: (id) => api.delete(`/teacher/questions/${id}`),

    // Exams
    getExams: () => api.get('/teacher/exams'),
    createExam: (data) => api.post('/teacher/exams', data),
    updateExam: (id, data) => api.put(`/teacher/exams/${id}`, data),
    deleteExam: (id) => api.delete(`/teacher/exams/${id}`),

    // Students
    getStudents: () => api.get('/teacher/students'),

    // Results
    getResults: (params) => api.get('/teacher/results', { params }),
    getExamResults: (examId) => api.get(`/teacher/results/${examId}`)
};

// ==================== STUDENT ====================

export const studentAPI = {
    // Exams
    getExams: () => api.get('/student/exams'),

    // Attempts
    getAttempts: () => api.get('/student/attempts'),
    getAttempt: (attemptId) => api.get(`/student/attempts/${attemptId}`),
    startAttempt: (examId) => api.post(`/student/attempts/${examId}/start`),
    submitAttempt: (attemptId, answers) => api.post(`/student/attempts/${attemptId}/submit`, { answers })
};
