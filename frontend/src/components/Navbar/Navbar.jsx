import { LogOut, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { searchQuestions } from "../../services/questionService.js";
import styles from "./Navbar.module.css";

const getQuestionList = (response) => {
  if (Array.isArray(response)) return response;

  return response?.questions || response?.data || [];
};

const getQuestionId = (question) =>
  question.questionHash ||
  question.question_hash ||
  question.questionId ||
  question.question_id ||
  question.id;

const getReplyCount = (question) =>
  question.answerCount ?? question.answer_count ?? question.replies ?? 0;

const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const searchTerm = searchParams.get("search") || "";
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 3) {
      return undefined;
    }

    let isCurrent = true;
    const searchTimer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await searchQuestions(query);

        if (isCurrent) setSuggestions(getQuestionList(response).slice(0, 5));
      } catch {
        // The dashboard owns the visible error state. A failed suggestion
        // request should not block someone from continuing to search.
        if (isCurrent) setSuggestions([]);
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(searchTimer);
    };
  }, [searchTerm]);

  const updateSearchParam = (value, aiSearch = false) => {
    const nextParams = new URLSearchParams(searchParams);
    const query = value.trim();

    if (query) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    if (aiSearch && query.length >= 3) {
      nextParams.set("mode", "ai");
    } else {
      nextParams.delete("mode");
    }

    setSearchParams(nextParams);
  };

  const handleSearch = (event) => {
    const value = event.target.value;

    if (value.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
    } else {
      setSuggestions([]);
      setIsSearching(true);
    }

    updateSearchParam(value);
  };

  const handleAiSearch = () => {
    updateSearchParam(searchTerm, true);
    setIsSearchFocused(false);
  };

  const handleSuggestionSelect = (question) => {
    const questionId = getQuestionId(question);

    if (questionId) navigate(`/questions/${questionId}`);
    setIsSearchFocused(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  const showAiSearch = searchTerm.trim().length >= 3;
  const showSuggestions = isSearchFocused && showAiSearch;

  return (
    <header className={styles.navbar}>
      <div className={styles.titleBlock}>
        <h1>Home</h1>
        <p>Browse the feed, search by keyword, or run AI similarity search.</p>
      </div>

      <div className={styles.searchArea}>
        <div
          className={`${styles.search} ${
            showAiSearch ? styles.searchWithAi : ""
          }`}
        >
          <Search size={10} strokeWidth={2} aria-hidden="true" />

          <input
            type="search"
            value={searchTerm}
            placeholder="Search questions by keyword..."
            aria-label="Search questions by keyword"
            onChange={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
          />

          {showAiSearch && (
            <button
              type="button"
              className={styles.aiSearchButton}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleAiSearch}
            >
              <Sparkles size={16} aria-hidden="true" />
              AI Search
            </button>
          )}
        </div>

        {showSuggestions && (
          <div className={styles.suggestions} role="listbox">
            {isSearching && (
              <p className={styles.suggestionState}>Searching questions...</p>
            )}

            {!isSearching && suggestions.length === 0 && (
              <p className={styles.suggestionState}>No matching questions.</p>
            )}

            {!isSearching &&
              suggestions.map((question) => (
                <button
                  key={getQuestionId(question)}
                  type="button"
                  className={styles.suggestion}
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionSelect(question)}
                >
                  <strong>{question.title}</strong>
                  <span>{getReplyCount(question)} replies</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className={styles.userSection}>
        <span className={styles.userName}>
          {user?.firstName} {user?.lastName}
        </span>

        <div className={styles.avatar}>{getInitials()}</div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
