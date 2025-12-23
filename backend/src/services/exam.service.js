import ExamTemplate from '../models/ExamTemplate.js';
import Question from '../models/Question.js';
import { EXAM_STATUS } from '../utils/constants.js';

/**
 * Exam Service - Handles all exam-related business logic
 */
class ExamService {
    /**
     * Create a new exam template
     */
    async createExam(examData, createdById) {
        const exam = new ExamTemplate({
            ...examData,
            createdBy: createdById,
            status: EXAM_STATUS.DRAFT
        });

        await exam.save();
        return exam;
    }

    /**
     * Get exam by ID
     */
    async getExamById(examId) {
        const exam = await ExamTemplate.findById(examId)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        return exam;
    }

    /**
     * Get all exams with filters
     */
    async getAllExams(filters = {}) {
        const query = { isActive: true };

        if (filters.createdBy) {
            query.createdBy = filters.createdBy;
        }

        if (filters.subject) {
            query.subject = filters.subject;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        const exams = await ExamTemplate.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return exams;
    }

    /**
     * Update exam
     */
    async updateExam(examId, updates, userId) {
        const exam = await ExamTemplate.findById(examId);

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        // Verify ownership
        if (exam.createdBy.toString() !== userId.toString()) {
            const error = new Error('Not authorized to update this exam');
            error.status = 403;
            throw error;
        }

        Object.assign(exam, updates);
        await exam.save();

        return exam;
    }

    /**
     * Delete exam (soft delete)
     */
    async deleteExam(examId, userId) {
        const exam = await ExamTemplate.findById(examId);

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        // Verify ownership
        if (exam.createdBy.toString() !== userId.toString()) {
            const error = new Error('Not authorized to delete this exam');
            error.status = 403;
            throw error;
        }

        exam.isActive = false;
        await exam.save();

        return exam;
    }

    /**
     * Get exams assigned to student
     */
    async getExamsForStudent(studentId) {
        const exams = await ExamTemplate.find({
            assignedTo: studentId,
            isActive: true,
            status: EXAM_STATUS.PUBLISHED
        })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return exams;
    }

    /**
     * Get exam stats
     */
    async getExamStats() {
        const total = await ExamTemplate.countDocuments({ isActive: true });
        const active = await ExamTemplate.countDocuments({
            isActive: true,
            assignedTo: { $exists: true, $ne: [] }
        });

        return { total, active };
    }
}

export default new ExamService();
