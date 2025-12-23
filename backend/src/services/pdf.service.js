import PDFDocument from 'pdfkit';
import ExamTemplate from '../models/ExamTemplate.js';
import Question from '../models/Question.js';

/**
 * PDF Service - Handles PDF generation for exams
 */
class PDFService {
    /**
     * Generate exam PDF
     */
    async generateExamPDF(examId) {
        // Get exam with questions
        const exam = await ExamTemplate.findById(examId)
            .populate('createdBy', 'name');

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        // Get questions
        const questions = await Question.find({
            _id: { $in: exam.questionIds || [] }
        });

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Add header
        this.addHeader(doc, exam);

        // Add questions
        this.addQuestions(doc, questions);

        // Add footer
        this.addFooter(doc, exam);

        return doc;
    }

    /**
     * Add PDF header
     */
    addHeader(doc, exam) {
        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(exam.title, { align: 'center' })
            .moveDown(0.5);

        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Subject: ${exam.subject}`, { align: 'center' })
            .text(`Duration: ${exam.duration} minutes`, { align: 'center' })
            .text(`Total Marks: ${exam.totalMarks}`, { align: 'center' })
            .moveDown(1);

        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(1);
    }

    /**
     * Add questions to PDF
     */
    addQuestions(doc, questions) {
        questions.forEach((question, index) => {
            // Check if we need a new page
            if (doc.y > 700) {
                doc.addPage();
            }

            // Question number and text
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(`${index + 1}. `, { continued: true })
                .font('Helvetica')
                .text(question.text)
                .moveDown(0.5);

            // Options (if MCQ)
            if (question.options && question.options.length > 0) {
                question.options.forEach((option, optIndex) => {
                    const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
                    doc
                        .fontSize(11)
                        .text(`   ${optionLabel}. ${option}`)
                        .moveDown(0.3);
                });
            }

            // Marks
            doc
                .fontSize(10)
                .fillColor('#666')
                .text(`[${question.marks || 1} mark${question.marks > 1 ? 's' : ''}]`, { align: 'right' })
                .fillColor('#000')
                .moveDown(1);
        });
    }

    /**
     * Add PDF footer
     */
    addFooter(doc, exam) {
        const pages = doc.bufferedPageRange();

        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            doc
                .fontSize(10)
                .text(
                    `Page ${i + 1} of ${pages.count}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
        }
    }

    /**
     * Generate answer key PDF
     */
    async generateAnswerKeyPDF(examId) {
        const exam = await ExamTemplate.findById(examId);

        if (!exam) {
            const error = new Error('Exam not found');
            error.status = 404;
            throw error;
        }

        const questions = await Question.find({
            _id: { $in: exam.questionIds || [] }
        });

        const doc = new PDFDocument();

        doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('Answer Key', { align: 'center' })
            .moveDown(1);

        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Exam: ${exam.title}`, { align: 'center' })
            .moveDown(2);

        questions.forEach((question, index) => {
            const correctOptionLabel = String.fromCharCode(65 + question.correctOption);

            doc
                .fontSize(11)
                .text(`${index + 1}. Correct Answer: ${correctOptionLabel}`)
                .moveDown(0.5);
        });

        return doc;
    }
}

export default new PDFService();
