import Question from '../models/Question.js';
import { validateAIRequest, sanitizeAIContent, validateAIQuestion } from '../utils/validateAI.js';
import config from '../config/env.js';

/**
 * AI Service - Handles AI question generation
 */
class AIService {
    /**
     * Generate questions using AI
     */
    async generateQuestions(params, teacherId) {
        // Validate request
        const validation = validateAIRequest(params);
        if (!validation.isValid) {
            const error = new Error('Invalid AI request');
            error.status = 400;
            error.details = validation.errors;
            throw error;
        }

        const { subject, topic, difficulty, count } = params;

        // Build AI prompt
        const prompt = this.buildPrompt(subject, topic, difficulty, count);

        // Call AI API
        const aiResponse = await this.callAI(prompt);

        // Parse and validate AI response
        const questions = this.parseAIResponse(aiResponse);

        // Validate each question
        const validatedQuestions = [];
        for (const question of questions) {
            const validation = validateAIQuestion(question);
            if (validation.isValid) {
                // Sanitize content
                question.text = sanitizeAIContent(question.text);
                question.options = question.options.map(opt => sanitizeAIContent(opt));

                // Save question to database
                const savedQuestion = await Question.create({
                    ...question,
                    subject,
                    topic,
                    difficulty: difficulty || 'medium',
                    createdBy: 'AI',
                    teacherId
                });

                validatedQuestions.push(savedQuestion);
            }
        }

        if (validatedQuestions.length === 0) {
            const error = new Error('No valid questions generated');
            error.status = 500;
            throw error;
        }

        return validatedQuestions;
    }

    /**
     * Build AI prompt
     */
    buildPrompt(subject, topic, difficulty, count) {
        return `Generate ${count} multiple choice questions about ${topic} in ${subject}. 
Difficulty level: ${difficulty || 'medium'}.

Format each question as JSON:
{
  "text": "Question text here",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctOption": 0,
  "marks": 1
}

Return an array of ${count} questions.`;
    }

    /**
     * Call AI API
     */
    async callAI(prompt) {
        if (!config.openRouterApiKey) {
            const error = new Error('AI service not configured');
            error.status = 503;
            throw error;
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.openRouterApiKey}`
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-7b-instruct',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('AI API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API Error:', error);
            const err = new Error('Failed to generate questions');
            err.status = 500;
            throw err;
        }
    }

    /**
     * Parse AI response
     */
    parseAIResponse(response) {
        try {
            // Try to parse as JSON
            const questions = JSON.parse(response);
            return Array.isArray(questions) ? questions : [questions];
        } catch (error) {
            // If not valid JSON, return empty array
            console.error('Failed to parse AI response:', error);
            return [];
        }
    }
}

export default new AIService();
