import pool from "../config/db.js";

const User = {
  async create({ firstName, lastName, email, passwordHash }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
        (first_name, last_name, email, password_hash)
      VALUES
        (?, ?, ?, ?)
      `,
      [firstName, lastName, email, passwordHash],
    );

    return {
      userId: result.insertId,
      firstName,
      lastName,
      email,
    };
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        password_hash,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    return rows[0] || null;
  },
};

export default User;
