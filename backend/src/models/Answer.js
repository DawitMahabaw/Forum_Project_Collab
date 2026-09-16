import pool from "../config/db.js";

const Answer = {

    async create({ questionId, userId, content }) {
        

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
     
        
        u.user_id    AS author_id,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name
      
      FROM answers a

    
  
      INNER JOIN users u ON u.user_id = a.user_id

    
     
      WHERE a.id = ?

      LIMIT 1
      `,

      
      [id],
    );

     if (!rows[0]) {
      
    }

        const row = rows[0];

         return {
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
    };
  },

   async updateOwned(id, userId, content) {
    
    const [result] = await pool.execute(
      


      `UPDATE answers SET content = ? WHERE id = ? AND user_id = ?`,

      


      [content, id, userId],
    );

       return result.affectedRows > 0 ? this.findById(id) : null;
  },

 
  
  async deleteOwned(id, userId) {
    
    const [result] = await pool.execute(
      
      `DELETE FROM answers WHERE id = ? AND user_id = ?`,

      
      [id, userId],
    );
       return result.affectedRows > 0;
  },
};




export default Answer;
