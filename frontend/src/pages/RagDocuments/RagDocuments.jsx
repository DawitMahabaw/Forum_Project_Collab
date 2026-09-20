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
  // A ref lets the visible "Choose file" button open the hidden native input.
  const fileInput = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [askQuery, setAskQuery] = useState("");
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [workingAction, setWorkingAction] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Resolve the selected document from fresh polling responses.
  const activeDocument = useMemo(
    () => documents.find((document) => document.documentId === activeId) || null,
    [activeId, documents],
  );

  // Load the private library and select the newest document on first visit.
  const loadDocuments = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setIsLoading(true);

    try {
      const nextDocuments = await listDocuments();
      setDocuments(nextDocuments);
      setActiveId((currentId) =>
        nextDocuments.some((document) => document.documentId === currentId)
          ? currentId
          : nextDocuments[0]?.documentId || null,
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load your document library.",
      );
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  // Load the library when the page opens.
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Poll only while the currently selected upload is processing.
  useEffect(() => {
    if (activeDocument?.status !== "processing") return undefined;

    const timer = window.setInterval(
      () => loadDocuments({ quiet: true }),
      2500,
    );

    return () => window.clearInterval(timer);
  }, [activeDocument?.status, loadDocuments]);

  // The built-in PDF viewer supplies the reader controls shown in the design.
  useEffect(() => {
    let isCurrent = true;
    let objectUrl = "";
    setPreviewUrl("");

    if (!activeDocument || activeDocument.status !== "ready") {
      return undefined;
    }

    getDocumentFile(activeDocument.documentId)
      .then((url) => {
        if (!isCurrent) {
          URL.revokeObjectURL(url);
          return;
        }

        objectUrl = url;
        setPreviewUrl(url);
      })
      .catch(() => setError("Could not load the PDF preview."));

    return () => {
      isCurrent = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeDocument]);

  // Toasts announce completed actions without interrupting the page.
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Upload the selected PDF and immediately focus it in the right workspace.
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const document = await uploadPdf(file);
      setDocuments((current) => [document, ...current]);
      setActiveId(document.documentId);
      setFile(null);
      setResults([]);
      setAnswer(null);
      setSearchQuery("");
      setAskQuery("");
      setToast("PDF uploaded. It will be ready after indexing finishes.");
      if (fileInput.current) fileInput.current.value = "";
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not upload this PDF.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return null;
};

export default RagDocuments;