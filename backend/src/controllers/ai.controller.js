import aiService from '../services/ai.service.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * AI Controller - Handles AI question generation requests
 */
class AIController {
    /**
     * Generate questions using AI
    */
    async generateQuestions(req, res, next) {
        try {
            const { subject, topic, difficulty, count } = req.body;

            const questions = await aiService.generateQuestions(
                { subject, topic, difficulty, count },
                req.user._id
            );

            res.status(HTTP_STATUS.CREATED).json({
                message: `Successfully generated ${questions.length} questions`,
                questions,
                count: questions.length
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AIController();
