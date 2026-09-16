// Import the Plus icon
import { Plus } from "lucide-react";

// Import useNavigate to move to another page
import { useNavigate } from "react-router-dom";

// Import CSS module styles
import styles from "./MyQuestions.module.css";

// MyQuestions component
const MyQuestions = () => {
  // Create navigation function
  const navigate = useNavigate();

  return (
    // Main section of the page
    <section className={styles.page}>
      {/* Header section */}
      <header className={styles.hero}>
        <div>
          {/* Small heading */}
          <span>Your workspace</span>

          {/* Main page title */}
          <h2>Your topics</h2>

          {/* Description of the page */}
          <p>
            Only questions you created. Open one to read answers or add
            follow-ups. Rows use the same left accent as your threads on Home.
          </p>
        </div>

        {/* Button to create a new question */}
        <button
          // Go to the ask-question page when clicked
          onClick={() => navigate("/questions/ask")}
          // Prevents the button from submitting a form
          type="button"
        >
          {/* Plus icon */}
          <Plus size={17} />
          {/* Button text */}
          New question
        </button>
      </header>
    </section>
  );
};

// Export the component so it can be used in other files
export default MyQuestions;
