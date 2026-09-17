// Request optional AI feedback before submitting an answer.
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Code2,
  Italic,
  Link2,
  MessageSquare,
  Pencil,
  Send,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import MarkdownContent from "../../components/MarkdownContent/MarkdownContent.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createAnswer,
  deleteAnswer,
  updateAnswer,
} from "../../services/answerService.js";
import {
  deleteQuestion,
  getAnswerFit,
  getQuestion,
  getSimilarQuestions,
  updateQuestion,
} from "../../services/questionService.js";
import styles from "./QuestionDetail.module.css";

const getInitials = (author) =>
  `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`.toUpperCase() ||
  "?";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formattingActions = [
  {
    label: "Bold",
    icon: Bold,
    before: "**",
    after: "**",
    placeholder: "bold text",
  },
  {
    label: "Italic",
    icon: Italic,
    before: "*",
    after: "*",
    placeholder: "italic text",
  },
  {
    label: "Code block",
    icon: Code2,
    before: "\n```\n",
    after: "\n```\n",
    placeholder: "code",
  },
  {
    label: "Insert link",
    icon: Link2,
    before: "[",
    after: "](https://example.com)",
    placeholder: "link text",
  },
];

const MarkdownEditor = ({
  ariaLabel,
  inputRef,
  minLength,
  onChange,
  placeholder,
  value,
}) => {
  // Insert Markdown around selected text while preserving the selection.
  const applyFormatting = ({
    before,
    after,
    placeholder: selectedFallback,
  }) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end) || selectedFallback;
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + before.length;
      textarea.setSelectionRange(
        selectionStart,
        selectionStart + selectedText.length,
      );
    });
  };

  return (
    <div className={styles.editor}>
      <div
        aria-label={`${ariaLabel} formatting options`}
        className={styles.editorToolbar}
      >
        {formattingActions.map(({ label, icon: Icon, ...format }) => (
          <button
            aria-label={label}
            className={styles.formatButton}
            key={label}
            onMouseDown={(event) => {
              event.preventDefault();
              applyFormatting(format);
            }}
            title={label}
            type="button"
          >
            <Icon size={16} />
          </button>
        ))}
        <span>
          {value.length} characters {minLength ? `(minimum ${minLength})` : ""}
        </span>
      </div>
      <textarea
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        value={value}
      />
    </div>
  );
};

const QuestionDetail = () => {
  const { questionHash } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [questionDraft, setQuestionDraft] = useState(null);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [fit, setFit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingFit, setIsCheckingFit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [toast, setToast] = useState("");
  const answerTextareaRef = useRef(null);
  const questionEditTextareaRef = useRef(null);
  const answerEditTextareaRef = useRef(null);

  // Fetch the thread and its answers from the backend.
  const loadDiscussion = async () => {
    const data = await getQuestion(questionHash);
    setQuestion(data.question);
    setAnswers(data.answers);
  };

  // Fetch the discussion and optional semantic recommendations on route change.
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        await loadDiscussion();
        try {
          const related = await getSimilarQuestions(questionHash);
          setSimilarQuestions(related.results);
        } catch {
          // Related topics are helpful, but must not block the discussion itself.
          setSimilarQuestions([]);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Question not found.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [questionHash]);

  // Auto-dismiss successful-action notifications without using browser alerts.
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const copyTextToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fall through to the manual copy fallback if the browser blocks
      // clipboard access for this page or context.
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-9999px";
    helper.style.left = "-9999px";

    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    helper.setSelectionRange(0, helper.value.length);

    let didCopy = false;
    try {
      didCopy = document.execCommand("copy");
    } catch {
      didCopy = false;
    } finally {
      document.body.removeChild(helper);
    }

    if (!didCopy) {
      throw new Error("Copy command failed.");
    }
  };

  // Copy the current question text so it can be pasted elsewhere.
  const handleShareQuestion = async () => {
    if (!question) return;

    const shareText = `${question.title}\n\n${question.content}\n\n${window.location.href}`;

    try {
      await copyTextToClipboard(shareText);
      setToast("Question copied to clipboard.");
    } catch {
      setToast("Copy failed. Please select and copy manually.");
    }
  };

  // Ask for optional feedback before an answer is posted.
  const handleCheckFit = async () => {
    if (answerText.trim().length < 20) {
      setAnswerError("Write at least 20 characters before checking answer fit.");
      return;
    }
    setAnswerError("");
    setIsCheckingFit(true);

    try {
      setFit(await getAnswerFit(questionHash, answerText.trim()));
    } catch (requestError) {
      setAnswerError(
        requestError.response?.data?.message ||
        "Could not check answer fit right now.",
      );
    } finally {
      setIsCheckingFit(false);
    }

  };



  {
    fit && (
      <div className={`${styles.fitPanel} ${styles[`fit${fit.level}`]}`}>
        <b>{fit.level} fit</b>
        <p>{fit.note}</p>
      </div>
    );
  }
}