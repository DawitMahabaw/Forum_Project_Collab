import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { askDocument, searchDocument } from "../../services/ragService.js";
import styles from "./RagDocuments.module.css";

// Document selection is owned by the sidebar/page integration. This component
// only consumes the selected document when running its two RAG tools.
const RagDocuments = ({ selectedDocument = null }) => {
  // ============================================================
  // SELECTED DOCUMENT
  // ============================================================

  // SEMANTIC SEARCH STATE
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOutcome, setSearchOutcome] = useState({
    documentId: null,
    error: "",
    hasSearched: false,
    query: "",
    results: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  // ============================================================
  // ASK AI STATE
  // ============================================================

  const [askQuery, setAskQuery] = useState("");
  const [askOutcome, setAskOutcome] = useState({
    answer: null,
    documentId: null,
    error: "",
  });
  const [isAsking, setIsAsking] = useState(false);
  const selectedDocumentId = selectedDocument?.documentId;
  const isCurrentSearchOutcome =
    searchOutcome.documentId === selectedDocumentId &&
    searchOutcome.query === searchQuery.trim();
  const searchResults = isCurrentSearchOutcome ? searchOutcome.results : [];
  const searchError = isCurrentSearchOutcome ? searchOutcome.error : "";
  const hasSearched =
    isCurrentSearchOutcome && searchOutcome.hasSearched;
  const answer =
    askOutcome.documentId === selectedDocumentId ? askOutcome.answer : null;
  const askError =
    askOutcome.documentId === selectedDocumentId ? askOutcome.error : "";

  // ============================================================
  // SEMANTIC SEARCH
  // ============================================================

  const handleSemanticSearch = async (event) => {
    event.preventDefault();

    // A search requires both a selected document
    // and a search query.
    if (!selectedDocument || !searchQuery.trim()) {
      return;
    }

    const documentId = selectedDocument.documentId;
    const query = searchQuery.trim();

    setIsSearching(true);
    setSearchOutcome({
      documentId,
      error: "",
      hasSearched: false,
      query,
      results: [],
    });

    try {
      const data = await searchDocument(
        documentId,
        query,
      );

      setSearchOutcome({
        documentId,
        error: "",
        hasSearched: true,
        query,
        results: Array.isArray(data?.results) ? data.results : [],
      });
    } catch (error) {
      setSearchOutcome({
        documentId,
        error:
          error.response?.data?.message ||
          "Could not search this document right now.",
        hasSearched: true,
        query,
        results: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // ============================================================
  // ASK AI
  // ============================================================

  const handleAsk = async (event) => {
    event.preventDefault();

    // An AI question requires both a selected document
    // and a question.
    if (!selectedDocument || !askQuery.trim()) {
      return;
    }

    const documentId = selectedDocument.documentId;

    setIsAsking(true);
    setAskOutcome({ answer: null, documentId, error: "" });

    try {
      const data = await askDocument(
        documentId,
        askQuery.trim(),
      );

      setAskOutcome({ answer: data || {}, documentId, error: "" });
    } catch (error) {
      setAskOutcome({
        answer: null,
        documentId,
        error:
          error.response?.data?.message ||
          "Could not answer from this document right now.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className={styles.page}>
      {/* ========================================================
          SEMANTIC SEARCH
          ======================================================== */}

      <div className={styles.toolSection}>
        <h2>
          <Search size={18} />
          Semantic Search
        </h2>

        <p>
          Find relevant passages in the selected PDF by meaning, not only exact
          keywords.
        </p>

        {!selectedDocument ? (
          <div className={styles.emptyState}>
            Select a document to search its contents.
          </div>
        ) : (
          <>
            <p className={styles.selectedDocument}>
              Searching: <strong>{selectedDocument.title || "Selected PDF"}</strong>
            </p>

            <form onSubmit={handleSemanticSearch}>
              <label htmlFor="semantic-search">Search this document</label>

              <input
                id="semantic-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchQueryChange}
                placeholder="Search by meaning..."
              />

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
              >
                <Search size={15} />

                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchError && (
              <div className={styles.error} role="alert">
                {searchError}
              </div>
            )}

            {!isSearching &&
              hasSearched &&
              searchResults.length === 0 &&
              !searchError && (
                <div className={styles.emptyState}>
                  No relevant passages were found.
                </div>
              )}

            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((result) => (
                  <article key={result.chunkId}>
                    <b>
                      Chunk {(result.chunkIndex ?? 0) + 1}
                      {typeof result.score === "number" &&
                        ` • Relevance ${result.score.toFixed(3)}`}
                    </b>

                    <p>{result.excerpt}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          ASK AI
          ======================================================== */}

      <div className={styles.toolSection}>
        <h2>
          <Sparkles size={18} />
          Ask AI
        </h2>

        <p>
          Ask a question about the selected PDF. The answer is grounded in
          information retrieved from the document.
        </p>

        {!selectedDocument ? (
          <div className={styles.emptyState}>
            Select a document to ask AI about its contents.
          </div>
        ) : (
          <>
            <p className={styles.selectedDocument}>
              Asking about: <strong>{selectedDocument.title || "Selected PDF"}</strong>
            </p>

            <form onSubmit={handleAsk}>
              <label htmlFor="ask-document">Ask a question</label>

              <textarea
                id="ask-document"
                value={askQuery}
                onChange={(event) => setAskQuery(event.target.value)}
                placeholder="What would you like to know about this document?"
              />

              <button type="submit" disabled={isAsking || !askQuery.trim()}>
                <Sparkles size={15} />

                {isAsking ? "Thinking..." : "Ask AI"}
              </button>
            </form>

            {askError && (
              <div className={styles.error} role="alert">
                {askError}
              </div>
            )}

            {answer && (
              <div className={styles.answer} aria-live="polite">
                {answer.isGrounded === false && (
                  <p className={styles.noContext}>
                    No supporting passages were found for this question.
                  </p>
                )}

                {answer.answer ? (
                  <p>{answer.answer}</p>
                ) : (
                  <p>No answer could be generated from this document.</p>
                )}

                {answer.citations?.length > 0 && (
                  <>
                    <h3>Source references</h3>

                    <div className={styles.citations}>
                      {answer.citations.map((citation) => (
                        <article key={citation.ref}>
                          <b>
                            [{citation.ref}] Passage{" "}
                            {(citation.chunkIndex ?? 0) + 1}
                          </b>

                          <p>{citation.excerpt}</p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RagDocuments;
