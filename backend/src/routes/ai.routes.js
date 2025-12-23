import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import aiController from '../controllers/ai.controller.js';

const router = express.Router();

// All AI routes require authentication and teacher role
router.use(requireAuth);
router.use(requireRole('teacher'));

/**
 * POST /api/ai/generate
 * Generate questions using AI
 */
router.post('/generate', aiController.generateQuestions);

export default router;
