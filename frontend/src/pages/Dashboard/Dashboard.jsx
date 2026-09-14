import { FileText, HelpCircle, MessageCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Dashboard.module.css";

// Main dashboard for browsing community questions.
const Dashboard = () => {
  const { user } = useAuth();

  const firstName = user?.firstName || "there";

  return (
    <section className={styles.dashboard}>
      {/* Welcome section */}
      <header className={styles.welcome}>
        <span className={styles.eyebrow}>FORUM HOME</span>

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

      {/* Statistics will be populated from the API later. */}
      <section className={styles.statsSection}>
        <p className={styles.sectionIntro}>
          Figures below describe the newest threads in this feed (up to 100 from
          the API).
        </p>

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span>Questions</span>
            <strong>—</strong>
          </article>

          <article className={styles.statCard}>
            <span>Replies</span>
            <strong>—</strong>
          </article>

          <article className={styles.statCard}>
            <span>Unanswered</span>
            <strong>—</strong>
          </article>

          <article className={styles.statCard}>
            <span>Yours</span>
            <strong>—</strong>
          </article>
        </div>
      </section>

      {/* Questions will be rendered here from the API later. */}
      <section className={styles.feedSection}>
        <div className={styles.feedHeader}>
          <div>
            <h2>Discussion feed</h2>

            <p>Your threads use a slim left accent in this list.</p>
          </div>

          <button type="button" className={styles.sortButton}>
            NEWEST THREADS
          </button>
        </div>

        <div className={styles.questionList}>
          {/* QuestionCard components will be rendered here later. */}
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
