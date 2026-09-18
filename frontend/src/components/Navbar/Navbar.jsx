import { LogOut, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { listQuestions } from "../../services/questionService.js";
import styles from "./Navbar.module.css";

const pageCopy = {
  "/dashboard": [
    "Home",
    "Browse the feed, search by keyword, or run AI similarity search.",
  ],
  "/my-questions": [
    "Your topics",
    "Questions you have posted. Open any thread to read replies or edit context.",
  ],
  "/questions/ask": [
    "Ask a question",
    "A clear title and reproducible steps get faster, more accurate answers.",
  ],
  "/rag-documents": [
    "Knowledge base",
    "Private PDF library: reader, semantic search, and AI answers with citations per document.",
  ],
};

const getInitials = (user) =>
  `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
  "U";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [heading, description] = pageCopy[pathname] || [
    "Discussion",
    "Read the thread, review related topics, and reply if you can help.",
  ];
  const canUseAiSearch = query.trim().length >= 3;

  // Fetch fast keyword suggestions while the user types. The
  // debounce prevents a network request for every key press and
  // the `active` guard prevents an older response replacing a
  // newer query's result list.
  useEffect(() => {
    const searchTerm = query.trim();

    if (!searchTerm) {
      setSuggestions([]);
      setIsSearching(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const data = await listQuestions({ search: searchTerm });
        if (active) setSuggestions(data.questions.slice(0, 5));
      } catch {
        // A suggestion failure must never prevent normal search
        // submission, so the full dashboard remains the fallback.
        if (active) setSuggestions([]);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const navigateToSearch = (mode) => {
    const text = query.trim();
    if (!text) return;
    setSuggestions([]);
    navigate(`/dashboard?keyword=${encodeURIComponent(text)}&mode=${mode}`);
  };

  const openSuggestion = (questionHash) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/questions/${questionHash}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigateToSearch("keyword");
  };

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.homeTitleText}>{heading}</h1>
        <p>{description}</p>
      </div>
      <form
        className={`${styles.searchForm} ${canUseAiSearch ? styles.searchFormReady : ""}`}
        onSubmit={handleSubmit}
      >
        <Search aria-hidden="true" className={styles.searchIcon} size={18} />
        <input
          aria-label="Search questions"
          className={styles.searchInput}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions by keyword..."
          value={query}
        />
        {canUseAiSearch && (
          <button
            className={styles.aiSearchButton}
            onClick={() => navigateToSearch("semantic")}
            type="button"
          >
            <Sparkles aria-hidden="true" size={15} />
            AI Search
          </button>
        )}
        {(isSearching || suggestions.length > 0) && (
          <div className={styles.suggestions} role="listbox">
            {isSearching && <p>Searching discussions…</p>}
            {!isSearching &&
              suggestions.map((question) => (
                <button
                  key={question.questionHash}
                  onClick={() => openSuggestion(question.questionHash)}
                  type="button"
                >
                  <b>{question.title}</b>
                  <small>
                    {question.answerCount || 0} {question.answerCount === 1 ? "reply" : "replies"}
                  </small>
                </button>
              ))}
          </div>
        )}
      </form>
      <div className={styles.userSection}>
        <span className={styles.userName}>
          {user?.firstName} {user?.lastName}
        </span>
        <span className={styles.avatar}>{getInitials(user)}</span>
        <button
          aria-label="Log out"
          className={styles.logoutButton}
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
