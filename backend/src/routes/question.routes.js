import express from "express";

const router = express.Router();

// This route is deprecated - questions are managed through teacher routes
router.post("/", (req, res) => {
    res.status(501).json({
        message: "This endpoint is deprecated. Use teacher question management endpoints instead."
    });
});

export default router;
