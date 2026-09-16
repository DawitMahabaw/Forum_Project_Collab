import pool from "../config/db.js";

const Answer = {

    async create({ questionId, userId, content }) {
        const [result] = await pool.execute(

            const [result] = await pool.execute(


                `
      INSERT INTO answers
        (question_id, user_id, content)
      VALUES
        (?, ?, ?)
      `,
       
       [questionId, userId, content],
    );

      return result.insertId;
  },

  async findById(id) {
    // Execute a SELECT query.
    const [rows] = await pool.execute(
      // SELECT chooses which columns we want from the database.
      `
      SELECT
        a.id,
        a.question_id,
        a.user_id,
        a.content,
        a.created_at,
        a.updated_at,
     // These are user columns.
        //
        // AS gives them different names in the returned row.
        //
        // For example:
        //
        // u.user_id
        // becomes:
        // author_id
        //
        // This prevents confusion between:
        // answer's user_id
        // and
        // author's user_id.
        u.user_id    AS author_id,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name