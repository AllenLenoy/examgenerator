import express from 'express';

const router = express.Router();

/**
 * POST /api/ai/generate-questions
 * Generate MCQ questions using AI (Mistral 7B via OpenRouter)
 * 
 * Security: API key is stored in .env and NEVER exposed to frontend
 * Only teachers can trigger this endpoint
 */
router.post('/generate-questions', async (req, res) => {
    try {
        // Step 1: Validate API key exists
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            console.error('⚠️ OpenRouter API key not configured');
            return res.status(500).json({
                error: 'AI service not configured',
                message: 'Please add your OpenRouter API key to the .env file'
            });
        }

        // Step 2: Validate request body
        const { subject, topic, difficulty, count } = req.body;

        if (!subject || !topic || !difficulty || !count) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['subject', 'topic', 'difficulty', 'count']
            });
        }

        // Validate difficulty level
        const validDifficulties = ['Easy', 'Medium', 'Hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                error: 'Invalid difficulty level',
                validOptions: validDifficulties
            });
        }

        // Validate count
        if (count < 1 || count > 20) {
            return res.status(400).json({
                error: 'Invalid question count',
                message: 'Count must be between 1 and 20'
            });
        }

        // Step 3: Build the LLM prompt
        const systemPrompt = `You are an academic exam question generator. Generate EXACTLY ${count} multiple-choice questions.`;

        const userPrompt = `
Exam Details:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}

Rules:
- Exactly 4 options per question
- Only ONE correct option
- Options must be plausible
- Difficulty must match the specified level

Output format:
Return ONLY a valid JSON array.
Each object must follow this schema:

{
  "text": "string",
  "options": ["string","string","string","string"],
  "correctOption": number (0–3),
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "subject": "${subject}"
}

Strict constraints:
- No explanations
- No markdown
- No extra text
- No wrapping in code blocks
- Just the JSON array
`.trim();

        // Step 4: Call OpenRouter API
        console.log(`🤖 Generating ${count} ${difficulty} questions for ${subject} - ${topic}`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5000', // Optional, for OpenRouter analytics
                'X-Title': 'ExamGen Question Generator' // Optional
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenRouter API error:', errorText);
            return res.status(500).json({
                error: 'AI service error',
                message: 'Failed to generate questions. Please try again.'
            });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            console.error('❌ No response from AI');
            return res.status(500).json({
                error: 'AI service error',
                message: 'No response received from AI service'
            });
        }

        // Step 5: Parse and validate JSON response
        let questions;
        try {
            // Clean the response (remove markdown code blocks if present)
            let cleanedResponse = aiResponse.trim();
            if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }

            questions = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError);
            return res.status(500).json({
                error: 'Invalid AI response',
                message: 'AI returned malformed data. Please try again.'
            });
        }

        // Step 6: Validate question structure
        if (!Array.isArray(questions)) {
            return res.status(500).json({
                error: 'Invalid AI response',
                message: 'Expected an array of questions'
            });
        }

        if (questions.length !== count) {
            console.warn(`⚠️ Expected ${count} questions, got ${questions.length}`);
        }

        // Validate each question
        const validatedQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            // Check required fields
            if (!q.text || !Array.isArray(q.options) || q.correctOption === undefined) {
                console.warn(`⚠️ Question ${i + 1} missing required fields, skipping`);
                continue;
            }

            // Check options count
            if (q.options.length !== 4) {
                console.warn(`⚠️ Question ${i + 1} does not have exactly 4 options, skipping`);
                continue;
            }

            // Check correctOption range
            if (q.correctOption < 0 || q.correctOption > 3) {
                console.warn(`⚠️ Question ${i + 1} has invalid correctOption, skipping`);
                continue;
            }

            // Add metadata
            validatedQuestions.push({
                ...q,
                source: 'AI',
                status: 'pending', // Teacher needs to approve
                generatedAt: new Date().toISOString()
            });
        }

        if (validatedQuestions.length === 0) {
            return res.status(500).json({
                error: 'No valid questions generated',
                message: 'AI returned invalid question format. Please try again.'
            });
        }

        // Step 7: Return questions for teacher review
        console.log(`✅ Successfully generated ${validatedQuestions.length} questions`);

        res.status(200).json({
            success: true,
            count: validatedQuestions.length,
            questions: validatedQuestions,
            message: `Generated ${validatedQuestions.length} questions for review`
        });

    } catch (error) {
        console.error('❌ Error in AI generation:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'An unexpected error occurred while generating questions'
        });
    }
});

export default router;
