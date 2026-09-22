import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  ask,
  remove,
  search,
  uploadDocument,
  getDocument,
  streamDocument,
} from "../controllers/documentController.js";
import { uploadPdf } from "../middleware/uploadMiddleware.js";

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

// POST /api/documents/:documentId/query
// ------------------------------------------------------------
router.post("/:documentId/query", ask);



export default router;
