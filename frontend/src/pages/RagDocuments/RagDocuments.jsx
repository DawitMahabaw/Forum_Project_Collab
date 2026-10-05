// ============================================================
// KNOWLEDGE BASE / RAG DOCUMENTS PAGE
// ============================================================
//
// Private document library with semantic search,
// Ask with AI, and PDF preview.
//

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
  uploadDocument,
} from "../../services/ragService.js";

import styles from "./RagDocuments.module.css";

const getSelectedDocument = (candidate) => {
  if (!candidate) return null;

  const isPdf =
    candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);

  const isText =
    candidate.type === "text/plain" || /\.txt$/i.test(candidate.name);

  return isPdf || isText ? candidate : null;
};

const RagDocuments = () => {
  // A ref lets the visible "Choose file" button open the hidden native input.
  const fileInput = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState("ask");
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [askQuery, setAskQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [preview, setPreview] = useState({
    documentId: null,
    url: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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

  // Keep every in-progress upload current.
  useEffect(() => {
    if (!hasProcessingDocuments) return undefined;

    const timer = window.setInterval(
      () => loadDocuments({ quiet: true }),
      2500,
    );

    return () => window.clearInterval(timer);
  }, [hasProcessingDocuments, loadDocuments]);

  // The built-in PDF viewer supplies the reader controls shown in the design.
  useEffect(() => {
    let isCurrent = true;
    let objectUrl = "";

    // TXT documents do not use the PDF preview.
    if (
      !activeDocumentId ||
      activeDocumentStatus !== "ready" ||
      activeTab !== "preview" ||
      activeDocument?.mimeType !== "application/pdf"
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
      .catch(() => setError("Could not load the PDF preview."));

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
      setActiveId(document.documentId);
      setActiveTab("ask");

      setFile(null);
      setResults([]);
      setHasSearched(false);
      setAnswer(null);
      setSearchQuery("");
      setAskQuery("");

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    const document = getSelectedDocument(selectedFile);

    if (selectedFile && !document) {
      setFile(null);
      setError("Please choose a PDF or TXT file.");
      event.target.value = "";
      return;
    }

    setFile(document);
    setError("");
  };

  // Switching documents clears outputs that belong to the previous document.
  const handleSelect = (documentId) => {
    setActiveId(documentId);
    setActiveTab("ask");
    setSearchQuery("");
    setAskQuery("");
    setResults([]);
    setHasSearched(false);
    setAnswer(null);
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
  const handleAsk = async (event) => {
    event.preventDefault();

    if (!activeDocument || !askQuery.trim() || workingAction === "ask") {
      return;
    }

    setWorkingAction("ask");
    setError("");

    try {
      setAnswer(await askDocument(activeDocument.documentId, askQuery.trim()));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not answer from this document right now.",
      );
    } finally {
      setWorkingAction("");
    }
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
        setActiveId(null);
        setResults([]);
        setAnswer(null);
        setPreview({
          documentId: null,
          url: "",
        });
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
              Add PDF or TXT documents here. Processing starts automatically
              after each upload.
            </p>
          </header>

          <div className={styles.uploadBox}>
            <p>
              Accepted formats: PDF and TXT. Maximum file size is enforced by
              the server.
            </p>

            <input
              accept=".pdf,.txt"
              onChange={handleFileChange}
              ref={fileInput}
              type="file"
            />

            <div className={styles.uploadActions}>
              <button
                className={styles.fileButton}
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

                    {activeDocument.mimeType === "application/pdf" && (
                      <button
                        aria-controls="pdf-preview-panel"
                        aria-selected={activeTab === "preview"}
                        className={
                          activeTab === "preview" ? styles.activeTab : ""
                        }
                        onClick={() => setActiveTab("preview")}
                        role="tab"
                        type="button"
                      >
                        PDF Preview
                      </button>
                    )}
                  </div>

                  {activeTab === "preview" &&
                    activeDocument.mimeType === "application/pdf" && (
                      <section id="pdf-preview-panel" role="tabpanel">
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
                            Loading PDF preview...
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
                        Finds passages by meaning (embeddings), not only exact
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

                  {activeTab === "ask" && (
                    <section
                      className={styles.toolSection}
                      id="ask-ai-panel"
                      role="tabpanel"
                    >
                      <h2>Ask with AI</h2>

                      <p>
                        Answers only use retrieved excerpts from this document
                        and include source references when evidence exists.
                      </p>

                      <form onSubmit={handleAsk}>
                        <label htmlFor="ask-query">Question</label>

                        <textarea
                          id="ask-query"
                          onChange={(event) => setAskQuery(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();

                              if (askQuery.trim() && workingAction !== "ask") {
                                event.currentTarget.form?.requestSubmit();
                              }
                            }
                          }}
                          placeholder="Ask a clear question about this document"
                          value={askQuery}
                        />

                        <button
                          disabled={workingAction === "ask" || !askQuery.trim()}
                          type="submit"
                        >
                          {workingAction === "ask" ? (
                            <LoaderCircle className={styles.spin} size={16} />
                          ) : (
                            <Sparkles size={16} />
                          )}

                          {workingAction === "ask" ? "Asking..." : "Ask"}
                        </button>
                      </form>

                      {answer && (
                        <div className={styles.answer} aria-live="polite">
                          <p>{answer.answer}</p>

                          {answer.citations?.length > 0 && (
                            <footer className={styles.sourceReferences}>
                              <span>Source references:</span>

                              <div>
                                {answer.citations.map((citation) => (
                                  <span
                                    aria-label={`Reference ${citation.ref}, chunk ${
                                      citation.chunkIndex + 1
                                    }`}
                                    key={citation.ref}
                                  >
                                    [{citation.ref}] &rarr; chunk{" "}
                                    {citation.chunkIndex + 1}
                                  </span>
                                ))}
                              </div>
                            </footer>
                          )}
                        </div>
                      )}
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
