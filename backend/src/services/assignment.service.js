import Assignment from '../models/Assignment.js';
import Question from '../models/Question.js';
import ExamTemplate from '../models/ExamTemplate.js';

/**
 * Assignment Service - Handles exam assignment operations
 */
class AssignmentService {
    /**
     * Assign exam to student(s)
     */
    async assignExam(examTemplateId, studentIds, teacherId, deadline = null) {
        const examTemplate = await ExamTemplate.findById(examTemplateId);
        if (!examTemplate) {
            const error = new Error('Exam template not found');
            error.status = 404;
            throw error;
        }

        // Get questions for this exam based on rules
        const questions = await this.getQuestionsForExam(examTemplate);

        const assignments = [];
        for (const studentId of studentIds) {
            const assignment = await Assignment.create({
                examTemplate: examTemplateId,
                teacher: teacherId,
                student: studentId,
                deadline,
                questions: questions.map(q => q._id),
                totalMarks: examTemplate.totalMarks,
                status: 'pending'
            });
            assignments.push(assignment);
        }

        return assignments;
    }

    /**
     * Get questions for exam based on template rules
     */
    async getQuestionsForExam(examTemplate) {
        const questions = [];

        for (const rule of examTemplate.rules) {
            const matchingQuestions = await Question.find({
                subject: examTemplate.subject,
                difficulty: rule.difficulty,
                isActive: true
            }).limit(rule.count);

            questions.push(...matchingQuestions);
        }

        return questions;
    }

    /**
     * Get all assignments for a teacher
     */
    async getTeacherAssignments(teacherId) {
        const assignments = await Assignment.find({ teacher: teacherId })
            .populate('student', 'name email')
            .populate('examTemplate', 'title subject totalMarks duration')
            .sort({ createdAt: -1 });

        return assignments;
    }

    /**
     * Get all assignments for a student
     */
    async getStudentAssignments(studentId) {
        const assignments = await Assignment.find({ student: studentId })
            .populate('examTemplate', 'title subject totalMarks duration description')
            .populate('teacher', 'name')
            .populate('questions')
            .sort({ createdAt: -1 });

        return assignments;
    }

    /**
     * Start exam attempt
     */
    async startExam(assignmentId, studentId) {
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            student: studentId
        }).populate('questions');

        if (!assignment) {
            const error = new Error('Assignment not found');
            error.status = 404;
            throw error;
        }

        if (assignment.status === 'completed') {
            const error = new Error('Exam already completed');
            error.status = 400;
            throw error;
        }

        assignment.status = 'in-progress';
        assignment.startedAt = new Date();
        await assignment.save();

        return assignment;
    }

    /**
     * Submit exam answers
     */
    async submitExam(assignmentId, studentId, answers) {
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            student: studentId
        }).populate('questions');

        if (!assignment) {
            const error = new Error('Assignment not found');
            error.status = 404;
            throw error;
        }

        if (assignment.status === 'completed') {
            const error = new Error('Exam already completed');
            error.status = 400;
            throw error;
        }

        // Calculate score
        let score = 0;
        const submittedAnswers = [];

        for (const answer of answers) {
            const question = assignment.questions.find(
                q => q._id.toString() === answer.questionId
            );

            if (question) {
                submittedAnswers.push({
                    questionId: answer.questionId,
                    selectedOption: answer.selectedOption
                });

                if (question.correctOption === answer.selectedOption) {
                    score += question.marks || 1;
                }
            }
        }

        // Calculate time taken
        const timeTaken = assignment.startedAt
            ? Math.floor((new Date() - assignment.startedAt) / 1000)
            : 0;

        assignment.answers = submittedAnswers;
        assignment.score = score;
        assignment.status = 'completed';
        assignment.completedAt = new Date();
        assignment.timeTaken = timeTaken;
        await assignment.save();

        return {
            score,
            totalMarks: assignment.totalMarks,
            percentage: (score / assignment.totalMarks * 100).toFixed(2),
            timeTaken,
            correctAnswers: submittedAnswers.filter(a => {
                const q = assignment.questions.find(
                    q => q._id.toString() === a.questionId.toString()
                );
                return q && q.correctOption === a.selectedOption;
            }).length,
            totalQuestions: assignment.questions.length
        };
    }

    /**
     * Get assignment result
     */
    async getAssignmentResult(assignmentId, studentId) {
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            student: studentId
        }).populate('questions').populate('examTemplate', 'title subject');

        if (!assignment) {
            const error = new Error('Assignment not found');
            error.status = 404;
            throw error;
        }

        if (assignment.status !== 'completed') {
            const error = new Error('Exam not completed yet');
            error.status = 400;
            throw error;
        }

        return {
            examTitle: assignment.examTemplate.title,
            subject: assignment.examTemplate.subject,
            score: assignment.score,
            totalMarks: assignment.totalMarks,
            percentage: (assignment.score / assignment.totalMarks * 100).toFixed(2),
            timeTaken: assignment.timeTaken,
            completedAt: assignment.completedAt,
            questions: assignment.questions.map(q => ({
                text: q.text,
                options: q.options,
                correctOption: q.correctOption,
                studentAnswer: assignment.answers.find(
                    a => a.questionId.toString() === q._id.toString()
                )?.selectedOption,
                isCorrect: assignment.answers.find(
                    a => a.questionId.toString() === q._id.toString()
                )?.selectedOption === q.correctOption
            }))
        };
    }
}

export default new AssignmentService();
