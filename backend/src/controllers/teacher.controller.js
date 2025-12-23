import examService from '../services/exam.service.js';
import attemptService from '../services/attempt.service.js';
import userService from '../services/user.service.js';
import assignmentService from '../services/assignment.service.js';
import Question from '../models/Question.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Teacher Controller - Handles teacher requests
 */
class TeacherController {
    /**
     * Get all questions created by teacher
     */
    async getQuestions(req, res, next) {
        try {
            const query = {
                createdBy: req.user._id,
                isActive: true
            };

            if (req.query.subject) query.subject = req.query.subject;
            if (req.query.topic) query.topic = req.query.topic;
            if (req.query.difficulty) query.difficulty = req.query.difficulty;

            const questions = await Question.find(query).sort({ createdAt: -1 });

            res.json({ questions });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new question
     */
    async createQuestion(req, res, next) {
        try {
            const question = await Question.create({
                ...req.body,
                createdBy: req.user._id
            });

            res.status(HTTP_STATUS.CREATED).json({
                message: 'Question created successfully',
                question
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update question
     */
    async updateQuestion(req, res, next) {
        try {
            const question = await Question.findOne({
                _id: req.params.id,
                createdBy: req.user._id
            });

            if (!question) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Question not found or not authorized'
                });
            }

            Object.assign(question, req.body);
            await question.save();

            res.json({
                message: 'Question updated successfully',
                question
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete question
     */
    async deleteQuestion(req, res, next) {
        try {
            const question = await Question.findOne({
                _id: req.params.id,
                createdBy: req.user._id
            });

            if (!question) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Question not found or not authorized'
                });
            }

            question.isActive = false;
            await question.save();

            res.json({
                message: 'Question deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all exams created by teacher
     */
    async getExams(req, res, next) {
        try {
            const exams = await examService.getAllExams({
                createdBy: req.user._id
            });

            res.json({ exams });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single exam by ID
     */
    async getExamById(req, res, next) {
        try {
            const exam = await examService.getExamById(req.params.id);

            // Verify ownership
            if (exam.createdBy._id.toString() !== req.user._id.toString()) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Not authorized to view this exam'
                });
            }

            res.json({ exam });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new exam
     */
    async createExam(req, res, next) {
        try {
            const exam = await examService.createExam(req.body, req.user._id);

            res.status(HTTP_STATUS.CREATED).json({
                message: 'Exam created successfully',
                exam
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update exam
     */
    async updateExam(req, res, next) {
        try {
            const exam = await examService.updateExam(
                req.params.id,
                req.body,
                req.user._id
            );

            res.json({
                message: 'Exam updated successfully',
                exam
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete exam
     */
    async deleteExam(req, res, next) {
        try {
            await examService.deleteExam(req.params.id, req.user._id);

            res.json({
                message: 'Exam deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get assigned students
     */
    async getStudents(req, res, next) {
        try {
            const result = await userService.getAllUsers({
                assignedTeacherId: req.user._id,
                role: 'student'
            });

            res.json({
                students: result.users
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get results for all exams
     */
    async getResults(req, res, next) {
        try {
            const exams = await examService.getAllExams({
                createdBy: req.user._id
            });

            const results = [];
            for (const exam of exams) {
                const attemptData = await attemptService.getAttemptsForExam(exam._id);
                results.push({
                    exam,
                    ...attemptData
                });
            }

            res.json({ results });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get results for specific exam
     */
    async getExamResults(req, res, next) {
        try {
            const exam = await examService.getExamById(req.params.examId);

            // Verify ownership
            if (exam.createdBy._id.toString() !== req.user._id.toString()) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Not authorized'
                });
            }

            const attemptData = await attemptService.getAttemptsForExam(exam._id);

            res.json({
                exam,
                ...attemptData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign exam to student(s)
     */
    async assignExam(req, res, next) {
        try {
            const { examId, studentIds, deadline } = req.body;

            if (!examId || !studentIds || studentIds.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Exam ID and at least one student ID are required'
                });
            }

            const assignments = await assignmentService.assignExam(
                examId,
                studentIds,
                req.user._id,
                deadline
            );

            res.status(HTTP_STATUS.CREATED).json({
                message: `Exam assigned to ${assignments.length} student(s) successfully`,
                assignments
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all assignments
     */
    async getAssignments(req, res, next) {
        try {
            const assignments = await assignmentService.getTeacherAssignments(req.user._id);

            res.json({ assignments });
        } catch (error) {
            next(error);
        }
    }
}

export default new TeacherController();
