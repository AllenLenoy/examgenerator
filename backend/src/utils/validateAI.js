/**
 * AI validation and rate limiting utilities
 */

const AI_LIMITS = {
    MAX_QUESTIONS_PER_REQUEST: 50,
    MAX_TOKENS_PER_DAY: 100000,
    MAX_REQUESTS_PER_HOUR: 20
};

/**
 * Validate AI request parameters
 */
export function validateAIRequest(params) {
    const errors = [];

    if (!params.subject) {
        errors.push('Subject is required');
    }

    if (!params.topic) {
        errors.push('Topic is required');
    }

    if (!params.count || params.count < 1) {
        errors.push('Question count must be at least 1');
    }

    if (params.count > AI_LIMITS.MAX_QUESTIONS_PER_REQUEST) {
        errors.push(`Cannot generate more than ${AI_LIMITS.MAX_QUESTIONS_PER_REQUEST} questions at once`);
    }

    if (params.difficulty && !['easy', 'medium', 'hard'].includes(params.difficulty)) {
        errors.push('Difficulty must be easy, medium, or hard');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check if user has exceeded AI usage limits
 */
export function checkAIRateLimit(usageStats) {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    // Check daily token limit
    const tokensUsedToday = usageStats
        .filter(stat => stat.createdAt >= oneDayAgo)
        .reduce((sum, stat) => sum + (stat.tokensUsed || 0), 0);

    if (tokensUsedToday >= AI_LIMITS.MAX_TOKENS_PER_DAY) {
        return {
            allowed: false,
            reason: 'Daily token limit exceeded'
        };
    }

    // Check hourly request limit
    const requestsLastHour = usageStats
        .filter(stat => stat.createdAt >= oneHourAgo)
        .length;

    if (requestsLastHour >= AI_LIMITS.MAX_REQUESTS_PER_HOUR) {
        return {
            allowed: false,
            reason: 'Hourly request limit exceeded'
        };
    }

    return {
        allowed: true,
        remainingTokens: AI_LIMITS.MAX_TOKENS_PER_DAY - tokensUsedToday,
        remainingRequests: AI_LIMITS.MAX_REQUESTS_PER_HOUR - requestsLastHour
    };
}

/**
 * Sanitize AI-generated content
 */
export function sanitizeAIContent(content) {
    if (!content) return '';

    // Remove potentially harmful content
    return content
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .trim();
}

/**
 * Validate AI-generated question format
 */
export function validateAIQuestion(question) {
    const errors = [];

    if (!question.text || question.text.length < 10) {
        errors.push('Question text is too short');
    }

    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push('Question must have at least 2 options');
    }

    if (question.correctOption === undefined || question.correctOption < 0) {
        errors.push('Valid correct option is required');
    }

    if (question.correctOption >= (question.options?.length || 0)) {
        errors.push('Correct option index is out of range');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export default {
    validateAIRequest,
    checkAIRateLimit,
    sanitizeAIContent,
    validateAIQuestion,
    AI_LIMITS
};
