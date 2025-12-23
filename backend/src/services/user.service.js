import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

/**
 * User Service - Handles all user-related business logic
 */
class UserService {
    /**
     * Create a new user
     */
    async createUser({ name, email, password, role = ROLES.STUDENT }) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.status = 400;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();
        return user.toJSON();
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        return user;
    }

    /**
     * Get all users with optional filters
     */
    async getAllUsers(filters = {}) {
        const query = {};

        if (filters.role) query.role = filters.role;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;

        // Search by name or email
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .populate('assignedTeacherId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await User.countDocuments(query);

        return {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                limit
            }
        };
    }

    /**
     * Update user
     */
    async updateUser(userId, updates) {
        // Don't allow password updates through this method
        delete updates.password;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        return user;
    }

    /**
     * Delete user permanently
     */
    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        return {
            id: user._id,
            email: user.email,
            name: user.name
        };
    }

    /**
     * Toggle user active status
     */
    async toggleUserStatus(userId) {
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        user.isActive = !user.isActive;
        await user.save();

        return user.toJSON();
    }

    /**
     * Assign students to teacher
     */
    async assignStudentsToTeacher(teacherId, studentIds) {
        // Verify teacher exists and is active
        const teacher = await User.findById(teacherId);
        if (!teacher) {
            const error = new Error('Teacher not found');
            error.status = 404;
            throw error;
        }

        if (teacher.role !== ROLES.TEACHER) {
            const error = new Error('User is not a teacher');
            error.status = 400;
            throw error;
        }

        if (!teacher.isActive) {
            const error = new Error('Cannot assign to inactive teacher');
            error.status = 400;
            throw error;
        }

        // Validate all students
        const students = await User.find({ _id: { $in: studentIds } });

        if (students.length !== studentIds.length) {
            const error = new Error('Some students not found');
            error.status = 404;
            throw error;
        }

        const invalidStudents = students.filter(s => s.role !== ROLES.STUDENT || !s.isActive);
        if (invalidStudents.length > 0) {
            const error = new Error('Some users are not active students');
            error.status = 400;
            throw error;
        }

        // Assign students to teacher
        await User.updateMany(
            { _id: { $in: studentIds } },
            { assignedTeacherId: teacherId }
        );

        return {
            teacherId,
            studentIds,
            count: studentIds.length
        };
    }

    /**
     * Get dashboard stats
     */
    async getDashboardStats() {
        const [teachers, students, admins, inactive] = await Promise.all([
            User.countDocuments({ role: ROLES.TEACHER, isActive: true }),
            User.countDocuments({ role: ROLES.STUDENT, isActive: true }),
            User.countDocuments({ role: ROLES.ADMIN, isActive: true }),
            User.countDocuments({ isActive: false })
        ]);

        // Recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUsers = await User.find({
            createdAt: { $gte: sevenDaysAgo }
        })
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        return {
            users: {
                teachers,
                students,
                admins,
                inactive,
                total: teachers + students + admins
            },
            recentUsers
        };
    }
}

export default new UserService();
