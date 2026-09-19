import { Search } from "lucide-react";
import { useState } from "react";
import { searchDocument } from "../../services/ragService.js";
import styles from "./RagDocuments.module.css";

const RagDocuments = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSemanticSearch = async (event) => {
    event.preventDefault();

    if (!selectedDocument || !searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchError("");

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
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.toolSection}>
        <h2>Semantic Search</h2>

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
    </section>
  );
};

export default RagDocuments;
