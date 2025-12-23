import { Router } from 'express';
import { TEMPLATES, ATTEMPTS } from '../data/memDb.js';
import { getQuestionsByRule, getQuestionById } from '../data/questions.js';

const router = Router();

// GET /api/attempts
// Fetch exam attempts for a student
router.get('/', (req, res) => {
    try {
        const { studentId } = req.query;

        if (!studentId) {
            return res.status(400).json({ error: "studentId query parameter is required" });
        }

        // Filter attempts by studentId
        const studentAttempts = ATTEMPTS.filter(a => a.studentId === studentId);

        // Return summary (exclude questionIds and other internal details)
        const summary = studentAttempts.map(attempt => ({
            id: attempt.id,
            examTemplateId: attempt.examTemplateId,
            score: attempt.score,
            status: attempt.status,
            startTime: attempt.startTime,
            submissionTime: attempt.submissionTime
        }));

        res.json(summary);

    } catch (error) {
        console.error("Error fetching attempts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/attempts/start
// Start a new exam attempt for a student
router.post('/start', (req, res) => {
    try {
        const { templateId, studentId } = req.body;

        // Validation
        if (!templateId || !studentId) {
            return res.status(400).json({ error: "templateId and studentId are required" });
        }

        // 1. Fetch Template
        const template = TEMPLATES.find(t => t.id === templateId);
        if (!template) {
            return res.status(404).json({ error: "Exam Template not found" });
        }

        // 2. Randomly Select Questions based on Rules
        let selectedQuestions = [];
        const selectedIds = new Set(); // To prevent duplicates

        for (const rule of template.rules) {
            // rule: { topic, difficulty, count }
            const questions = getQuestionsByRule(rule.topic, rule.difficulty, rule.count);

            for (const q of questions) {
                if (!selectedIds.has(q.id)) {
                    selectedQuestions.push(q);
                    selectedIds.add(q.id);
                }
            }
        }

        // 3. Create ExamAttempt Object
        const newAttempt = {
            id: crypto.randomUUID(),
            studentId,
            examTemplateId: templateId,
            questionIds: selectedQuestions.map(q => q.id), // Persist IDs only
            startTime: new Date(),
            status: 'InProgress'
        };

        // 4. Save to Memory
        ATTEMPTS.push(newAttempt);
        console.log(`[Attempt Started] ID: ${newAttempt.id}, Student: ${studentId}, Qs: ${selectedQuestions.length}`);

        // 5. Return Response (Sanitized - NO CORRECT ANSWERS)
        const sanitizedQuestions = selectedQuestions.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            difficulty: q.difficulty,
            topic: q.topic
            // correctOption is EXPLICITLY OMITTED
        }));

        res.status(201).json({
            attemptId: newAttempt.id,
            questions: sanitizedQuestions
        });

    } catch (error) {
        console.error("Error starting attempt:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/attempts/:attemptId/submit
// Submit answers and calculate score
router.post('/:attemptId/submit', (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body; // { "q1": 0, "q2": 1 }

        // 1. Fetch Attempt
        const attempt = ATTEMPTS.find(a => a.id === attemptId);
        if (!attempt) {
            return res.status(404).json({ error: "Exam Attempt not found" });
        }

        // 2. Status Check (Idempotency)
        if (attempt.status === 'Completed') {
            return res.status(400).json({ error: "This exam limit has already been submitted." });
        }

        // 3. Score Calculation & Wrong Questions Collection
        let score = 0;
        let totalQuestions = attempt.questionIds.length;
        const wrongQuestions = [];

        for (const qId of attempt.questionIds) {
            const question = getQuestionById(qId);

            if (question) {
                const studentAnswer = answers[qId];
                // Compare indices (assuming 0-based for now)
                if (studentAnswer !== undefined && studentAnswer === question.correctOption) {
                    score++;
                } else {
                    // Collect wrong question details
                    wrongQuestions.push({
                        id: question.id,
                        text: question.text,
                        options: question.options,
                        correctOption: question.correctOption,
                        selectedOption: studentAnswer
                    });
                }
            }
        }

        // 4. Update Attempt
        attempt.status = 'Completed';
        attempt.score = score;
        attempt.submissionTime = new Date();

        console.log(`[Exam Submitted] ID: ${attemptId}, Score: ${score}/${totalQuestions}`);

        // 5. Return Result with Wrong Questions
        res.json({
            score,
            totalQuestions,
            correctAnswers: score,
            percentage: ((score / totalQuestions) * 100).toFixed(1) + '%',
            wrongQuestions
        });

    } catch (error) {
        console.error("Error submitting exam:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
