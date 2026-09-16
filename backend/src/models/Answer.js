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