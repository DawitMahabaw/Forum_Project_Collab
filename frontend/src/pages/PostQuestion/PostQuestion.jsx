import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { createQuestion } from "../../services/questionService.js";

import styles from "./PostQuestion.module.css";

const PostQuestion = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!title.trim()) {
      return "Question title is required.";
    }

    if (!description.trim()) {
      return "Question description is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await createQuestion({
        title: title.trim(),
        description: description.trim(),
      });

      setSuccess(response.message || "Question created successfully.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Failed to create question:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create question. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>ASK THE COMMUNITY</p>

        <h1>Ask a question</h1>

        <p>
          Share your question with enough detail so the community can understand
          the problem and help you find a solution.
        </p>
      </header>

      <section className={styles.card}>
        <form onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          <div className={styles.field}>
            <label htmlFor="title">Question title</label>

            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. How does React use props?"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows="10"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explain your question, what you have tried, and where you are stuck..."
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default PostQuestion;
