import { MessageCircle } from "lucide-react";

import styles from "./QuestionCard.module.css";

// Displays one question in the discussion feed.
const QuestionCard = ({ question }) => {
  const { title, description, replies, createdAt, authorName, isMine } =
    question;

  return (
    <article className={`${styles.card} ${isMine ? styles.mine : ""}`}>
      <div className={styles.avatar} aria-hidden="true">
        {authorName?.charAt(0)?.toUpperCase() || "U"}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <p className={styles.description}>{description}</p>

        <div className={styles.meta}>
          <span className={styles.replies}>
            <MessageCircle size={14} aria-hidden="true" />
            {replies ?? 0} replies
          </span>

          <span>{createdAt}</span>

          <span>{authorName}</span>

          {isMine && <span className={styles.yours}>YOURS</span>}
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;
