import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Question from '../models/Question.js';
import ExamTemplate from '../models/ExamTemplate.js';
import User from '../models/User.js';
import Attempt from '../models/Attempt.js';

const router = express.Router();

// All routes require teacher authentication
router.use(requireAuth, requireRole('teacher'));

// ==================== QUESTION MANAGEMENT ====================

// Get teacher's own questions
router.get('/questions', async (req, res) => {
    try {
        const { subject, topic, difficulty } = req.query;
        const filter = { createdBy: req.user._id, isActive: true };

        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;

        const questions = await Question.find(filter).sort({ createdAt: -1 });

        res.json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new question
router.post('/questions', async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            createdBy: req.user._id
        };

        const question = await Question.create(questionData);
        res.status(201).json({ question });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update own question
router.put('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found or unauthorized' });
        }

        Object.assign(question, req.body);
        await question.save();

        res.json({ question });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete own question
router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found or unauthorized' });
        }

        question.isActive = false;
        await question.save();

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EXAM/TEMPLATE MANAGEMENT ====================

// Get teacher's exam templates
router.get('/exams', async (req, res) => {
    try {
        const exams = await ExamTemplate.find({
            createdBy: req.user._id,
            isActive: true
        })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({ exams });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create exam template and assign to students
router.post('/exams', async (req, res) => {
    try {
        const examData = {
            ...req.body,
            createdBy: req.user._id
        };

        const exam = await ExamTemplate.create(examData);
        await exam.populate('assignedTo', 'name email');

        res.status(201).json({ exam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update exam template
router.put('/exams/:id', async (req, res) => {
    try {
        const exam = await ExamTemplate.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found or unauthorized' });
        }

        Object.assign(exam, req.body);
        await exam.save();
        await exam.populate('assignedTo', 'name email');

        res.json({ exam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete exam template
router.delete('/exams/:id', async (req, res) => {
    try {
        const exam = await ExamTemplate.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found or unauthorized' });
        }

        exam.isActive = false;
        await exam.save();

        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STUDENT MANAGEMENT ====================

// Get teacher's assigned students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            assignedTeacherId: req.user._id,
            isActive: true
        })
            .select('-password')
            .sort({ name: 1 });

        res.json({ students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== RESULTS & ANALYTICS ====================

// Get all attempts on teacher's exams
router.get('/results', async (req, res) => {
    try {
        const { examId, studentId } = req.query;

        // Get teacher's exam IDs
        const teacherExams = await ExamTemplate.find({
            createdBy: req.user._id
        }).select('_id');

        const examIds = teacherExams.map(e => e._id);

        const filter = { examTemplateId: { $in: examIds } };
        if (examId) filter.examTemplateId = examId;
        if (studentId) filter.studentId = studentId;

        const attempts = await Attempt.find(filter)
            .populate('studentId', 'name email')
            .populate('examTemplateId', 'title subject totalMarks')
            .sort({ submissionTime: -1 });

        res.json({ attempts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific exam results
router.get('/results/:examId', async (req, res) => {
    try {
        // Verify teacher owns this exam
        const exam = await ExamTemplate.findOne({
            _id: req.params.examId,
            createdBy: req.user._id
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found or unauthorized' });
        }

        const attempts = await Attempt.find({
            examTemplateId: req.params.examId
        })
            .populate('studentId', 'name email')
            .sort({ submissionTime: -1 });

        // Calculate stats
        const stats = {
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0
                ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
                : 0,
            highestScore: attempts.length > 0
                ? Math.max(...attempts.map(a => a.score || 0))
                : 0,
            lowestScore: attempts.length > 0
                ? Math.min(...attempts.map(a => a.score || 0))
                : 0
        };

        res.json({ exam, attempts, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
