import pool from "../config/db.js";

const User = {
   async create({
    firstName,
    lastName,
    email,
    passwordHash,
    role = "user",
    isVerified = false,
    verificationToken = null,
    verificationExpires = null,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
        (first_name, last_name, email, password_hash, role, is_verified, verification_token, verification_expires)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        isVerified ? 1 : 0,
        verificationToken,
        verificationExpires,
      ],
    );

    return {
      userId: result.insertId,
      firstName,
      lastName,
      email,
      role,
      isVerified,
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
        pending_email,
        google_id,
        password_hash,
        role,
        avatar_url,
        headline,
        is_verified,
        verification_token,
        verification_expires,
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
        is_verified,
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
        (first_name, last_name, email, google_id, password_hash, avatar_url, role, is_verified)
      VALUES
        (?, ?, ?, ?, NULL, ?, ?, TRUE)
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
      isVerified: true,
    };
  },

  async setVerificationTokenHash(userId, tokenHash, expiresAt) {
    await pool.execute(
      `
      UPDATE users
      SET verification_token = ?, verification_expires = ?
      WHERE user_id = ?
      `,
      [tokenHash, expiresAt, userId],
    );
  },

  async findByVerificationTokenHash(tokenHash) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        pending_email,
        google_id,
        is_verified,
        verification_token,
        verification_expires
      FROM users
      WHERE verification_token = ?
      LIMIT 1
      `,
      [tokenHash],
    );
    return rows[0] || null;
  },

  async findByEmailOrPendingEmail(email) {
    const [rows] = await pool.execute(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        pending_email,
        google_id,
        is_verified
      FROM users
      WHERE email = ? OR pending_email = ?
      LIMIT 1
      `,
      [email, email],
    );
    return rows[0] || null;
  },

  async setPendingEmail(userId, pendingEmail, tokenHash, expiresAt) {
    await pool.execute(
      `
      UPDATE users
      SET
        pending_email = ?,
        verification_token = ?,
        verification_expires = ?
      WHERE user_id = ?
      `,
      [pendingEmail, tokenHash, expiresAt, userId],
    );
    return this.findById(userId);
  },

  async confirmEmailChange(userId, newEmail) {
    await pool.execute(
      `
      UPDATE users
      SET
        email = ?,
        pending_email = NULL,
        verification_token = NULL,
        verification_expires = NULL,
        is_verified = TRUE
      WHERE user_id = ?
      `,
      [newEmail, userId],
    );
    return this.findById(userId);
  },

  async updateAccountNamesOnly(userId, { firstName, lastName }) {
    await pool.execute(
      `
      UPDATE users
      SET first_name = ?, last_name = ?
      WHERE user_id = ?
      `,
      [firstName, lastName, userId],
    );
    return this.findById(userId);
  },

  async markAsVerified(userId) {
    const [result] = await pool.execute(
      `
      UPDATE users
      SET
        is_verified = TRUE,
        verification_token = NULL,
        verification_expires = NULL
      WHERE user_id = ?
      `,
      [userId],
    );
    return result.affectedRows > 0;
  },

  async updateUnverifiedRegistration(userId, { firstName, lastName, passwordHash, tokenHash, expiresAt }) {
    await pool.execute(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        password_hash = ?,
        verification_token = ?,
        verification_expires = ?,
        pending_email = NULL,
        is_verified = FALSE
      WHERE user_id = ?
      `,
      [firstName, lastName, passwordHash, tokenHash, expiresAt, userId],
    );
    return this.findById(userId);
  },

  async claimUnverifiedAccountWithGoogle(userId, { googleId, avatarUrl = null }) {
    await pool.execute(
      `
      UPDATE users
      SET
        google_id = ?,
        password_hash = NULL,
        verification_token = NULL,
        verification_expires = NULL,
        pending_email = NULL,
        is_verified = TRUE,
        avatar_url = COALESCE(avatar_url, ?)
      WHERE user_id = ?
      `,
      [googleId, avatarUrl, userId],
    );
    return this.findById(userId);
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
        pending_email,
        google_id,
        role,
        avatar_url,
        headline,
        bio,
        location,
        github_url,
        portfolio_url,
        is_verified,
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
