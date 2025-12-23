import express from "express";
import { v4 as uuid } from "uuid";
import { questions } from "../data/memDb.js";

const router = express.Router();

// Add a question to the bank
router.post("/", (req, res) => {
    const { text, options, correctOption, difficulty, topic } = req.body;

    if (!text || !options || correctOption === undefined) {
        return res.status(400).json({ message: "Invalid question data" });
    }

    const question = {
        id: uuid(),
        text,
        options,
        correctOption,
        difficulty,
        topic
    };

    questions.push(question);

    res.status(201).json(question);
});

export default router;
