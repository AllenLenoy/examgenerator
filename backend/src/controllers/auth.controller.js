import userService from '../services/user.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import config from '../config/env.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Auth Controller - Handles authentication requests
 */
class AuthController {
    /**
     * Register new user
     */
    async register(req, res, next) {
        try {
            const { name, email, password, role } = req.body;

            // Validation
            if (!name || !email || !password) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Name, email, and password are required'
                });
            }

            const user = await userService.createUser({ name, email, password, role });

            res.status(HTTP_STATUS.CREATED).json({
                message: 'User registered successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Email and password are required'
                });
            }

            // Find user (including password for comparison)
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: 'Invalid email or password'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Account is deactivated. Contact administrator.'
                });
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                config.jwtSecret,
                { expiresIn: config.jwtExpire }
            );

            console.log(`✅ User logged in: ${email} (${user.role})`);

            res.json({
                message: 'Login successful',
                token,
                user: user.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(req, res, next) {
        try {
            res.json({
                user: req.user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const { name, phone, qualification, subjects, bio, experience } = req.body;

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'User not found'
                });
            }

            // Update fields if provided
            if (name) user.name = name;
            if (phone !== undefined) user.phone = phone;
            if (qualification !== undefined) user.qualification = qualification;
            if (subjects !== undefined) user.subjects = subjects;
            if (bio !== undefined) user.bio = bio;
            if (experience !== undefined) user.experience = experience;

            await user.save();

            res.json({
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout
     */
    async logout(req, res, next) {
        try {
            res.json({
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
