import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./QuestionCard.module.css";

// Reusable card for displaying one forum question.
const QuestionCard = ({ question }) => {
  const navigate = useNavigate();
  const questionHash = question.questionHash || question.question_hash;
  const author = question.author || {};

  // Navigate to the question details page.
  const handleClick = () => {
    if (questionHash) {
      navigate(`/questions/${encodeURIComponent(questionHash)}`);
    }
  };

  // Create initials for the question author's avatar.
  const getInitials = () => {
    const first = author.firstName?.[0] || "";
    const last = author.lastName?.[0] || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.avatar}>{getInitials()}</div>

      <div className={styles.content}>
        <h3 className={styles.title}>{question.title}</h3>

        <p className={styles.excerpt}>{question.content}</p>

        <div className={styles.meta}>
          <span>
            {author.firstName} {author.lastName}
          </span>

          <span>•</span>

          <span>{question.createdAt}</span>

          <span className={styles.replies}>
            <MessageCircle size={14} />
            {question.answerCount || 0} replies
          </span>
        </div>
      </div>

      {question.isOwner && <span className={styles.yours}>YOURS</span>}
    </article>
  );
};

export default QuestionCard;
