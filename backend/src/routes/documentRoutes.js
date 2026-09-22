import express from "express";
import authenticate from "../middleware/authMiddleware.js";
<<<<<<< HEAD
import { getDocument, listDocuments, remove, streamDocument, search, uploadDocument } from "../controllers/documentController.js";
=======
import {
  ask,
  remove,
  search,
  uploadDocument,
  getDocument,
  streamDocument,
} from "../controllers/documentController.js";
>>>>>>> origin/main
import { uploadPdf } from "../middleware/uploadMiddleware.js";

// Initialize the Express router instance
const router = express.Router();
// Enforce global authentication across all routes declared in this file
router.use(authenticate);
// ------------------------------------------------------------
// GET /api/documents
// ------------------------------------------------------------

router.get("/", listDocuments);

// Declare the clean GET path mapped directly to your search controller
router.get("/:documentId/search", search);
// Upload a PDF document for the authenticated user
router.post("/", uploadPdf.single("file"), uploadDocument);

// ------------------------------------------------------------
<<<<<<< HEAD
// GET /api/documents/:documentId/file
// ------------------------------------------------------------

router.get("/:documentId/file", streamDocument);

// ------------------------------------------------------------
// DELETE /api/documents/:documentId
// ------------------------------------------------------------

router.delete("/:documentId", remove);

// ------------------------------------------------------------
// GET /api/documents/:documentId
// ------------------------------------------------------------

router.get("/:documentId", getDocument);

=======
// POST /api/documents/:documentId/query
// ------------------------------------------------------------
router.post("/:documentId/query", ask);

// ------------------------------------------------------------
// GET /api/documents/:documentId/file
// ------------------------------------------------------------
router.get("/:documentId/file", streamDocument);

// Authentication is already handled by router.use(authenticate).
router.delete("/:documentId", remove);

>>>>>>> origin/main
export default router;
