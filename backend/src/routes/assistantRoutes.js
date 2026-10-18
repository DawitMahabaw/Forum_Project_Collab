import express from "express";
import { optionalAuthenticate } from "../middleware/authMiddleware.js";
import { assistantChatLimiter } from "../middleware/rateLimiter.js";
import { chatWithAssistant } from "../controllers/assistantController.js";

const router = express.Router();

// POST /api/assistant/chat (authenticated or guest, rate-limited)
router.post("/chat", assistantChatLimiter, optionalAuthenticate, chatWithAssistant);

export default router;
