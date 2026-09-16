import express from "express";
import {
    getQuestions,
    searchQuestionsSemantic,
    assessAnswerAgainstQuestion,
} from "../controllers/questionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/questions
router.get("/", authenticate, getQuestions);

// GET /api/questions/search?query=...
router.get("/search", authenticate, searchQuestionsSemantic);


// Authentication is required before evaluating an answer.
router.post(
    "/:questionHash/answer-fit",
    authenticate,
    assessAnswerAgainstQuestion,
);

export default router;