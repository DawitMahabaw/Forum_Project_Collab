import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listQuestions } from "../../services/questionService.js";
import styles from "./MyQuestions.module.css";

const MyQuestions = () => {
  const navigate = useNavigate();

  // Store the user's questions
  const [questions, setQuestions] = useState([]);

  // Check if questions are loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Get questions created by the current user
        const data = await listQuestions({ mine: true });

        // Save the questions
        setQuestions(data.questions);
      } finally {
        // Stop loading
        setIsLoading(false);
      }
    };

    // Load the questions
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

        <button onClick={() => navigate("/questions/ask")} type="button">
          <Plus size={17} />
          New question
        </button>
      </header>

      {/* Show loading message */}
      {isLoading && <div className={styles.state}>Loading your topics…</div>}
    </section>
  );
};

export default MyQuestions;
