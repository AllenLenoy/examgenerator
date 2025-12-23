import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration
 */
export const config = {
    // Server
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-genie',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '24h',

    // AI
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',

    // Application
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    tokenExpiry: '24h'
};

export default config;
