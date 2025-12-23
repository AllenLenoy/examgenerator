import examService from '../services/exam.service.js';
import attemptService from '../services/attempt.service.js';
import assignmentService from '../services/assignment.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Student Controller - Handles student requests
 */
class StudentController {
    /**
     * Get all exams assigned to student
     */
    async getExams(req, res, next) {
        try {
            const exams = await examService.getExamsForStudent(req.user._id);

            res.json({ exams });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all attempts by student
     */
    async getAttempts(req, res, next) {
        try {
            const attempts = await attemptService.getAttemptsForStudent(req.user._id);

            res.json({ attempts });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific attempt
     */
    async getAttempt(req, res, next) {
        try {
            const attempt = await attemptService.getAttemptById(req.params.attemptId);

            // Verify ownership
            if (attempt.studentId._id.toString() !== req.user._id.toString()) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Not authorized'
                });
            }

            res.json({ attempt });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Start exam attempt
     */
    async startAttempt(req, res, next) {
        try {
            const attempt = await attemptService.startAttempt(
                req.params.examId,
                req.user._id
            );

            res.status(HTTP_STATUS.CREATED).json({
                message: 'Exam attempt started',
                attempt
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit exam attempt
     */
    async submitAttempt(req, res, next) {
        try {
            const { answers } = req.body;

            if (!answers || typeof answers !== 'object') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Answers object is required'
                });
            }

            const attempt = await attemptService.submitAttempt(
                req.params.attemptId,
                answers,
                req.user._id
            );

            res.json({
                message: 'Exam submitted successfully',
                attempt
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all assignments for student
     */
    async getAssignments(req, res, next) {
        try {
            const assignments = await assignmentService.getStudentAssignments(req.user._id);

            res.json({ assignments });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Start assignment exam
     */
    async startAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;

            const assignment = await assignmentService.startExam(assignmentId, req.user._id);

            res.json({ assignment });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit assignment answers
     */
    async submitAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const { answers } = req.body;

            if (!answers || !Array.isArray(answers)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Answers array is required'
                });
            }

            const result = await assignmentService.submitExam(
                assignmentId,
                req.user._id,
                answers
            );

            res.json({
                message: 'Exam submitted successfully',
                result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get assignment result
     */
    async getAssignmentResult(req, res, next) {
        try {
            const { assignmentId } = req.params;

            const result = await assignmentService.getAssignmentResult(
                assignmentId,
                req.user._id
            );

            res.json({ result });
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentController();
