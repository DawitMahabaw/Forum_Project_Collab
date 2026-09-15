import pool from "../config/db.js";

// ============================================================
// SHARED SELECT FRAGMENT
// ============================================================
// Defines the exact shape of columns needed to list a single question.
// Joins the users table to retrieve author metadata directly.
const BASE_QUESTION_SELECT = `
  SELECT
    q.id,
    q.question_hash,
    q.title,
    q.content,
    q.created_at,
    u.first_name AS author_first_name,
    u.last_name  AS author_last_name
  FROM questions q
  INNER JOIN users u ON u.user_id = q.user_id
`;

// ------------------------------------------------------------
// DATA ROW MAPPER FOR FRONTEND COMPATIBILITY
// ------------------------------------------------------------
// Maps snake_case database records directly to camelCase objects.
// Organizes user attributes into a neat author profile block for easy frontend display.
const mapQuestionRow = (row) => ({
  id: row.id,
  questionHash: row.question_hash,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  author: {
    firstName: row.author_first_name,
    lastName: row.author_last_name,
  },
});



export default Question;
