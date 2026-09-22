import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import {
  ask,
  getDocument,
  listDocuments,
  remove,
  search,
  streamDocument,
  uploadDocument,
} from "../controllers/documentController.js";
import { uploadPdf } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", listDocuments);
router.post("/", uploadPdf.single("file"), uploadDocument);
router.get("/:documentId/search", search);
router.post("/:documentId/query", ask);
router.get("/:documentId/file", streamDocument);
router.delete("/:documentId", remove);
router.get("/:documentId", getDocument);

export default router;
