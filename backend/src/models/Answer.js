// backend/src/models/Answer.js
import pool from "../config/db.js";

const Answer = {
  // ---------------------------------------------------------
  // TASK REQUIREMENT: Retrieve related answers
  // ---------------------------------------------------------
  async findManyByQuestionId(questionId) {
    // THIS WAS THE MISSING PART: Actually querying the database
    const [rows] = await pool.execute(
      `
      SELECT
        a.id,
        a.question_id,
        a.user_id,
        a.content,
        a.created_at,
        a.updated_at,
        u.user_id    AS author_id,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name
      FROM answers a
      INNER JOIN users u ON u.user_id = a.user_id
      WHERE a.question_id = ?
      ORDER BY a.created_at ASC
      `,
      [questionId],
    );

    // Formats raw data to match the camelCase structure the team uses
    return rows.map((row) => ({
      id: row.id,
      questionId: row.question_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        id: row.author_id,
        firstName: row.author_first_name,
        lastName: row.author_last_name,
      },
    }));
  },
};

export default Answer;
