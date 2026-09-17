import express from "express";
import {
  getQuestions,
  getSingleQuestion,
  searchQuestionsSemantic,
  generateQuestionDraftCoach,
  assessAnswerAgainstQuestion,
} from "../controllers/questionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/questions
router.get("/", authenticate, getQuestions);

// GET /api/questions/search?query=...
router.get("/search", authenticate, searchQuestionsSemantic);

// POST /api/questions/draft-coach   (T-17)
router.post("/draft-coach", authenticate, generateQuestionDraftCoach);

// GET /api/questions/:questionHash
router.get("/:questionHash", authenticate, getSingleQuestion);

// Authentication is required before evaluating an answer.
router.post(
  "/:questionHash/answer-fit",
  authenticate,
  assessAnswerAgainstQuestion,
);

export default router;
