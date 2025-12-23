import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Question from './src/models/Question.js';
import ExamTemplate from './src/models/ExamTemplate.js';
import Attempt from './src/models/Attempt.js';

console.log('Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI);

console.log('\n📊 DATABASE CONTENTS\n' + '='.repeat(50) + '\n');

const users = await User.find().select('-password');
console.log(`👥 USERS (${users.length} total):`);
if (users.length === 0) {
    console.log('   No users found. Create one through the signup page!');
} else {
    users.forEach(u => {
        console.log(`   - ${u.name}`);
        console.log(`     Email: ${u.email}`);
        console.log(`     Role: ${u.role}`);
        console.log(`     Status: ${u.isActive ? 'Active' : 'Inactive'}`);
        console.log('');
    });
}

const questions = await Question.countDocuments();
console.log(`📝 QUESTIONS: ${questions}`);

const exams = await ExamTemplate.countDocuments();
console.log(`📋 EXAM TEMPLATES: ${exams}`);

const attempts = await Attempt.countDocuments();
console.log(`✍️  ATTEMPTS: ${attempts}`);

console.log('\n' + '='.repeat(50));
await mongoose.connection.close();
process.exit(0);
