import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import { search, uploadDocument } from "../controllers/documentController.js";
import { uploadPdf } from "../middleware/uploadMiddleware.js";

// Initialize the Express router instance
const router = express.Router();

// Enforce global authentication across all routes declared in this file
router.use(authenticate);

// Declare the clean GET path mapped directly to your search controller
router.get("/:documentId/search", search);
// Upload a PDF document for the authenticated user
router.post("/", uploadPdf.single("file"), uploadDocument);

export default router;
