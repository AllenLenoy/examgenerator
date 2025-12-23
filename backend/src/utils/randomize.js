/**
 * Deterministic question randomization using seed
 * Ensures same seed always produces same question order
 */

/**
 * Simple seeded random number generator
 * @param {string|number} seed - Seed value
 * @returns {function} Random number generator function
 */
function seededRandom(seed) {
    let value = typeof seed === 'string' ? hashString(seed) : seed;

    return function () {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}

/**
 * Convert string to number hash
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Shuffle array using seeded random
 * @param {Array} array - Array to shuffle
 * @param {string|number} seed - Seed for randomization
 * @returns {Array} Shuffled array
 */
export function shuffleWithSeed(array, seed) {
    const random = seededRandom(seed);
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Select random items from array using seed
 * @param {Array} array - Source array
 * @param {number} count - Number of items to select
 * @param {string|number} seed - Seed for randomization
 * @returns {Array} Selected items
 */
export function selectRandomWithSeed(array, count, seed) {
    const shuffled = shuffleWithSeed(array, seed);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Generate deterministic question set for an attempt
 * @param {Array} questions - Available questions
 * @param {Object} rules - Selection rules
 * @param {string} attemptId - Unique attempt ID (used as seed)
 * @returns {Array} Selected questions
 */
export function generateQuestionSet(questions, rules, attemptId) {
    const selectedQuestions = [];

    for (const rule of rules) {
        // Filter questions by rule criteria
        const matchingQuestions = questions.filter(q => {
            return (!rule.topic || q.topic === rule.topic) &&
                (!rule.difficulty || q.difficulty === rule.difficulty) &&
                (!rule.subject || q.subject === rule.subject);
        });

        // Select random questions using attempt ID as seed
        const seed = `${attemptId}-${rule.topic || 'all'}-${rule.difficulty || 'all'}`;
        const selected = selectRandomWithSeed(matchingQuestions, rule.count, seed);

        selectedQuestions.push(...selected);
    }

    // Final shuffle of all selected questions
    return shuffleWithSeed(selectedQuestions, attemptId);
}

export default {
    shuffleWithSeed,
    selectRandomWithSeed,
    generateQuestionSet
};
