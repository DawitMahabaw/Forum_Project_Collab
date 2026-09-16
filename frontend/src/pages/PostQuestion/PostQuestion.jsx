import styles from "./PostQuestion.module.css";

const PostQuestion = () => {
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
        <form>
          <div className={styles.field}>
            <label htmlFor="title">Question title</label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. How does React use props?"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows="10"
              placeholder="Explain your question, what you have tried, and where you are stuck..."
            />
          </div>

          <div className={styles.actions}>
            <button type="submit">Post Question</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default PostQuestion;
