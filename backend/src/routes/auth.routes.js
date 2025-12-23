import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * ⚠️ SECURITY: Open registration for development. Restrict to admin-only in production.
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student' // Default to student
        });

        await user.save();

        console.log(`✅ User registered: ${email} (${user.role})`);

        // Return user without password
        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON() // Uses toJSON method from model
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user (including password for comparison)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        console.log(`✅ User logged in: ${email} (${user.role})`);

        // Return token and user info
        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

/**
 * GET /api/auth/me
 * Get current logged-in user info
 * Requires authentication
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        // req.user is set by requireAuth middleware
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
    // JWT is stateless, so logout is handled client-side by removing the token
    res.json({ message: 'Logout successful. Please remove token from client.' });
});

export default router;
