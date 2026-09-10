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

      // MySQL replaces the ? placeholders with these values.
      //
      // mysql2 safely handles the values for us.
      [firstName, lastName, email, passwordHash],
    );

    // MySQL generates the user_id automatically because
    // our schema uses AUTO_INCREMENT.
    //
    // result.insertId contains that newly generated ID.
    //
    // We return only the information that our application
    // needs after registration.
    //
    // Notice that we do NOT return passwordHash.
    return {
      userId: result.insertId,
      firstName,
      lastName,
      email,
    };
  },

  // ---------------------------------------------------------
  // FIND USER BY EMAIL
  // ---------------------------------------------------------
  //
  // This method searches for a user using their email address.
  //
  // This will be especially important during LOGIN.
  //
  // Login flow will eventually look like:
  //
  // User enters email + password
  //          ↓
  // Controller
  //          ↓
  // Auth Service
  //          ↓
  // User.findByEmail()
  //          ↓
  // MySQL
  //          ↓
  // User record
  //
  async findByEmail(email) {
    // Execute a SELECT query.
    //
    // Again, ? is used instead of directly inserting
    // the email into the SQL statement.
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

      // Value that replaces the ? placeholder.
      [email],
    );

    // MySQL returns an array of rows.
    //
    // Because email is UNIQUE in our database,
    // there can only be one matching user.
    //
    // rows[0] gives us the first matching user.
    //
    // If no user exists, rows[0] is undefined.
    //
    // In that case, we return null.
    return rows[0] || null;
  },

  // ---------------------------------------------------------
  // FIND USER BY ID
  // ---------------------------------------------------------
  //
  // This method searches for a user using their numeric
  // user_id instead of their email.
  //
  // This is used by the "GET CURRENT USER" flow:
  //
  // Frontend sends a JWT
  //          ↓
  // authMiddleware verifies it and reads req.user.userId
  //          ↓
  // authService.getCurrentUser(userId)
  //          ↓
  // User.findById(userId)
  //          ↓
  // MySQL
  //          ↓
  // User record (without password_hash)
  //
  // This is how the frontend restores a logged-in session
  // after a page refresh, without asking the user to log
  // in again.
  async findById(userId) {
    // Execute a parameterized SELECT query.
    //
    // Notice that password_hash is intentionally NOT selected
    // here. Unlike findByEmail() (used during login, where we
    // need the hash to compare against the submitted password),
    // this method only needs to confirm the user still exists
    // and return their safe, public information.
    const [rows] = await pool.execute(
      `
    SELECT
      user_id,
      first_name,
      last_name,
      email,
      created_at
    FROM users
    WHERE user_id = ?
    LIMIT 1
    `,
      // Value that replaces the ? placeholder.
      [userId],
    );

    // Same pattern as findByEmail(): return the single matching
    // row, or null if no user exists with this ID (for example,
    // if the account was deleted after the JWT was issued).
    return rows[0] || null;
  },
};

// Export the User model.
//
// Controllers/services can now import it with:
//
// import User from "../models/User.js";
//
// depending on their location.
export default User;
