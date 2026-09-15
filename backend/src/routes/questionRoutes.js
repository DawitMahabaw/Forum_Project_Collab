import express from "express";
import {
    searchQuestionsSemantic
} from "../controllers/questionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/questions/search?query=...
router.get("/search", authenticate, searchQuestionsSemantic);

export default router;