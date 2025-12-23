import express from 'express';
import PDFDocument from 'pdfkit';

const router = express.Router();

// In-memory storage for exams (same as templates)
const exams = [];

/**
 * GET /api/exams/:examId/pdf
 * Generate and download PDF for an exam
 * NO answers included - only questions and options
 */
router.get('/:examId/pdf', (req, res) => {
    const { examId } = req.params;

    // Find exam (check both in-memory and session storage)
    // For now, we'll accept exam data via query params or session
    // In production, fetch from database

    // Since exams are stored in frontend context, we'll accept exam data in request body
    // But GET doesn't have body, so we'll create a POST endpoint instead
    res.status(400).json({ error: 'Use POST /api/exams/generate-pdf with exam data in body' });
});

/**
 * POST /api/exams/generate-pdf
 * Generate PDF from exam data sent in request body
 */
router.post('/generate-pdf', (req, res) => {
    try {
        const exam = req.body;

        if (!exam || !exam.questions) {
            return res.status(400).json({ error: 'Invalid exam data' });
        }

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${exam.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add content to PDF
        generatePDFContent(doc, exam);

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

/**
 * Generate PDF content
 */
function generatePDFContent(doc, exam) {
    const pageWidth = doc.page.width - 100; // Accounting for margins

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(exam.title, { align: 'center' });
    doc.moveDown(0.5);

    // Exam details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Date: ${new Date(exam.createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.text(`Duration: ${exam.duration} minutes`, { align: 'center' });
    doc.text(`Total Marks: ${exam.totalMarks}`, { align: 'center' });
    doc.text(`Total Questions: ${exam.questions.length}`, { align: 'center' });

    doc.moveDown(1);

    // Horizontal line
    doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();
    doc.moveDown(1);

    // Instructions
    doc.fontSize(11).font('Helvetica-Bold').text('Instructions:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text('1. Answer all questions.', { indent: 20 });
    doc.text('2. Each question has four options (A, B, C, D). Select the correct one.', { indent: 20 });
    doc.text('3. No negative marking.', { indent: 20 });
    doc.moveDown(1);

    // Another horizontal line
    doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();
    doc.moveDown(1.5);

    // Questions
    exam.questions.forEach((question, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
            doc.addPage();
        }

        // Question number and text
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Q${index + 1}.`, { continued: true });
        doc.font('Helvetica').text(` ${question.text}`, { indent: 30 });

        // Marks
        doc.fontSize(9).fillColor('#666666');
        doc.text(`(${question.marks} ${question.marks === 1 ? 'mark' : 'marks'})`, { indent: 40 });
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Options
        if (question.options && question.options.length > 0) {
            doc.fontSize(10).font('Helvetica');
            question.options.forEach((option, optIndex) => {
                const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                doc.text(`${letter}. ${option}`, { indent: 40 });
            });
        }

        doc.moveDown(1.5);
    });

    // Footer on last page
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('#888888');
        doc.text(
            `Page ${i + 1} of ${totalPages}`,
            50,
            doc.page.height - 30,
            { align: 'center' }
        );
    }
}

export default router;
