import styles from "./Dashboard.module.css";

// Main dashboard for browsing community questions.
const Dashboard = () => {
  return (
    <section className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>Browse questions from the Evangadi community.</p>
        </div>

        <button type="button" className={styles.askButton}>
          Ask a Question
        </button>
      </header>

      <section className={styles.questionsSection}>
        <div className={styles.sectionHeader}>
          <h2>Community Questions</h2>
          <span>Latest discussions</span>
        </div>

        <div className={styles.questionList}>
          {/* QuestionCard components will be rendered here. */}
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
