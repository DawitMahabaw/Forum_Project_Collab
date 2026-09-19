import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { search } from "../controllers/documentController.js";

// Initialize the Express router instance
const router = express.Router();

// Enforce global authentication across all routes declared in this file
router.use(authenticate);


// Declare the clean GET path mapped directly to your search controller
router.get("/:documentId/search", search);

export default router;
