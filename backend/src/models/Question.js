// Import the MySQL connection pool from the team database configuration.
import pool from "../config/db.js";

// ============================================================
// SHARED SELECT FRAGMENT
// ============================================================
// TASK REQUIREMENT: Retrieves necessary fields for the single question detail view.
// Perfectly mirrors all your teammate's exact selection fields.
const BASE_QUESTION_SELECT = `
  SELECT
    q.id,
    q.question_hash,
    q.title,
    q.content,
    q.user_id,
    q.created_at,
    q.updated_at,
    u.user_id   AS author_id,
    u.first_name AS author_first_name,
    u.last_name  AS author_last_name,
    COUNT(a.id) AS answer_count
  FROM questions q
  INNER JOIN users u ON u.user_id = q.user_id
  LEFT JOIN answers a ON a.question_id = q.id
`;

// ------------------------------------------------------------
// DATA ROW MAPPER FOR FRONTEND COMPATIBILITY
// ------------------------------------------------------------
// TASK REQUIREMENT: Formats database snake_case columns cleanly into camelCase
// objects to match normal JavaScript/JSON frontend conventions.
const mapQuestionRow = (row) => ({
  id: row.id,
  questionHash: row.question_hash,
  title: row.title,
  content: row.content,
  userId: row.user_id,
  answerCount: Number(row.answer_count) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  author: {
    id: row.author_id,
    firstName: row.author_first_name,
    lastName: row.author_last_name,
  },
});

const Question = {
  // ---------------------------------------------------------
  // FIND BY PUBLIC HASH IDENTIFIER
  // ---------------------------------------------------------
  // TASK REQUIREMENT: Accepts the public hash, retrieves the single question,
  // and safely handles question-not-found cases by returning null.
  async findByHash(questionHash) {
    const [rows] = await pool.execute(
      `
      ${BASE_QUESTION_SELECT}
      WHERE q.question_hash = ?
      GROUP BY q.id
      LIMIT 1
      `,
      [questionHash],
    );

    // Safely reads the primary element if found, or returns null for 404 validation
    return rows[0] ? mapQuestionRow(rows[0]) : null;
  },
};

export default Question;
