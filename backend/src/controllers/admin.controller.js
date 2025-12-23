import userService from '../services/user.service.js';
import examService from '../services/exam.service.js';
import Question from '../models/Question.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Admin Controller - Handles admin requests
 */
class AdminController {
    /**
     * Get dashboard statistics
     */
    async getDashboard(req, res, next) {
        try {
            const userStats = await userService.getDashboardStats();
            const examStats = await examService.getExamStats();

            // Question stats
            const totalQuestions = await Question.countDocuments({ isActive: true });

            res.json({
                ...userStats,
                system: {
                    questions: totalQuestions,
                    ...examStats
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users
     */
    async getUsers(req, res, next) {
        try {
            const result = await userService.getAllUsers(req.query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create user
     */
    async createUser(req, res, next) {
        try {
            const user = await userService.createUser(req.body);

            console.log(`✅ Admin created user: ${user.email} (${user.role})`);

            res.status(HTTP_STATUS.CREATED).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     */
    async updateUser(req, res, next) {
        try {
            const user = await userService.updateUser(req.params.id, req.body);

            console.log(`✅ Admin updated user: ${user.email}`);

            res.json({
                message: 'User updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     */
    async deleteUser(req, res, next) {
        try {
            const deletedUser = await userService.deleteUser(req.params.id);

            console.log(`✅ Admin deleted user: ${deletedUser.email}`);

            res.json({
                message: 'User permanently deleted from database',
                deletedUser
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Toggle user status
     */
    async toggleUserStatus(req, res, next) {
        try {
            const user = await userService.toggleUserStatus(req.params.id);

            console.log(`✅ Admin toggled user status: ${user.email} -> ${user.isActive ? 'active' : 'inactive'}`);

            res.json({
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign students to teacher
     */
    async assignStudents(req, res, next) {
        try {
            const { teacherId, studentIds } = req.body;

            if (!teacherId || !studentIds || !Array.isArray(studentIds)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'teacherId and studentIds (array) are required'
                });
            }

            const result = await userService.assignStudentsToTeacher(teacherId, studentIds);

            console.log(`✅ Admin assigned ${result.count} students to teacher`);

            res.json({
                message: `Successfully assigned ${result.count} students`,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get question stats
     */
    async getQuestionStats(req, res, next) {
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
            next(error);
        }
    }

    /**
     * Get exam stats
     */
    async getExamStats(req, res, next) {
        try {
            const stats = await examService.getExamStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
