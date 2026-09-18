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

// Build initials for the lightweight author avatar.
const getInitials = (author) =>
  `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`.toUpperCase() ||
  "?";

// Keep date display compact and locale aware.
const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Keep user-authored details safe to render even when no Markdown renderer is
// installed. The styling preserves line breaks and long code/error messages.
const MarkdownContent = ({ className = "", content }) => (
  <div className={className}>{typeof content === "string" ? content : ""}</div>
);

// Reuse the same four Markdown actions for new posts and inline edits.
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

// A textarea with the forum's Markdown toolbar.
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
      setAnswerError(
        "Write at least 20 characters before checking answer fit.",
      );
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

  // Create a new answer while retaining the existing discussion on screen.
  const handleSubmitAnswer = async (event) => {
    event.preventDefault();

    if (answerText.trim().length < 20) {
      setAnswerError("An answer must contain at least 20 characters.");
      return;
    }

    setAnswerError("");
    setIsSubmitting(true);

    try {
      const newAnswer = await createAnswer({
        questionId: question.id,
        content: answerText.trim(),
      });
      setAnswers((current) => [...current, newAnswer]);
      setAnswerText("");
      setFit(null);
      setToast("Your answer has been posted.");
    } catch (requestError) {
      setAnswerError(
        requestError.response?.data?.message ||
        "Could not post your answer. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open an inline question editor in place of the rendered question body.
  const startQuestionEdit = () => {
    setQuestionDraft({ title: question.title, content: question.content });
    setError("");
  };

  // Save the inline question editor and return to the rendered Markdown view.
  const saveQuestionEdit = async () => {
    if (
      questionDraft.title.trim().length < 5 ||
      questionDraft.content.trim().length < 10
    ) {
      setError(
        "The title needs 5 characters and the details need 10 characters.",
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updated = await updateQuestion(questionHash, {
        title: questionDraft.title.trim(),
        content: questionDraft.content.trim(),
      });
      setQuestion((current) => ({ ...current, ...updated }));
      setQuestionDraft(null);
      setToast("Your question has been updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not update the question.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Open an inline Markdown editor for the answer selected by its owner.
  const startAnswerEdit = (answer) => {
    setEditingAnswerId(answer.id);
    setAnswerDraft(answer.content);
    setAnswerError("");
  };

  // Save the edited answer without reloading the whole page.
  const saveAnswerEdit = async (answerId) => {
    if (answerDraft.trim().length < 20) {
      setAnswerError("An answer must contain at least 20 characters.");
      return;
    }

    setIsSaving(true);
    setAnswerError("");

    try {
      const updated = await updateAnswer(answerId, answerDraft.trim());
      setAnswers((current) =>
        current.map((item) => (item.id === answerId ? updated : item)),
      );
      setEditingAnswerId(null);
      setAnswerDraft("");
      setToast("Your answer has been updated.");
    } catch (requestError) {
      setAnswerError(
        requestError.response?.data?.message || "Could not update the answer.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Show an in-app confirmation dialog instead of window.confirm().
  const requestDelete = (type, answer = null) => {
    setPendingDelete({ type, answerId: answer?.id || null });
  };

  // Delete the explicitly confirmed owned question or answer.
  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);

    try {
      if (pendingDelete.type === "question") {
        await deleteQuestion(questionHash);
        navigate("/dashboard", { replace: true });
        return;
      }

      await deleteAnswer(pendingDelete.answerId);
      setAnswers((current) =>
        current.filter((answer) => answer.id !== pendingDelete.answerId),
      );
      setPendingDelete(null);
      setToast("Your answer has been deleted.");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Could not delete this post.";
      if (pendingDelete.type === "question") setError(message);
      else setAnswerError(message);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.state}>Loading this discussion...</div>;
  }

  if (error || !question) {
    return (
      <div className={styles.error} role="alert">
        {error || "Question not found."}
      </div>
    );
  }

  const isOwnQuestion = Number(question.author?.id) === Number(user?.userId);

  return (
    <section className={styles.page}>
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

      <button
        className={styles.back}
        onClick={() => navigate("/dashboard")}
        type="button"
      >
        <ArrowLeft size={17} />
        Back to feed
      </button>

      <div className={styles.layout}>
        <div className={styles.main}>
          <article className={styles.questionCard}>
            <header className={styles.author}>
              <span className={styles.avatar}>
                {getInitials(question.author)}
              </span>
              <p>
                <b>
                  {question.author?.firstName} {question.author?.lastName}
                </b>
                <small>Posted {formatDate(question.createdAt)}</small>
              </p>
            </header>

            {questionDraft ? (
              <>
                <label
                  className={styles.editLabel}
                  htmlFor="question-edit-title"
                >
                  Question title
                </label>
                <input
                  className={styles.questionTitleInput}
                  id="question-edit-title"
                  onChange={(event) =>
                    setQuestionDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  value={questionDraft.title}
                />
                <label
                  className={styles.editLabel}
                  htmlFor="question-edit-content"
                >
                  Question details
                </label>
                <MarkdownEditor
                  ariaLabel="Question details"
                  inputRef={questionEditTextareaRef}
                  minLength={10}
                  onChange={(content) =>
                    setQuestionDraft((current) => ({ ...current, content }))
                  }
                  placeholder="Include all of the context that someone needs to answer your question."
                  value={questionDraft.content}
                />
                <div className={styles.editActions}>
                  <button
                    disabled={isSaving}
                    onClick={() => setQuestionDraft(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={saveQuestionEdit}
                    type="button"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>{question.title}</h1>
                <MarkdownContent
                  className={styles.questionBody}
                  content={question.content}
                />
              </>
            )}

            {isOwnQuestion && !questionDraft && (
              <div className={styles.ownerActions}>
                <button onClick={startQuestionEdit} type="button">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => requestDelete("question")} type="button">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}

            <footer>
              <button
                className={styles.shareButton}
                onClick={handleShareQuestion}
                type="button"
              >
                <Share2 size={15} />
                Share
              </button>
              <span>
                <MessageSquare size={15} />
                {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
              </span>
            </footer>
          </article>

          <h2 className={styles.answersHeading}>
            Community Answers ({answers.length})
          </h2>

          {!answers.length && (
            <div className={styles.emptyAnswers}>
              No answers yet - be the first to share something helpful.
            </div>
          )}

          {answers.map((answer) => {
            const isOwnAnswer =
              Number(answer.author?.id) === Number(user?.userId);
            const isEditing = editingAnswerId === answer.id;

            return (
              <article className={styles.answerCard} key={answer.id}>
                <header className={styles.author}>
                  <span className={`${styles.avatar} ${styles.answerAvatar}`}>
                    {getInitials(answer.author)}
                  </span>
                  <p>
                    <b>
                      {answer.author?.firstName} {answer.author?.lastName}
                    </b>
                    <small>{formatDate(answer.createdAt)}</small>
                  </p>
                </header>

                {isEditing ? (
                  <>
                    <MarkdownEditor
                      ariaLabel="Answer"
                      inputRef={answerEditTextareaRef}
                      minLength={20}
                      onChange={setAnswerDraft}
                      placeholder="Share what you know, including useful steps or examples."
                      value={answerDraft}
                    />
                    <div className={styles.editActions}>
                      <button
                        disabled={isSaving}
                        onClick={() => {
                          setEditingAnswerId(null);
                          setAnswerDraft("");
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSaving}
                        onClick={() => saveAnswerEdit(answer.id)}
                        type="button"
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </>
                ) : (
                  <MarkdownContent content={answer.content} />
                )}

                {isOwnAnswer && !isEditing && (
                  <div className={styles.ownerActions}>
                    <button
                      onClick={() => startAnswerEdit(answer)}
                      type="button"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => requestDelete("answer", answer)}
                      type="button"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}

          {isOwnQuestion ? (
            <p className={styles.ownNotice}>
              You cannot answer your own question, but you can return later to
              review community replies.
            </p>
          ) : (
            <form className={styles.answerForm} onSubmit={handleSubmitAnswer}>
              <h2>Add your answer</h2>
              <MarkdownEditor
                ariaLabel="New answer"
                inputRef={answerTextareaRef}
                minLength={20}
                onChange={(value) => {
                  setAnswerText(value);
                  setFit(null);
                }}
                placeholder="Share what you know, include steps or examples, and keep the answer focused on this question."
                value={answerText}
              />
              <div className={styles.answerTools}>
                <button
                  disabled={isCheckingFit}
                  onClick={handleCheckFit}
                  type="button"
                >
                  <Sparkles size={16} />
                  {isCheckingFit ? "Checking..." : "Check answer fit"}
                </button>
                <small>Optional AI feedback before you publish.</small>
              </div>
              {fit && (
                <div
                  className={`${styles.fitPanel} ${styles[`fit${fit.level}`]}`}
                >
                  <b>{fit.level} fit</b>
                  <p>{fit.note}</p>
                </div>
              )}
              {answerError && (
                <div className={styles.error} role="alert">
                  {answerError}
                </div>
              )}
              <button
                className={styles.submitAnswer}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Posting..." : "Post Answer"}
                <Send size={16} />
              </button>
            </form>
          )}
        </div>

        <aside className={styles.related}>
          <h2>Related Questions</h2>
          {similarQuestions.length === 0 && <p>No related questions found.</p>}
          {similarQuestions.map((item) => (
            <Link
              key={item.questionHash}
              to={`/questions/${item.questionHash}`}
            >
              <b>{item.title}</b>
              <small>
                {item.author?.firstName} {item.author?.lastName} -{" "}
                {typeof item.score === "number"
                  ? `${Math.round(item.score * 100)}% match`
                  : "Related topic"}
              </small>
            </Link>
          ))}
        </aside>
      </div>

      {pendingDelete && (
        <div className={styles.modalBackdrop} role="presentation">
          <section
            aria-describedby="delete-post-copy"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <h2>Delete this {pendingDelete.type}?</h2>
            <p id="delete-post-copy">
              {pendingDelete.type === "question"
                ? "This question and every answer on it will be permanently removed."
                : "This answer will be permanently removed from the discussion."}
            </p>
            <div>
              <button
                disabled={isDeleting}
                onClick={() => setPendingDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default QuestionDetail;
