import { Router } from 'express';
import { TEMPLATES } from '../data/memDb.js';

const router = Router();

// POST /api/templates
// Create a new Exam Template (Blueprint)
router.post('/', (req, res) => {
    try {
        const { title, duration, totalMarks, rules } = req.body;

        // Basic Validation
        if (!title || !rules || !Array.isArray(rules) || rules.length === 0) {
            return res.status(400).json({ error: "Title and at least one rule are required." });
        }

        const newTemplate = {
            id: crypto.randomUUID(),
            title,
            duration: parseInt(duration) || 60,
            totalMarks: parseInt(totalMarks) || 100,
            rules, // Array of { topic, difficulty, count }
            createdAt: new Date()
        };

        TEMPLATES.push(newTemplate);

        console.log(`[Template Created] ID: ${newTemplate.id}, Title: ${newTemplate.title}`);
        res.status(201).json(newTemplate);

    } catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/templates
// List all templates (Helper for frontend later)
router.get('/', (req, res) => {
    res.json(TEMPLATES);
});

export default router;
