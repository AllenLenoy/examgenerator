import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import adminController from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 */
router.get('/users', adminController.getUsers);

/**
 * POST /api/admin/users
 * Create a new user (any role)
 */
router.post('/users', adminController.createUser);

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
router.put('/users/:id', adminController.updateUser);

/**
 * DELETE /api/admin/users/:id
 * Permanently delete user from database
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * POST /api/admin/users/:id/toggle-status
 * Toggle user active status
 */
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

/**
 * POST /api/admin/assign-students
 * Assign students to a teacher
 */
router.post('/assign-students', adminController.assignStudents);

/**
 * GET /api/admin/questions/stats
 * Get question bank statistics (read-only)
 */
router.get('/questions/stats', adminController.getQuestionStats);

/**
 * GET /api/admin/exams/stats
 * Get exam statistics (read-only)
 */
router.get('/exams/stats', adminController.getExamStats);

export default router;
