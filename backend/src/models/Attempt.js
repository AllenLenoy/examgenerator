import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamTemplate',
        required: true
    },
    // Questions shown to this student with their answers
    questions: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        studentAnswer: {
            type: Number,
            min: 0,
            max: 3,
            default: null
        },
        isCorrect: {
            type: Boolean,
            default: null
        }
    }],
    score: {
        type: Number,
        default: 0,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    submissionTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['InProgress', 'Completed', 'Abandoned'],
        default: 'InProgress'
    }
}, {
    timestamps: true
});

// Indexes for querying attempts
attemptSchema.index({ studentId: 1 });
attemptSchema.index({ examTemplateId: 1 });
attemptSchema.index({ status: 1 });
attemptSchema.index({ createdAt: -1 }); // For recent attempts

// Compound index for student's attempts on specific exam
attemptSchema.index({ studentId: 1, examTemplateId: 1 });

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;
