import { FileText, HelpCircle, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import QuestionCard from "../../components/QuestionCard/QuestionCard.jsx";
import { getQuestions } from "../../services/questionService.js";

import styles from "./Dashboard.module.css";

// Main dashboard for browsing community questions.
const Dashboard = () => {
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.firstName || "there";

  // Load questions from the question service.
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getQuestions();

        // Support either:
        // 1. an array returned directly
        // 2. an object such as { questions: [...] }
        const questionList = Array.isArray(data) ? data : data?.questions || [];

        setQuestions(questionList);
      } catch (err) {
        console.error("Failed to load questions:", err);

        setError("Unable to load questions right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Calculate dashboard statistics from the loaded questions.
  const statistics = useMemo(() => {
    const replies = questions.reduce(
      (total, question) => total + (question.answerCount || 0),
      0,
    );

    const unanswered = questions.filter(
      (question) => !question.answerCount,
    ).length;

    const yours = questions.filter((question) => question.isOwner).length;

    return {
      questions: questions.length,
      replies,
      unanswered,
      yours,
    };
  }, [questions]);

  return (
    <section className={styles.dashboard}>
      {/* Welcome section */}
      <header className={styles.welcome}>
        <p className={styles.eyebrow}>FORUM HOME</p>

        <h1>Good to see you, {firstName}.</h1>

        <p>
          Start a topic, revisit your own threads, or skim the live feed. Search
          above works from any page once you are back on Home.
        </p>
      </header>

      {/* Main dashboard feature cards */}
      <section className={styles.featureGrid}>
        <article className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <HelpCircle size={20} />
          </div>

          <h2>New question</h2>

          <p>Share context, errors, and what you already tried.</p>
        </article>

        <article className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <MessageCircle size={20} />
          </div>

          <h2>Your topics</h2>

          <p>Filtered list of threads you authored.</p>
        </article>

        <article className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FileText size={20} />
          </div>

          <h2>Knowledge base</h2>

          <p>
            Course library, uploads, and retrieval-backed context for threads.
          </p>
        </article>
      </section>

      {/* Statistics section */}
      <section className={styles.statsSection}>
        <div className={styles.statsIntro}>
          <h2>Forum activity</h2>

          <p>Figures below describe the newest threads in this feed.</p>
        </div>

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Questions</span>

            <strong className={styles.statValue}>
              {isLoading ? "—" : statistics.questions}
            </strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Replies</span>

            <strong className={styles.statValue}>
              {isLoading ? "—" : statistics.replies}
            </strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Unanswered</span>

            <strong className={styles.statValue}>
              {isLoading ? "—" : statistics.unanswered}
            </strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Yours</span>

            <strong className={styles.statValue}>
              {isLoading ? "—" : statistics.yours}
            </strong>
          </article>
        </div>
      </section>

      {/* Discussion feed */}
      <section className={styles.feedSection}>
        <div className={styles.feedHeader}>
          <div className={styles.feedTitle}>
            <h2>Discussion feed</h2>

            <p>Your threads use a slim left accent in this list.</p>
          </div>

          <button type="button" className={styles.feedButton}>
            NEWEST THREADS
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className={styles.state}>
            <p>Loading questions...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className={styles.state}>
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && questions.length === 0 && (
          <div className={styles.state}>
            <p>No questions have been posted yet.</p>
          </div>
        )}

        {/* Question list */}
        {!isLoading && !error && questions.length > 0 && (
          <div className={styles.questionList}>
            {questions.map((question) => (
              <QuestionCard key={question.questionId} question={question} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default Dashboard;
