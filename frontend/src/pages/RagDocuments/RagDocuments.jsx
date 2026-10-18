// ============================================================
// KNOWLEDGE BASE / RAG DOCUMENTS PAGE
// ============================================================
//
// Private document library with semantic search,
// Ask with AI, and document preview.
//

import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Search,
  Share2,
  Send,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import {
  askDocument,
  clearChatMessages,
  deleteChatMessage,
  deleteDocument,
  getDocumentFile,
  listChatMessages,
  listDocuments,
  searchDocument,
  summarizeDocument,
  uploadDocument,
} from "../../services/ragService.js";

import styles from "./RagDocuments.module.css";

// Quick prompts that fill the summary box; the user can still edit them.
const SUMMARY_PRESETS = [
  { label: "One page", prompt: "Summarize this document in one page." },
  {
    label: "Under 500 words",
    prompt: "Summarize this document in no more than 500 words.",
  },
  {
    label: "Bullet points",
    prompt: "Summarize the key points of this document as bullet points.",
  },
  {
    label: "Executive summary",
    prompt: "Write an executive summary of this document.",
  },
];

// Save text as a .txt or .md file, entirely in the browser.
const downloadTextFile = (content, documentTitle, extension = "txt") => {
  const baseName =
    (documentTitle || "document")
      .replace(/\.pdf$/i, "")
      .replace(/[^\w-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "document";
  const mimeType = extension === "md" ? "text/markdown" : "text/plain";
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = url;
  link.download = `${baseName}-summary.${extension}`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const getSelectedPdf = (candidate) => {
  if (!candidate) return null;

  const isPdf =
    candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);

  const isText =
    candidate.type === "text/plain" || /\.txt$/i.test(candidate.name);

  return isPdf || isText ? candidate : null;
};

const resizeChatInput = (textarea) => {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  textarea.style.overflowY = textarea.scrollHeight > 180 ? "auto" : "hidden";
};

const formatSourcePages = (pageNumbers = []) => {
  const pages = [...new Set(pageNumbers)]
    .filter((page) => Number.isSafeInteger(page) && page > 0)
    .sort((first, second) => first - second);

  if (!pages.length) return "";

  const ranges = [];
  let rangeStart = pages[0];
  let rangeEnd = pages[0];

  for (const page of pages.slice(1)) {
    if (page === rangeEnd + 1) {
      rangeEnd = page;
      continue;
    }

    ranges.push(
      rangeStart === rangeEnd
        ? `${rangeStart}`
        : `${rangeStart}–${rangeEnd}`,
    );
    rangeStart = page;
    rangeEnd = page;
  }

  ranges.push(
    rangeStart === rangeEnd
      ? `${rangeStart}`
      : `${rangeStart}–${rangeEnd}`,
  );

  return `${pages.length === 1 ? "Page" : "Pages"} ${ranges.join(", ")}`;
};

const RagDocuments = () => {
  // A ref lets the visible "Choose file" button open the hidden native input.
  const fileInput = useRef(null);
  const chatInput = useRef(null);
  const chatHistory = useRef(null);
  const shouldFollowChat = useRef(true);
  const activeIdRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState("ask");
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [askQuery, setAskQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadedChatDocumentId, setLoadedChatDocumentId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [summary, setSummary] = useState(null);
  const [preview, setPreview] = useState({ documentId: null, url: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [workingAction, setWorkingAction] = useState("");
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Resolve the selected document from fresh polling responses.
  const activeDocument = useMemo(
    () =>
      documents.find((document) => document.documentId === activeId) || null,
    [activeId, documents],
  );

  const activeDocumentId = activeDocument?.documentId;
  const activeDocumentStatus = activeDocument?.status;
  const isLoadingChat = Boolean(
    activeDocumentId && loadedChatDocumentId !== activeDocumentId,
  );
  const currentChatMessages = useMemo(
    () => (isLoadingChat ? [] : chatMessages),
    [isLoadingChat, chatMessages],
  );
  const isAsking = workingAction === "ask";

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (chatInput.current) resizeChatInput(chatInput.current);
  }, [askQuery]);

  useEffect(() => {
    const closeMessageMenus = (event) => {
      window.document
        .querySelectorAll(`.${styles.messageMenu}[open]`)
        .forEach((menu) => {
          if (!menu.contains(event.target)) menu.open = false;
        });
    };

    window.document.addEventListener("pointerdown", closeMessageMenus);
    return () =>
      window.document.removeEventListener("pointerdown", closeMessageMenus);
  }, []);

  useEffect(() => {
    shouldFollowChat.current = true;
  }, [activeDocumentId]);

  useEffect(() => {
    const history = chatHistory.current;
    if (!history || !shouldFollowChat.current) return;

    history.scrollTo({ top: history.scrollHeight, behavior: "smooth" });
  }, [currentChatMessages, isLoadingChat, isAsking]);

  const handleChatHistoryScroll = (event) => {
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    shouldFollowChat.current = scrollHeight - scrollTop - clientHeight <= 48;
  };

  const hasProcessingDocuments = documents.some(
    (document) => document.status === "processing",
  );

  // Load the private library and select the newest document on first visit.
  const loadDocuments = useCallback(async ({ quiet = false } = {}) => {
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
      if (!quiet) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load the library when the page opens.
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    let isCurrent = true;

    if (!activeDocumentId) return undefined;

    listChatMessages(activeDocumentId)
      .then((messages) => {
        if (isCurrent) {
          setChatMessages(messages);
          setLoadedChatDocumentId(activeDocumentId);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setChatMessages([]);
          setLoadedChatDocumentId(activeDocumentId);
          setError(
            requestError.response?.data?.message ||
              "Could not load this document's chat history.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [activeDocumentId]);

  // Keep every in-progress upload current.
  useEffect(() => {
    if (!hasProcessingDocuments) return undefined;

    const timer = window.setInterval(
      () => loadDocuments({ quiet: true }),
      2500,
    );

    return () => window.clearInterval(timer);
  }, [hasProcessingDocuments, loadDocuments]);

  // The browser renders PDF and plain-text files in the document preview.
  useEffect(() => {
    let isCurrent = true;
    let objectUrl = "";

    if (
      !activeDocumentId ||
      activeDocumentStatus !== "ready" ||
      activeTab !== "preview" ||
      !["application/pdf", "text/plain"].includes(activeDocument?.mimeType)
    ) {
      return undefined;
    }

    getDocumentFile(activeDocumentId)
      .then((url) => {
        if (!isCurrent) {
          URL.revokeObjectURL(url);
          return;
        }

        objectUrl = url;

        setPreview({
          documentId: activeDocumentId,
          url,
        });
      })
      .catch(() => setError("Could not load the document preview."));

    return () => {
      isCurrent = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    activeDocumentId,
    activeDocumentStatus,
    activeTab,
    activeDocument?.mimeType,
  ]);

  // Toasts announce completed actions without interrupting the page.
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 3800);

    return () => window.clearTimeout(timer);
  }, [toast]);

  // Upload the selected document and immediately focus it in the workspace.
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const document = await uploadDocument(file);

      setDocuments((current) => [document, ...current]);
      activeIdRef.current = document.documentId;
      setActiveId(document.documentId);
      setActiveTab("ask");

      setFile(null);
      setResults([]);
      setHasSearched(false);
      setSummary(null);
      setSummaryPrompt("");
      setSearchQuery("");
      setAskQuery("");
      setEditingMessageId(null);
      setEditingDraft("");

      setToast("Document uploaded. It will be ready after indexing finishes.");

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not upload this document.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelection = (selectedFile) => {
    const document = getSelectedPdf(selectedFile);

    if (selectedFile && !document) {
      setFile(null);
      setError("Please choose a PDF or TXT file.");
      if (fileInput.current) {
        fileInput.current.value = "";
      }
      return;
    }

    setFile(document);
    setError("");
  };

  const handleFileChange = (event) => {
    handleFileSelection(event.target.files?.[0] || null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const droppedFile = event.dataTransfer.files?.[0] || null;
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  };

  // Switching documents clears outputs that belong to the previous document.
  const handleSelect = (documentId) => {
    activeIdRef.current = documentId;
    setActiveId(documentId);
    setActiveTab("ask");
    setSearchQuery("");
    setAskQuery("");
    setResults([]);
    setHasSearched(false);
    setSummary(null);
    setSummaryPrompt("");
    setEditingMessageId(null);
    setEditingDraft("");
    setError("");
  };

  // Run semantic retrieval independently from the grounded-answer form.
  const handleSemanticSearch = async (event) => {
    event.preventDefault();

    if (!activeDocument || !searchQuery.trim()) return;

    setWorkingAction("search");
    setError("");
    setHasSearched(true);
    setResults([]);

    try {
      const data = await searchDocument(
        activeDocument.documentId,
        searchQuery.trim(),
      );

      setResults(data.results || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not search this document right now.",
      );
    } finally {
      setWorkingAction("");
    }
  };

  // Ask the server for a document-grounded answer with passage citations.
  const handleAsk = async (
    event,
    submittedQuery = askQuery,
    messageId = null,
  ) => {
    event.preventDefault();

    if (!activeDocument || !submittedQuery.trim() || workingAction === "ask") {
      return;
    }

    setWorkingAction("ask");
    setError("");
    const documentId = activeDocument.documentId;

    try {
      const response = await askDocument(
        documentId,
        submittedQuery.trim(),
        messageId,
      );
      if (activeIdRef.current === documentId) {
        setChatMessages(response.messages || []);
        setAskQuery("");
        setEditingMessageId(null);
        setEditingDraft("");
      }
    } catch (requestError) {
      if (activeIdRef.current === documentId) {
        setError(
          requestError.response?.data?.message ||
            "Could not answer from this document right now.",
        );
      }
    } finally {
      setWorkingAction("");
    }
  };

  // Summarize the whole PDF following the user's instruction.
  const handleSummarize = async (event) => {
    event.preventDefault();
    if (!activeDocument || workingAction === "summarize") return;

    setWorkingAction("summarize");
    setError("");
    setSummary(null);

    try {
      setSummary(
        await summarizeDocument(activeDocument.documentId, summaryPrompt.trim()),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not summarize this document right now.",
      );
    } finally {
      setWorkingAction("");
    }
  };

  const handleCopyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setToast("Message copied.");
    } catch {
      setError("Could not copy this message to the clipboard.");
    }
  };

  const handleCopyCodeBlock = async (event) => {
    const code = event.currentTarget.parentElement?.querySelector(
      "pre code",
    )?.textContent;
    if (code == null) return;

    try {
      await navigator.clipboard.writeText(code);
      setToast("Code copied.");
    } catch {
      setError("Could not copy this code block to the clipboard.");
    }
  };

  const handleShareMessage = async (message) => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: activeDocument?.title || "AI answer",
          text: message.content,
        });
        setToast("Answer shared.");
      } else {
        await navigator.clipboard.writeText(message.content);
        setToast("Answer copied. Sharing is not available in this browser.");
      }
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError("Could not share this answer.");
      }
    }
  };

  const handleDeleteChatMessage = async (message) => {
    if (!activeDocument) return;
    const documentId = activeDocument.documentId;

    try {
      const messages = await deleteChatMessage(
        documentId,
        message.messageId,
      );
      if (activeIdRef.current === documentId) {
        setChatMessages(messages);
        setToast("Message deleted.");
      }
    } catch (requestError) {
      if (activeIdRef.current === documentId) {
        setError(
          requestError.response?.data?.message ||
            "Could not delete this message.",
        );
      }
    }
  };

  const handleNewChat = async () => {
    if (!activeDocument || workingAction === "ask") return;
    const documentId = activeDocument.documentId;

    setError("");
    try {
      const messages = await clearChatMessages(documentId);
      if (activeIdRef.current === documentId) {
        setChatMessages(messages);
        setAskQuery("");
        setEditingMessageId(null);
        setEditingDraft("");
        setToast("Chat cleared. Start a new conversation.");
      }
    } catch (requestError) {
      if (activeIdRef.current === documentId) {
        setError(
          requestError.response?.data?.message || "Could not clear this chat.",
        );
      }
    }
  };

  // Download the generated summary as .txt or .md.
  const handleDownloadSummary = (extension) => {
    if (!summary?.summary) return;

    downloadTextFile(summary.summary, activeDocument?.title, extension);
    setToast(`Summary downloaded as .${extension}.`);
  };

  // The custom confirmation panel replaces browser confirmation dialogs.
  const handleDelete = async () => {
    if (!pendingDeleteDoc) return;

    setWorkingAction("delete");
    setError("");

    try {
      await deleteDocument(pendingDeleteDoc.documentId);

      setDocuments((current) =>
        current.filter(
          (document) => document.documentId !== pendingDeleteDoc.documentId,
        ),
      );

      if (activeId === pendingDeleteDoc.documentId) {
        activeIdRef.current = null;
        setActiveId(null);
        setResults([]);
        setChatMessages([]);
        setSummary(null);
        setPreview({ documentId: null, url: "" });
      }

      setPendingDeleteDoc(null);
      setToast("Document deleted from your private library.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not delete this document.",
      );
    } finally {
      setWorkingAction("");
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <span>Knowledge base</span>

        <h1>Private document library</h1>

        <p>
          Upload study or reference PDFs or TXT files to your own workspace.
          Each file is indexed for semantic search, and optional AI answers use
          passages from that document only. File size limits apply on the
          server; other users never see your uploads.
        </p>
      </header>

      {toast && (
        <div className={styles.toast} role="status">
          <CheckCircle2 size={17} />

          {toast}

          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.workspace}>
        <aside className={styles.library} aria-label="Private document library">
          <header className={styles.libraryHeader}>
            <h2>Library</h2>

            <p>
              Add PDF or TXT documents to your library. Files are processed
              automatically after upload. Maximum file size: 10 MB.
            </p>
          </header>

          <div
            aria-label="Drop a PDF or TXT file here, or choose a file"
            className={`${styles.uploadBox} ${
              isDragging ? styles.uploadBoxDragging : ""
            }`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="region"
          >
            <p className={styles.dropHint}>
              Drag and drop a PDF or TXT file here, or choose one below.
            </p>

            <input
              accept=".pdf,.txt"
              disabled={isUploading}
              onChange={handleFileChange}
              ref={fileInput}
              type="file"
            />

            <div className={styles.uploadActions}>
              <button
                className={styles.fileButton}
                disabled={isUploading}
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                <FileText size={16} />
                Choose file
              </button>

              <button
                className={styles.uploadButton}
                disabled={!file || isUploading}
                onClick={handleUpload}
                type="button"
              >
                {isUploading ? (
                  <LoaderCircle className={styles.spin} size={16} />
                ) : (
                  <Upload size={16} />
                )}

                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            <small>{file?.name || "No file selected"}</small>
          </div>

          {isLoading && <p className={styles.muted}>Loading your library...</p>}

          {!isLoading && !documents.length && (
            <p className={styles.muted}>
              Upload a PDF or TXT document to make it available for private
              search and AI answers.
            </p>
          )}

          <div className={styles.documentList}>
            {documents.map((document) => (
              <div
                aria-current={
                  activeId === document.documentId ? "true" : undefined
                }
                className={`${styles.documentCard} ${
                  activeId === document.documentId
                    ? styles.documentCardActive
                    : ""
                }`}
                key={document.documentId}
                onClick={() => handleSelect(document.documentId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(document.documentId);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.documentMeta}>
                  <b className={styles.documentTitle} title={document.title}>
                    {document.title}
                  </b>

                  <div className={styles.badgeWrapper}>
                    <span className={styles[`status${document.status}`]}>
                      {document.status}
                    </span>
                  </div>
                </div>

                <button
                  aria-label={`Delete ${document.title}`}
                  className={styles.deleteButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPendingDeleteDoc(document);
                  }}
                  title="Delete document"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.reader}>
          {!activeDocument && !isLoading && (
            <div className={styles.emptyReader}>
              Choose an uploaded document to open it here. Semantic search and
              Ask with AI will use only the selected document.
            </div>
          )}

          {activeDocument && (
            <>
              <div className={styles.readerTitle}>
                <div>
                  <h2>{activeDocument.title}</h2>

                  <p>
                    Private document reader, semantic search, and
                    source-grounded answers.
                  </p>
                </div>
              </div>

              {activeDocument.status === "processing" && (
                <div className={styles.pending}>
                  <LoaderCircle className={styles.spin} size={20} />
                  Processing this document. The reader will become available
                  automatically.
                </div>
              )}

              {activeDocument.status === "failed" && (
                <div className={styles.failed}>
                  {activeDocument.errorMessage ||
                    "This document could not be processed."}
                </div>
              )}

              {activeDocument.status === "ready" && (
                <>
                  <div
                    aria-label="Document tools"
                    className={styles.tabs}
                    role="tablist"
                  >
                    <button
                      aria-controls="ask-ai-panel"
                      aria-selected={activeTab === "ask"}
                      className={activeTab === "ask" ? styles.activeTab : ""}
                      onClick={() => setActiveTab("ask")}
                      role="tab"
                      type="button"
                    >
                      Ask AI
                    </button>

                    <button
                      aria-controls="semantic-search-panel"
                      aria-selected={activeTab === "search"}
                      className={activeTab === "search" ? styles.activeTab : ""}
                      onClick={() => setActiveTab("search")}
                      role="tab"
                      type="button"
                    >
                      Semantic Search
                    </button>
                    <button
                      aria-controls="summarize-panel"
                      aria-selected={activeTab === "summarize"}
                      className={
                        activeTab === "summarize" ? styles.activeTab : ""
                      }
                      onClick={() => setActiveTab("summarize")}
                      role="tab"
                      type="button"
                    >
                      Summarize
                    </button>
                    <button
                      aria-controls="document-preview-panel"
                      aria-selected={activeTab === "preview"}
                      className={
                        activeTab === "preview" ? styles.activeTab : ""
                      }
                      onClick={() => setActiveTab("preview")}
                      role="tab"
                      type="button"
                    >
                      Preview
                    </button>
                  </div>

                  {activeTab === "preview" && (
                    <section id="document-preview-panel" role="tabpanel">
                      {preview.documentId === activeDocument.documentId &&
                      preview.url ? (
                        <iframe
                          className={styles.preview}
                          src={preview.url}
                          title={`Preview of ${activeDocument.title}`}
                        />
                      ) : (
                        <div className={styles.pending}>
                          <LoaderCircle className={styles.spin} size={20} />
                          Loading document preview...
                        </div>
                      )}
                    </section>
                  )}

                  {activeTab === "search" && (
                    <section
                      className={styles.toolSection}
                      id="semantic-search-panel"
                      role="tabpanel"
                    >
                      <h2>Semantic search</h2>

                      <p>
                        Finds passages by meaning, not only exact
                        keywords.
                      </p>

                      <form onSubmit={handleSemanticSearch}>
                        <label htmlFor="semantic-query">Search query</label>

                        <input
                          id="semantic-query"
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="How does a function work?"
                          value={searchQuery}
                        />

                        <button
                          disabled={
                            workingAction === "search" || !searchQuery.trim()
                          }
                          type="submit"
                        >
                          {workingAction === "search" ? (
                            <LoaderCircle className={styles.spin} size={16} />
                          ) : (
                            <Search size={16} />
                          )}

                          {workingAction === "search"
                            ? "Searching..."
                            : "Search"}
                        </button>
                      </form>

                      <div className={styles.searchResults} aria-live="polite">
                        {results.map((result) => (
                          <article key={result.chunkId}>
                            <b>
                              Chunk {result.chunkIndex + 1} - relevance{" "}
                              {result.score.toFixed(3)}
                            </b>

                            <p>{result.excerpt}</p>
                          </article>
                        ))}

                        {hasSearched && !results.length && (
                          <p className={styles.noResults}>
                            No relevant passages were found in this document.
                            Try a more specific question or a phrase used in the
                            document.
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {activeTab === "summarize" && (
                    <section
                      className={styles.toolSection}
                      id="summarize-panel"
                      role="tabpanel"
                    >
                      <h2>Summarize PDF</h2>
                      <p>
                        Tell the AI how to summarize the whole document, for
                        example its length or format, then download the result.
                      </p>

                      <div className={styles.presetRow}>
                        {SUMMARY_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setSummaryPrompt(preset.prompt)}
                            type="button"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSummarize}>
                        <label htmlFor="summary-prompt">Instructions</label>
                        <textarea
                          id="summary-prompt"
                          maxLength={2000}
                          onChange={(event) =>
                            setSummaryPrompt(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              if (workingAction !== "summarize") {
                                event.currentTarget.form?.requestSubmit();
                              }
                            }
                          }}
                          placeholder="e.g. Summarize this in one page, or in no more than 500 words, or as bullet points"
                          value={summaryPrompt}
                        />
                        <button
                          disabled={workingAction === "summarize"}
                          type="submit"
                        >
                          {workingAction === "summarize" ? (
                            <LoaderCircle className={styles.spin} size={16} />
                          ) : (
                            <Sparkles size={16} />
                          )}
                          {workingAction === "summarize"
                            ? "Summarizing..."
                            : "Summarize"}
                        </button>
                      </form>

                      {summary && (
                        <div
                          className={styles.summaryResult}
                          aria-live="polite"
                        >
                          <div className={styles.summaryHeader}>
                            <b>Summary &middot; {summary.wordCount} words</b>
                            <div className={styles.summaryActions}>
                              <button
                                className={styles.downloadButton}
                                onClick={() => handleDownloadSummary("txt")}
                                type="button"
                              >
                                <Download size={14} />
                                Download .txt
                              </button>
                              <button
                                className={styles.downloadButton}
                                onClick={() => handleDownloadSummary("md")}
                                type="button"
                              >
                                <Download size={14} />
                                Download .md
                              </button>
                            </div>
                          </div>
                          {summary.truncated && (
                            <p className={styles.summaryNote}>
                              This PDF is very long, so only the first part of
                              it was summarized.
                            </p>
                          )}
                          <div className={styles.summaryBody}>
                            <ReactMarkdown>{summary.summary}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {activeTab === "ask" && (
                    <section
                      className={styles.chatSection}
                      id="ask-ai-panel"
                      role="tabpanel"
                    >
                      <header className={styles.chatHeader}>
                        <div>
                          <h2>Ask with AI</h2>
                          <p>
                            Chat with answers grounded in this document.
                            Conversation history is saved to your account.
                          </p>
                        </div>
                        <button
                          className={styles.newChatButton}
                          disabled={
                            !currentChatMessages.length ||
                            isLoadingChat ||
                            workingAction === "ask"
                          }
                          onClick={handleNewChat}
                          type="button"
                        >
                          <MessageSquarePlus size={16} />
                          New Chat
                        </button>
                      </header>

                      <div
                        aria-live="polite"
                        className={styles.chatHistory}
                        onScroll={handleChatHistoryScroll}
                        ref={chatHistory}
                        role="log"
                      >
                        {isLoadingChat && (
                          <div className={styles.chatNotice}>
                            <LoaderCircle
                              className={styles.spin}
                              size={17}
                            />
                            Loading saved conversation...
                          </div>
                        )}

                        {!isLoadingChat && !currentChatMessages.length && (
                          <div className={styles.chatWelcome}>
                            <Sparkles size={20} />
                            <b>Start a conversation</b>
                            <span>
                              Ask a question about this document. You can
                              follow up, and your chat will be here next time.
                            </span>
                          </div>
                        )}

                        {currentChatMessages.map((message) => (
                          <article
                            className={`${styles.chatMessage} ${
                              message.role === "user"
                                ? styles.userMessage
                                : styles.assistantMessage
                            }`}
                            key={message.messageId}
                          >
                            <div className={styles.messageHeading}>
                              <span
                                aria-label={
                                  message.role === "user" ? "You" : "Ask with AI"
                                }
                                className={styles.messageAvatar}
                                role="img"
                              >
                                {message.role === "user" ? (
                                  <UserRound aria-hidden="true" size={15} />
                                ) : (
                                  <Sparkles aria-hidden="true" size={15} />
                                )}
                              </span>
                            </div>

                            {editingMessageId === message.messageId ? (
                              <form
                                className={styles.editMessageForm}
                                onSubmit={(event) =>
                                  handleAsk(
                                    event,
                                    editingDraft,
                                    message.messageId,
                                  )
                                }
                              >
                                <textarea
                                  aria-label="Edit your question"
                                  maxLength={2000}
                                  onChange={(event) =>
                                    setEditingDraft(event.target.value)
                                  }
                                  value={editingDraft}
                                />
                                <div>
                                  <button
                                    disabled={
                                      workingAction === "ask" ||
                                      !editingDraft.trim()
                                    }
                                    type="submit"
                                  >
                                    {workingAction === "ask" ? (
                                      <LoaderCircle
                                        className={styles.spin}
                                        size={15}
                                      />
                                    ) : (
                                      <Send size={15} />
                                    )}
                                    Update and regenerate
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditingDraft("");
                                    }}
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : message.role === "assistant" ? (
                              <div className={styles.markdownBody}>
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[
                                    [rehypeHighlight, { detect: true }],
                                  ]}
                                  components={{
                                    pre: ({ children }) => (
                                      <div className={styles.codeBlock}>
                                        <button
                                          aria-label="Copy code block"
                                          className={styles.copyCodeButton}
                                          onClick={handleCopyCodeBlock}
                                          title="Copy code"
                                          type="button"
                                        >
                                          <Copy aria-hidden="true" size={13} />
                                          <span>Copy</span>
                                        </button>
                                        <pre>{children}</pre>
                                      </div>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className={styles.userMessageBody}>
                                {message.content}
                              </p>
                            )}

                            {editingMessageId !== message.messageId && (
                              <div className={styles.messageActions}>
                                <button
                                  aria-label="Copy message"
                                  onClick={() => handleCopyMessage(message)}
                                  title="Copy message"
                                  type="button"
                                >
                                  <Copy size={14} />
                                </button>
                                <details className={styles.messageMenu}>
                                  <summary aria-label="More message actions">
                                    <MoreHorizontal size={17} />
                                  </summary>
                                  <div>
                                    {message.role === "user" && (
                                      <button
                                        onClick={(event) => {
                                          event.currentTarget.closest(
                                            "details",
                                          ).open = false;
                                          setEditingMessageId(
                                            message.messageId,
                                          );
                                          setEditingDraft(message.content);
                                        }}
                                        type="button"
                                      >
                                        <Pencil size={14} />
                                        Edit
                                      </button>
                                    )}
                                    {message.role === "assistant" && (
                                      <button
                                        onClick={(event) => {
                                          event.currentTarget.closest(
                                            "details",
                                          ).open = false;
                                          handleShareMessage(message);
                                        }}
                                        type="button"
                                      >
                                        <Share2 size={14} />
                                        Share
                                      </button>
                                    )}
                                    <button
                                      onClick={(event) => {
                                        event.currentTarget.closest(
                                          "details",
                                        ).open = false;
                                        handleDeleteChatMessage(message);
                                      }}
                                      type="button"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  </div>
                                </details>
                              </div>
                            )}

                            {message.role === "assistant" &&
                              message.citations?.length > 0 && (
                                <details className={styles.sourceDetails}>
                                  <summary>
                                    Sources ({message.citations.length})
                                    <ChevronDown size={14} />
                                  </summary>
                                  <ol>
                                    {message.citations.map((citation) => {
                                      const sourcePages = formatSourcePages(
                                        citation.pageNumbers,
                                      );

                                      return (
                                        <li key={citation.ref}>
                                          <strong>
                                            {citation.sourceTitle ||
                                              activeDocument.title}
                                          </strong>
                                          <p className={styles.sourceExcerpt}>
                                            {sourcePages && (
                                              <>
                                                <strong>{sourcePages}</strong>
                                                <span aria-hidden="true">
                                                  {" · "}
                                                </span>
                                              </>
                                            )}
                                            {citation.excerpt ||
                                              "Relevant passage unavailable."}
                                          </p>
                                        </li>
                                      );
                                    })}
                                  </ol>
                                </details>
                              )}
                          </article>
                        ))}

                        {isAsking && (
                          <div className={styles.chatNotice}>
                            <LoaderCircle
                              className={styles.spin}
                              size={17}
                            />
                            Thinking...
                          </div>
                        )}
                      </div>

                      <form
                        className={styles.chatComposer}
                        onSubmit={handleAsk}
                      >
                        <div className={styles.composerInput}>
                          <textarea
                            id="ask-query"
                            aria-label="Message"
                            maxLength={2000}
                            ref={chatInput}
                            onChange={(event) => {
                              setAskQuery(event.target.value);
                              resizeChatInput(event.currentTarget);
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                !event.shiftKey &&
                                !event.nativeEvent.isComposing
                              ) {
                                event.preventDefault();
                                if (
                                  askQuery.trim() &&
                                  workingAction !== "ask"
                                ) {
                                  event.currentTarget.form?.requestSubmit();
                                }
                              }
                            }}
                            placeholder="Ask a question or follow up..."
                            value={askQuery}
                          />
                          <button
                            aria-label="Send message"
                            title={
                              workingAction === "ask" ? "Thinking..." : "Send"
                            }
                            disabled={
                              workingAction === "ask" ||
                              isLoadingChat ||
                              !askQuery.trim()
                            }
                            type="submit"
                          >
                            {workingAction === "ask" ? (
                              <LoaderCircle
                                className={styles.spin}
                                size={16}
                              />
                            ) : (
                              <ArrowUp size={17} />
                            )}
                          </button>
                        </div>
                        <div className={styles.composerFooter}>
                          <span>Enter to send · Shift+Enter for a new line</span>
                        </div>
                      </form>
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>

      {pendingDeleteDoc && (
        <div className={styles.modalBackdrop} role="presentation">
          <section
            aria-describedby="delete-document-copy"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <h2>Delete this document?</h2>

            <p id="delete-document-copy">
              “{pendingDeleteDoc.title}” and its private search index will be
              permanently removed.
            </p>

            <div>
              <button
                disabled={workingAction === "delete"}
                onClick={() => setPendingDeleteDoc(null)}
                type="button"
              >
                Cancel
              </button>

              <button
                disabled={workingAction === "delete"}
                onClick={handleDelete}
                type="button"
              >
                {workingAction === "delete" ? "Deleting..." : "Delete document"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default RagDocuments;
