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

  // Switching documents clears outputs that belong to the previous PDF.
  const handleSelect = (documentId) => {
    setActiveId(documentId);
    setSearchQuery("");
    setAskQuery("");
    setResults([]);
    setAnswer(null);
    setError("");
  };

  // Run semantic retrieval independently from the grounded-answer form.
  const handleSemanticSearch = async (event) => {
    event.preventDefault();
    if (!activeDocument || !searchQuery.trim()) return;

    setWorkingAction("search");
    setError("");

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

  // Ask the server for a PDF-grounded answer with passage citations.
  const handleAsk = async (event) => {
    event.preventDefault();
    if (!activeDocument || !askQuery.trim()) return;

    setWorkingAction("ask");
    setError("");

    try {
      setAnswer(
        await askDocument(activeDocument.documentId, askQuery.trim()),
      );
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
    if (!activeDocument) return;

    setWorkingAction("delete");
    setError("");

    try {
      await deleteDocument(activeDocument.documentId);
      setDocuments((current) =>
        current.filter(
          (document) => document.documentId !== activeDocument.documentId,
        ),
      );
      setActiveId(null);
      setResults([]);
      setAnswer(null);
      setPendingDelete(false);
      setToast("Document deleted from your private library.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete this PDF.",
      );
    } finally {
      setWorkingAction("");
    }
  };

  return (
    <section className={styles.page}>
      {toast && (
        <div className={styles.toast} role="status">
          <CheckCircle2 size={17} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast("")} type="button">
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
        <aside className={styles.library} aria-label="Private PDF library">
          <div className={styles.uploadBox}>
            <p>Accepted format: PDF. Maximum file size is enforced by the server.</p>
            <input
              accept="application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
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
                {isUploading ? <LoaderCircle className={styles.spin} size={16} /> : <Upload size={16} />}
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <small>{file?.name || "No file selected"}</small>
          </div>

          {isLoading && <p className={styles.muted}>Loading your library...</p>}
          {!isLoading && !documents.length && (
            <p className={styles.muted}>
              Upload a PDF to make it available for private search and AI answers.
            </p>
          )}

          <div className={styles.documentList}>
            {documents.map((document) => (
              <button
                aria-current={activeId === document.documentId ? "true" : undefined}
                className={`${styles.documentItem} ${
                  activeId === document.documentId ? styles.documentActive : ""
                }`}
                key={document.documentId}
                onClick={() => handleSelect(document.documentId)}
                type="button"
              >
                <FileText size={17} />
                <span>
                  <b>{document.title}</b>
                  <small>
                    {document.byteSize ? formatBytes(document.byteSize) : "PDF"}
                  </small>
                </span>
                <i className={styles[`status${document.status}`]}>
                  {document.status}
                </i>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.reader}>
          {!activeDocument && !isLoading && (
            <div className={styles.emptyReader}>
              Choose an uploaded PDF to open it here. Semantic search and Ask with AI will use only the selected document.
            </div>
          )}

          {activeDocument?.status === "processing" && (
            <div className={styles.pending}>
              <LoaderCircle className={styles.spin} size={21} />
              Processing this PDF. The reader will become available automatically.
            </div>
          )}

          {activeDocument?.status === "failed" && (
            <div className={styles.failed}>
              {activeDocument.errorMessage || "This PDF could not be read."} Upload a text-based PDF and try again.
            </div>
          )}

          {activeDocument?.status === "ready" && (
            <>
              <div className={styles.readerTitle}>
                <div>
                  <h2>{activeDocument.title}</h2>
                  <p>Private document reader, semantic search, and source-grounded answers.</p>
                </div>
                <button
                  aria-label={`Delete ${activeDocument.title}`}
                  className={styles.deleteDocument}
                  disabled={workingAction === "delete"}
                  onClick={() => setPendingDelete(true)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {previewUrl ? (
                <iframe
                  className={styles.preview}
                  src={previewUrl}
                  title={`Preview of ${activeDocument.title}`}
                />
              ) : (
                <div className={styles.pending}>
                  <LoaderCircle className={styles.spin} size={20} />
                  Loading PDF preview...
                </div>
              )}
              <section className={styles.toolSection}>
                <h2>Semantic search</h2>
                <p>Finds passages by meaning (embeddings), not only exact keywords.</p>
                <form onSubmit={handleSemanticSearch}>
                  <label htmlFor="semantic-query">Search query</label>
                  <input
                    id="semantic-query"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="How does a function work?"
                    value={searchQuery}
                  />
                  <button disabled={workingAction === "search" || !searchQuery.trim()} type="submit">
                    {workingAction === "search" ? <LoaderCircle className={styles.spin} size={16} /> : <Search size={16} />}
                    {workingAction === "search" ? "Searching..." : "Search"}
                  </button>
                </form>

                <div className={styles.searchResults} aria-live="polite">
                  {results.map((result) => (
                    <article key={result.chunkId}>
                      <b>
                        Chunk {result.chunkIndex + 1} - relevance {result.score.toFixed(3)}
                      </b>
                      <p>{result.excerpt}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className={styles.toolSection}>
                <h2>Ask with AI</h2>
                <p>
                  Answers only use retrieved excerpts from this PDF and include source references when evidence exists.
                </p>
                <form onSubmit={handleAsk}>
                  <label htmlFor="ask-query">Question</label>
                  <textarea
                    id="ask-query"
                    onChange={(event) => setAskQuery(event.target.value)}
                    placeholder="Ask a clear question about this document"
                    value={askQuery}
                  />
                  <button disabled={workingAction === "ask" || !askQuery.trim()} type="submit">
                    {workingAction === "ask" ? <LoaderCircle className={styles.spin} size={16} /> : <Sparkles size={16} />}
                    {workingAction === "ask" ? "Asking..." : "Ask"}
                  </button>
                </form>

                {answer && (
                  <div className={styles.answer} aria-live="polite">
                    <p>{answer.answer}</p>
                    {answer.citations?.length > 0 && (
                      <>
                        <h3>Source references</h3>
                        <div className={styles.citations}>
                          {answer.citations.map((citation) => (
                            <article key={citation.ref}>
                              <b>[{citation.ref}] Passage {citation.chunkIndex + 1}</b>
                              <p>{citation.excerpt}</p>
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </div>

      {/* DELETE_MODAL */}
    </section>
  );
};

export default RagDocuments;