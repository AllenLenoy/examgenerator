import Attempt from '../models/Attempt.js';
import ExamTemplate from '../models/ExamTemplate.js';
import Question from '../models/Question.js';
import { ATTEMPT_STATUS } from '../utils/constants.js';
import { generateQuestionSet } from '../utils/randomize.js';

/**
 * Attempt Service - Handles all exam attempt business logic
 */
class AttemptService {
    /**
     * Start a new exam attempt
     */
    async startAttempt(examId, studentId) {
        // Check if exam exists and is assigned to student
        const exam = await ExamTemplate.findById(examId);

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        if (!exam.assignedTo.includes(studentId)) {
            const error = new Error('This exam is not assigned to you');
            error.status = 403;
            throw error;
        }

        // Check if student already has attempt for this exam
        const existingAttempt = await Attempt.findOne({ examId, studentId });
        if (existingAttempt) {
            const error = new Error('You have already attempted this exam');
            error.status = 400;
            throw error;
        }

        // Get available questions
        const questions = await Question.find({
            isActive: true,
            subject: exam.subject
        });

        // Generate deterministic question set
        const attemptId = `${examId}-${studentId}-${Date.now()}`;
        const selectedQuestions = generateQuestionSet(
            questions,
            exam.selectionRules || [],
            attemptId
        );

        // Create attempt
        const attempt = new Attempt({
            examId,
            studentId,
            questionIds: selectedQuestions.map(q => q._id),
            answers: {},
            status: ATTEMPT_STATUS.IN_PROGRESS,
            startedAt: new Date()
        });

        await attempt.save();

        // Return attempt with questions (without correct answers)
        const attemptWithQuestions = await Attempt.findById(attempt._id)
            .populate({
                path: 'questionIds',
                select: '-correctOption' // Hide correct answer
            });

        return attemptWithQuestions;
    }

    /**
     * Submit exam attempt
     */
    async submitAttempt(attemptId, answers, studentId) {
        const attempt = await Attempt.findById(attemptId)
            .populate('questionIds')
            .populate('examId');

        if (!attempt) {
            const error = new Error('Attempt not found');
            error.status = 404;
            throw error;
        }

        // Verify ownership
        if (attempt.studentId.toString() !== studentId.toString()) {
            const error = new Error('Not authorized');
            error.status = 403;
            throw error;
        }

        // Check if already submitted
        if (attempt.status === ATTEMPT_STATUS.COMPLETED) {
            const error = new Error('Attempt already submitted');
            error.status = 400;
            throw error;
        }

        // Calculate score
        let score = 0;
        for (const question of attempt.questionIds) {
            const studentAnswer = answers[question._id.toString()];
            if (studentAnswer !== undefined && studentAnswer === question.correctOption) {
                score += question.marks || 1;
            }
        }

        // Update attempt
        attempt.answers = answers;
        attempt.score = score;
        attempt.status = ATTEMPT_STATUS.COMPLETED;
        attempt.submittedAt = new Date();

        await attempt.save();

        return attempt;
    }

    /**
     * Get attempt by ID
     */
    async getAttemptById(attemptId) {
        const attempt = await Attempt.findById(attemptId)
            .populate('questionIds')
            .populate('examId')
            .populate('studentId', 'name email');

        if (!attempt) {
            const error = new Error('Attempt not found');
            error.status = 404;
            throw error;
        }

        return attempt;
    }

    /**
     * Get all attempts for student
     */
    async getAttemptsForStudent(studentId) {
        const attempts = await Attempt.find({ studentId })
            .populate('examId', 'title subject')
            .sort({ startedAt: -1 });

        return attempts;
    }

    /**
     * Get all attempts for exam
     */
    async getAttemptsForExam(examId) {
        const attempts = await Attempt.find({ examId })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        // Calculate stats
        const completedAttempts = attempts.filter(a => a.status === ATTEMPT_STATUS.COMPLETED);
        const scores = completedAttempts.map(a => a.score);

        const stats = {
            total: attempts.length,
            completed: completedAttempts.length,
            averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0
        };

        return { attempts, stats };
    }
}

export default new AttemptService();
