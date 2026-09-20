// ============================================================
// KNOWLEDGE BASE / RAG DOCUMENTS PAGE
// ============================================================
//
// Mirrors the supplied Knowledge Base design: a compact private
// document library on the left and a persistent PDF reader with
// Semantic search and Ask with AI sections on the right.

import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  askDocument,
  deleteDocument,
  getDocumentFile,
  listDocuments,
  searchDocument,
  uploadPdf,
} from "../../services/ragService.js";
import styles from "./RagDocuments.module.css";

// Keep file-size presentation compact inside a document list item.
const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const RagDocuments = () => {
  return null;
};

export default RagDocuments;