import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Question from '../models/Question.js';
import connectDB from '../config/database.js';

/**
 * Seed script to create initial admin user and sample data
 * Run with: node src/scripts/seed.js
 */

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting database seed...');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await Question.deleteMany({});

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 12);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@examgenie.com',
            password: adminPassword,
            role: 'admin',
            isActive: true
        });
        console.log('✅ Created admin user:', admin.email);

        // Create sample teacher
        const teacherPassword = await bcrypt.hash('teacher123', 12);
        const teacher = await User.create({
            name: 'John Teacher',
            email: 'teacher@examgenie.com',
            password: teacherPassword,
            role: 'teacher',
            isActive: true
        });
        console.log('✅ Created teacher user:', teacher.email);

        // Create sample students
        const studentPassword = await bcrypt.hash('student123', 12);
        const student1 = await User.create({
            name: 'Alice Student',
            email: 'alice@student.com',
            password: studentPassword,
            role: 'student',
            isActive: true,
            assignedTeacherId: teacher._id
        });

        const student2 = await User.create({
            name: 'Bob Student',
            email: 'bob@student.com',
            password: studentPassword,
            role: 'student',
            isActive: true,
            assignedTeacherId: teacher._id
        });
        console.log('✅ Created 2 students assigned to teacher');

        // Create sample questions
        const sampleQuestions = [
            {
                text: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctOption: 2,
                difficulty: 'Easy',
                topic: 'Geography',
                subject: 'General Knowledge',
                marks: 1,
                createdBy: teacher._id
            },
            {
                text: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctOption: 1,
                difficulty: 'Easy',
                topic: 'Astronomy',
                subject: 'Science',
                marks: 1,
                createdBy: teacher._id
            },
            {
                text: 'What is 15 × 8?',
                options: ['120', '125', '115', '130'],
                correctOption: 0,
                difficulty: 'Medium',
                topic: 'Multiplication',
                subject: 'Mathematics',
                marks: 2,
                createdBy: teacher._id
            }
        ];

        await Question.insertMany(sampleQuestions);
        console.log(`✅ Created ${sampleQuestions.length} sample questions`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('Admin: admin@examgenie.com / admin123');
        console.log('Teacher: teacher@examgenie.com / teacher123');
        console.log('Student: alice@student.com / student123');
        console.log('Student: bob@student.com / student123');

        process.exit(0);

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
