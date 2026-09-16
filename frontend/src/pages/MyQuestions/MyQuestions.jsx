// ============================================================
// MY QUESTIONS PAGE
// ============================================================

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import QuestionCard from "../../components/QuestionCard/QuestionCard.jsx";
import { listQuestions } from "../../services/questionService.js";
import styles from "./MyQuestions.module.css";

const MyQuestions = () => {
  // Used to move between pages
  const navigate = useNavigate();

  // Store the user's questions
  const [questions, setQuestions] = useState([]);

  // Check if questions are loading
  const [isLoading, setIsLoading] = useState(true);

  // Store error message
  const [error, setError] = useState("");

  // Run when the page opens
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Get only questions created by the current user
        const data = await listQuestions({ mine: true });

        // Save the questions
        setQuestions(data.questions);
      } catch (requestError) {
        // Show error if the request fails
        setError(
          requestError.response?.data?.message || "Could not load your topics.",
        );
      } finally {
        // Stop loading
        setIsLoading(false);
      }
    };

    // Call the function
    loadQuestions();
  }, []);

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span>Your workspace</span>

          <h2>Your topics</h2>

          <p>
            Only questions you created. Open one to read answers or add
            follow-ups. Rows use the same left accent as your threads on Home.
          </p>
        </div>

        {/* Button to create a new question */}
        <button onClick={() => navigate("/questions/ask")} type="button">
          <Plus size={17} />
          New question
        </button>
      </header>

      {/* Show loading message */}
      {isLoading && <div className={styles.state}>Loading your topics…</div>}

      {/* Show error message */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Show message if user has no questions */}
      {!isLoading && !error && !questions.length && (
        <div className={styles.state}>
          <h3>You have not posted a question yet</h3>

          <p>Ask your first question to start your personal topic list.</p>

          <button onClick={() => navigate("/questions/ask")} type="button">
            Ask a question
          </button>
        </div>
      )}

      {/* Show questions when they exist */}
      {!isLoading && !error && questions.length > 0 && (
        <section className={styles.list}>
          {/* Go through each question */}
          {questions.map((question) => (
            <QuestionCard key={question.questionHash} question={question} />
          ))}
        </section>
      )}
    </section>
  );
};

export default MyQuestions;
