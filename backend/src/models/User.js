import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        default: 'student',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For students: which teacher they're assigned to
    assignedTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Profile information
    phone: {
        type: String,
        default: ''
    },
    qualification: {
        type: String,
        default: ''
    },
    subjects: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for faster queries (email index created automatically by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ assignedTeacherId: 1 });

// Method to get sanitized user (without password)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
