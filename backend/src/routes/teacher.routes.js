import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import teacherController from '../controllers/teacher.controller.js';

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(requireAuth);
router.use(requireRole('teacher'));

/**
 * GET /api/teacher/questions
 * Get all questions created by teacher
 */
router.get('/questions', teacherController.getQuestions);

/**
 * POST /api/teacher/questions
 * Create a new question
 */
router.post('/questions', teacherController.createQuestion);

/**
 * PUT /api/teacher/questions/:id
 * Update a question
 */
router.put('/questions/:id', teacherController.updateQuestion);

/**
 * DELETE /api/teacher/questions/:id
 * Delete a question (soft delete)
 */
router.delete('/questions/:id', teacherController.deleteQuestion);

/**
 * GET /api/teacher/exams
 * Get all exams created by teacher
 */
router.get('/exams', teacherController.getExams);

/**
 * GET /api/teacher/exams/:id
 * Get a single exam by ID
 */
router.get('/exams/:id', teacherController.getExamById);

/**
 * POST /api/teacher/exams
 * Create a new exam
 */
router.post('/exams', teacherController.createExam);

/**
 * PUT /api/teacher/exams/:id
 * Update an exam
 */
router.put('/exams/:id', teacherController.updateExam);

/**
 * DELETE /api/teacher/exams/:id
 * Delete an exam (soft delete)
 */
router.delete('/exams/:id', teacherController.deleteExam);

/**
 * GET /api/teacher/students
 * Get assigned students
 */
router.get('/students', teacherController.getStudents);

/**
 * GET /api/teacher/results
 * Get results for all exams
 */
router.get('/results', teacherController.getResults);

/**
 * GET /api/teacher/results/:examId
 * Get results for specific exam
 */
router.get('/results/:examId', teacherController.getExamResults);

/**
 * POST /api/teacher/assignments
 * Assign exam to student(s)
 */
router.post('/assignments', teacherController.assignExam);

/**
 * GET /api/teacher/assignments
 * Get all assignments created by teacher
 */
router.get('/assignments', teacherController.getAssignments);

export default router;
