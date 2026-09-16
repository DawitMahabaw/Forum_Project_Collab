import pool from "../config/db.js";

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

const mapQuestionRow = (row) => ({
  id: row.id,
  questionHash: row.question_hash,
  title: row.title,
  content: row.content,
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
  async create({ questionHash, userId, title, content }) {
    const [result] = await pool.execute(
      `
      INSERT INTO questions
          (question_hash, user_id, title, content)
      VALUES (?, ?, ?, ?)
      `,
      [questionHash, userId, title, content],
    );

    return result.insertId;
  },
};

export default Question;
