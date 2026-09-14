import express from "express";
import { getQuestions } from "../controllers/questionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/questions
router.get("/", authenticate, getQuestions);

export default router;