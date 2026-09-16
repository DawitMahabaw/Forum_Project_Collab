import { BookOpen, MessageSquare, PenSquare } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.firstName || "there";

  return (
    <section className={styles.dashboard}>
      <section className={styles.overview} aria-labelledby="welcome-heading">
        <header className={styles.welcome}>
          <p className={styles.eyebrow}>FORUM HOME</p>
          <h1 id="welcome-heading">Good to see you, {firstName}.</h1>
          <p>
            Start a topic, revisit your own threads, or skim the live feed.
            Search above works from any page once you are back on Home.
          </p>
        </header>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">
              <PenSquare size={18} />
            </span>
            <span>
              <strong>New question</strong>
              <small>Share context, errors, and what you already tried</small>
            </span>
          </article>

          <article className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">
              <MessageSquare size={18} />
            </span>
            <span>
              <strong>Your topics</strong>
              <small>Filtered list of threads you authored</small>
            </span>
          </article>

          <article className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">
              <BookOpen size={18} />
            </span>
            <span>
              <strong>Knowledge base</strong>
              <small>Course library, uploads, and retrieval-backed context for threads</small>
            </span>
          </article>
        </div>

        <section className={styles.statsSection} aria-label="Forum activity">
          <p className={styles.statsDescription}>
            Figures below describe the newest threads in this feed (up to 100 from the API).
          </p>

          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <span>Questions</span>
              <strong>0</strong>
            </article>
            <article className={styles.statCard}>
              <span>Replies</span>
              <strong>0</strong>
            </article>
            <article className={styles.statCard}>
              <span>Unanswered</span>
              <strong>0</strong>
            </article>
            <article className={styles.statCard}>
              <span>Yours</span>
              <strong>0</strong>
            </article>
          </div>
        </section>
      </section>

      <section className={styles.feedSection} aria-labelledby="feed-heading">
        <div className={styles.feedHeader}>
          <div>
            <h2 id="feed-heading">Discussion feed</h2>
            <p>Your threads use a slim left accent in this list.</p>
          </div>
          <button type="button" className={styles.feedButton}>
            NEWEST THREADS
          </button>
        </div>

        <div className={styles.state}>
          <p>No questions found. Be the first to ask!</p>
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
