import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { askDocument, searchDocument } from "../../services/ragService.js";
import styles from "./RagDocuments.module.css";

const RagDocuments = () => {
  // ============================================================
  // SELECTED DOCUMENT
  // ============================================================

  // This will eventually be provided by the document sidebar
  // built by Zelalem.
  const [selectedDocument, setSelectedDocument] = useState(null);

  // ============================================================
  // SEMANTIC SEARCH STATE
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // ============================================================
  // ASK AI STATE
  // ============================================================

  const [askQuery, setAskQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState("");

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

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const data = await searchDocument(
        selectedDocument.documentId,
        searchQuery.trim(),
      );

      setSearchResults(data.results || []);
    } catch (error) {
      setSearchError(
        error.response?.data?.message ||
          "Could not search this document right now.",
      );
    } finally {
      setIsSearching(false);
    }
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

    setIsAsking(true);
    setAskError("");
    setAnswer(null);

    try {
      const data = await askDocument(
        selectedDocument.documentId,
        askQuery.trim(),
      );

      setAnswer(data);
    } catch (error) {
      setAskError(
        error.response?.data?.message ||
          "Could not answer from this document right now.",
      );
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
            <form onSubmit={handleSemanticSearch}>
              <label htmlFor="semantic-search">Search this document</label>

              <input
                id="semantic-search"
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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
              searchQuery.trim() &&
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
