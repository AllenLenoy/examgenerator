import mongoose from 'mongoose';

const examTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: 1 // in minutes
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 1
    },
    // Teacher who created this exam
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Question selection rules
    rules: [{
        topic: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        count: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    // Students assigned to this exam
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
examTemplateSchema.index({ createdBy: 1 });
examTemplateSchema.index({ assignedTo: 1 });
examTemplateSchema.index({ subject: 1 });
examTemplateSchema.index({ isActive: 1 });

const ExamTemplate = mongoose.model('ExamTemplate', examTemplateSchema);

export default ExamTemplate;
