import pool from "../config/db.js";

// User model contains the database operations needed
// by the authentication system.
const User = {
  // Create a new user in the users table.
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

  // Find an existing user by email.
  // This is needed during login and registration checks.
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
