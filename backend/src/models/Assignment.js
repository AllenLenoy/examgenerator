import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    // Which exam template is assigned
    examTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamTemplate',
        required: true
    },
    // Teacher who assigned it
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Student who needs to attempt
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Assignment status
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'expired'],
        default: 'pending'
    },
    // Deadline for completion (optional)
    deadline: {
        type: Date,
        default: null
    },
    // When student started the exam
    startedAt: {
        type: Date,
        default: null
    },
    // When student submitted the exam
    completedAt: {
        type: Date,
        default: null
    },
    // Generated questions for this specific attempt
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    // Student's answers
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selectedOption: {
            type: Number,
            min: 0,
            max: 3
        }
    }],
    // Scoring
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    // Time taken in seconds
    timeTaken: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
assignmentSchema.index({ student: 1, status: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ examTemplate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
