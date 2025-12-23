import { questions as QUESTIONS } from './memDb.js';

export const getQuestionsByRule = (topic, difficulty, count) => {
    const filtered = QUESTIONS.filter(q =>
        q.topic.toLowerCase() === topic.toLowerCase() &&
        q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );

    // Fisher-Yates Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    return filtered.slice(0, count);
};

export const getQuestionById = (id) => {
    return QUESTIONS.find(q => q.id === id);
};
