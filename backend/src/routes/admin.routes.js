import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import ExamTemplate from '../models/ExamTemplate.js';
import Attempt from '../models/Attempt.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Count users by role
        const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
        const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
        const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });

        // System-wide stats
        const totalQuestions = await Question.countDocuments({ isActive: true });
        const totalExams = await ExamTemplate.countDocuments({ isActive: true });
        const totalAttempts = await Attempt.countDocuments();
        const completedAttempts = await Attempt.countDocuments({ status: 'Completed' });

        // Recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.find({
            createdAt: { $gte: sevenDaysAgo }
        }).select('name email role createdAt').sort({ createdAt: -1 }).limit(10);

        res.json({
            users: {
                teachers: totalTeachers,
                students: totalStudents,
                admins: totalAdmins,
                inactive: inactiveUsers,
                total: totalTeachers + totalStudents + totalAdmins
            },
            system: {
                questions: totalQuestions,
                exams: totalExams,
                attempts: totalAttempts,
                completedAttempts
            },
            recentUsers
        });

    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 */
router.get('/users', async (req, res) => {
    try {
        const { role, isActive, search, page = 1, limit = 20 } = req.query;

        // Build filter
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get users with pagination
        const users = await User.find(filter)
            .select('-password')
            .populate('assignedTeacherId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalUsers = await User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / parseInt(limit)),
                totalUsers,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * POST /api/admin/users
 * Create a new user (any role)
 */
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Import bcrypt
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.default.genSalt(12);
        const hashedPassword = await bcrypt.default.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await user.save();

        console.log(`✅ Admin created user: ${email} (${user.role})`);

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow password updates through this endpoint
        delete updates.password;

        // If changing role, validate
        if (updates.role && !['admin', 'teacher', 'student'].includes(updates.role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`✅ Admin updated user: ${user.email}`);

        res.json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Soft delete user (set isActive to false)
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`✅ Admin deactivated user: ${user.email}`);

        res.json({
            message: 'User deactivated successfully',
            user
        });

    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * POST /api/admin/users/:id/toggle-status
 * Toggle user active status
 */
router.post('/users/:id/toggle-status', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        console.log(`✅ Admin toggled user status: ${user.email} -> ${user.isActive ? 'active' : 'inactive'}`);

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ Error toggling user status:', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
});

/**
 * POST /api/admin/assign-students
 * Assign students to a teacher
 */
router.post('/assign-students', async (req, res) => {
    try {
        const { teacherId, studentIds } = req.body;

        // Validation
        if (!teacherId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ error: 'teacherId and studentIds (array) are required' });
        }

        // Verify teacher exists and has role 'teacher'
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ error: 'User is not a teacher' });
        }
        if (!teacher.isActive) {
            return res.status(400).json({ error: 'Cannot assign to inactive teacher' });
        }

        // Validate all students
        const students = await User.find({ _id: { $in: studentIds } });

        const errors = [];
        for (const studentId of studentIds) {
            const student = students.find(s => s._id.toString() === studentId);

            if (!student) {
                errors.push(`Student ${studentId} not found`);
                continue;
            }
            if (student.role !== 'student') {
                errors.push(`User ${student.email} is not a student`);
                continue;
            }
            if (!student.isActive) {
                errors.push(`Student ${student.email} is inactive`);
                continue;
            }
            if (student._id.toString() === teacherId) {
                errors.push('Cannot assign teacher to themselves');
                continue;
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: 'Validation failed', errors });
        }

        // Assign students to teacher
        await User.updateMany(
            { _id: { $in: studentIds } },
            { assignedTeacherId: teacherId }
        );

        console.log(`✅ Admin assigned ${studentIds.length} students to teacher: ${teacher.email}`);

        res.json({
            message: `Successfully assigned ${studentIds.length} students to ${teacher.name}`,
            teacherId,
            studentIds
        });

    } catch (error) {
        console.error('❌ Error assigning students:', error);
        res.status(500).json({ error: 'Failed to assign students' });
    }
});

/**
 * GET /api/admin/questions/stats
 * Get question bank statistics (read-only)
 */
router.get('/questions/stats', async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments({ isActive: true });

        // Group by subject
        const bySubject = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Group by difficulty
        const byDifficulty = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);

        res.json({
            total: totalQuestions,
            bySubject,
            byDifficulty
        });

    } catch (error) {
        console.error('❌ Error fetching question stats:', error);
        res.status(500).json({ error: 'Failed to fetch question statistics' });
    }
});

/**
 * GET /api/admin/exams/stats
 * Get exam statistics (read-only)
 */
router.get('/exams/stats', async (req, res) => {
    try {
        const totalExams = await ExamTemplate.countDocuments({ isActive: true });
        const activeExams = await ExamTemplate.countDocuments({
            isActive: true,
            assignedTo: { $exists: true, $not: { $size: 0 } }
        });

        res.json({
            total: totalExams,
            active: activeExams
        });

    } catch (error) {
        console.error('❌ Error fetching exam stats:', error);
        res.status(500).json({ error: 'Failed to fetch exam statistics' });
    }
});

export default router;
