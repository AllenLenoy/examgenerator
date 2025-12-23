import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current logged-in user info
 * Requires authentication
 */
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Requires authentication
 */
router.put('/profile', requireAuth, authController.updateProfile);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authController.logout);

export default router;
