import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import ExamTemplate from '../models/ExamTemplate.js';
import Attempt from '../models/Attempt.js';
import Question from '../models/Question.js';

const router = express.Router();

// All routes require student authentication
router.use(requireAuth, requireRole('student'));

// ==================== EXAM ACCESS ====================

// Get exams assigned to student
router.get('/exams', async (req, res) => {
    try {
        const exams = await ExamTemplate.find({
            assignedTo: req.user._id,
            isActive: true
        })
            .populate('createdBy', 'name')
            .select('-rules') // Don't expose question selection rules
            .sort({ createdAt: -1 });

        // Check if student has already attempted each exam
        const examIds = exams.map(e => e._id);
        const attempts = await Attempt.find({
            studentId: req.user._id,
            examTemplateId: { $in: examIds }
        }).select('examTemplateId status');

        const examsWithStatus = exams.map(exam => {
            const attempt = attempts.find(a =>
                a.examTemplateId.toString() === exam._id.toString()
            );

            return {
                ...exam.toObject(),
                attempted: !!attempt,
                attemptStatus: attempt?.status || null
            };
        });

        res.json({ exams: examsWithStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ATTEMPT MANAGEMENT ====================

// Get student's attempt history
router.get('/attempts', async (req, res) => {
    try {
        const attempts = await Attempt.find({
            studentId: req.user._id
        })
            .populate('examTemplateId', 'title subject totalMarks duration')
            .sort({ startTime: -1 });

        res.json({ attempts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific attempt details
router.get('/attempts/:attemptId', async (req, res) => {
    try {
        const attempt = await Attempt.findOne({
            _id: req.params.attemptId,
            studentId: req.user._id
        }).populate('examTemplateId', 'title subject totalMarks duration');

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found' });
        }

        res.json({ attempt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start new exam attempt
router.post('/attempts/:examId/start', async (req, res) => {
    try {
        const exam = await ExamTemplate.findOne({
            _id: req.params.examId,
            assignedTo: req.user._id,
            isActive: true
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found or not assigned to you' });
        }

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({
            studentId: req.user._id,
            examTemplateId: exam._id
        });

        if (existingAttempt) {
            return res.status(400).json({
                error: 'You have already attempted this exam',
                attempt: existingAttempt
            });
        }

        // Select questions based on exam rules
        const selectedQuestions = [];

        for (const rule of exam.rules) {
            const questions = await Question.find({
                subject: exam.subject,
                topic: rule.topic,
                difficulty: rule.difficulty,
                isActive: true
            }).limit(rule.count * 2); // Get extras for randomization

            // Shuffle and select required count
            const shuffled = questions.sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, rule.count);

            selectedQuestions.push(...selected.map(q => ({
                questionId: q._id,
                questionText: q.text,
                options: q.options,
                correctOption: q.correctOption,
                marks: q.marks,
                studentAnswer: null,
                isCorrect: null
            })));
        }

        if (selectedQuestions.length === 0) {
            return res.status(400).json({
                error: 'No questions available for this exam. Contact your teacher.'
            });
        }

        // Create attempt
        const attempt = await Attempt.create({
            studentId: req.user._id,
            examTemplateId: exam._id,
            questions: selectedQuestions,
            totalQuestions: selectedQuestions.length,
            startTime: new Date(),
            status: 'in-progress'
        });

        // Return attempt WITHOUT correct answers
        const attemptResponse = attempt.toObject();
        attemptResponse.questions = attemptResponse.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            options: q.options,
            marks: q.marks
            // correctOption excluded!
        }));

        res.status(201).json({ attempt: attemptResponse, exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit exam attempt
router.post('/attempts/:attemptId/submit', async (req, res) => {
    try {
        const { answers } = req.body; // { questionId: answerIndex }

        const attempt = await Attempt.findOne({
            _id: req.params.attemptId,
            studentId: req.user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            return res.status(404).json({
                error: 'Attempt not found or already submitted'
            });
        }

        // Calculate score
        let correctCount = 0;
        let totalScore = 0;

        attempt.questions = attempt.questions.map(question => {
            const studentAnswer = answers[question.questionId.toString()];
            const isCorrect = studentAnswer === question.correctOption;

            if (isCorrect) {
                correctCount++;
                totalScore += question.marks;
            }

            return {
                ...question.toObject(),
                studentAnswer,
                isCorrect
            };
        });

        attempt.score = totalScore;
        attempt.submissionTime = new Date();
        attempt.status = 'completed';

        await attempt.save();
        await attempt.populate('examTemplateId', 'title subject totalMarks');

        res.json({
            attempt,
            summary: {
                score: totalScore,
                correctAnswers: correctCount,
                totalQuestions: attempt.totalQuestions,
                percentage: (totalScore / attempt.examTemplateId.totalMarks) * 100
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
