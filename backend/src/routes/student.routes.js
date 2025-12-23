import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import studentController from '../controllers/student.controller.js';

const router = express.Router();

// All student routes require authentication and student role
router.use(requireAuth);
router.use(requireRole('student'));

/**
 * GET /api/student/exams
 * Get all exams assigned to student
 */
router.get('/exams', studentController.getExams);

/**
 * GET /api/student/attempts
 * Get all attempts by student
 */
router.get('/attempts', studentController.getAttempts);

/**
 * GET /api/student/attempts/:attemptId
 * Get specific attempt details
 */
router.get('/attempts/:attemptId', studentController.getAttempt);

/**
 * POST /api/student/attempts/:examId/start
 * Start a new exam attempt
 */
router.post('/attempts/:examId/start', studentController.startAttempt);

/**
 * POST /api/student/attempts/:attemptId/submit
 * Submit exam attempt with answers
 */
router.post('/attempts/:attemptId/submit', studentController.submitAttempt);

/**
 * GET /api/student/assignments
 * Get all assignments for student
 */
router.get('/assignments', studentController.getAssignments);

/**
 * POST /api/student/assignments/:assignmentId/start
 * Start assignment exam
 */
router.post('/assignments/:assignmentId/start', studentController.startAssignment);

/**
 * POST /api/student/assignments/:assignmentId/submit
 * Submit assignment answers
 */
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

/**
 * GET /api/student/assignments/:assignmentId/result
 * Get assignment result
 */
router.get('/assignments/:assignmentId/result', studentController.getAssignmentResult);

export default router;
