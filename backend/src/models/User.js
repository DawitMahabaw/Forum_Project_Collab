import pool from "../config/db.js";

const User = {
   async create({ firstName, lastName, email, passwordHash, role = "user" }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
        (first_name, last_name, email, password_hash, role)
      VALUES
        (?, ?, ?, ?, ?)
      `,
      [firstName, lastName, email, passwordHash, role],
    );

    return {
      userId: result.insertId,
      firstName,
      lastName,
      email,
      role,
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
        google_id,
        password_hash,
        role,
        avatar_url,
        headline,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    return rows[0] || null;
  },

  async findByGoogleId(googleId) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        google_id,
        password_hash,
        role,
        avatar_url,
        headline,
        created_at
      FROM users
      WHERE google_id = ?
      LIMIT 1
      `,
      [googleId],
    );

    return rows[0] || null;
  },

  async createGoogleUser({
    firstName,
    lastName,
    email,
    googleId,
    avatarUrl = null,
    role = "user",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
        (first_name, last_name, email, google_id, password_hash, avatar_url, role)
      VALUES
        (?, ?, ?, ?, NULL, ?, ?)
      `,
      [firstName, lastName, email, googleId, avatarUrl, role],
    );

    return {
      userId: result.insertId,
      firstName,
      lastName,
      email,
      role,
      avatarUrl,
    };
  },

  async linkGoogleAccount(userId, googleId, avatarUrl = null) {
    if (avatarUrl) {
      await pool.execute(
        `
        UPDATE users
        SET google_id = ?,
            avatar_url = COALESCE(avatar_url, ?)
        WHERE user_id = ?
        `,
        [googleId, avatarUrl, userId],
      );
    } else {
      await pool.execute(
        `
        UPDATE users
        SET google_id = ?
        WHERE user_id = ?
        `,
        [googleId, userId],
      );
    }

    return this.findById(userId);
  },

  async findById(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        google_id,
        role,
        avatar_url,
        headline,
        bio,
        location,
        github_url,
        portfolio_url,
        created_at
      FROM users
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    return rows[0] || null;
  },

  async findByIdWithPassword(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        password_hash
      FROM users
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    return rows[0] || null;
  },

  async getProfileWithStats(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.avatar_url,
        u.headline,
        u.bio,
        u.location,
        u.github_url,
        u.portfolio_url,
        u.created_at,
        (SELECT COUNT(*) FROM questions WHERE user_id = u.user_id) AS questions_count,
        (SELECT COUNT(*) FROM answers WHERE user_id = u.user_id) AS answers_count
      FROM users u
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    return rows[0] || null;
  },


  async updateProfile(userId, { headline, bio, location, githubUrl, portfolioUrl }) {
    await pool.execute(
      `
      UPDATE users
      SET headline = ?, bio = ?, location = ?, github_url = ?, portfolio_url = ?
      WHERE user_id = ?
      `,
      [
        headline || null,
        bio || null,
        location || null,
        githubUrl || null,
        portfolioUrl || null,
        userId,
      ],
    );
    return this.getProfileWithStats(userId);
  },

  async updateAvatar(userId, avatarUrl) {
    await pool.execute(
      `
      UPDATE users
      SET avatar_url = ?
      WHERE user_id = ?
      `,
      [avatarUrl, userId],
    );
    return this.getProfileWithStats(userId);
  },

  async updateAccount(userId, { firstName, lastName, email }) {
    await pool.execute(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?
      WHERE user_id = ?
      `,
      [firstName, lastName, email, userId],
    );
    return this.findById(userId);
  },

  async updatePassword(userId, passwordHash) {
    await pool.execute(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
      `,
      [passwordHash, userId],
    );
    return true;
  },
};

export default User;
