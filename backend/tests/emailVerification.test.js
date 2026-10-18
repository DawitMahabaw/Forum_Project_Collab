import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import pool from "../src/config/db.js";
import User from "../src/models/User.js";
import {
  verifyEmail,
  loginUser,
  hashVerificationToken,
} from "../src/services/authService.js";
import { hashPassword } from "../src/utils/password.js";

describe("Email Verification & Account Security Suite", () => {
  const createdUserIds = [];

  // Helper to safely clean up any test accounts created during the test run
  after(async () => {
    if (createdUserIds.length > 0) {
      const placeholders = createdUserIds.map(() => "?").join(",");
      await pool.execute(
        `DELETE FROM users WHERE user_id IN (${placeholders})`,
        createdUserIds,
      );
    }
    await pool.end();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Google Linking Pre-Registration Takeover Defense
  // --------------------------------------------------------------------------
  it("Google sign-in on unverified password account wipes attacker password/token and verifies account", async () => {
    const testEmail = `test-victim-${Date.now()}@example.com`;
    const attackerPasswordHash = await hashPassword("AttackerSecret123!");
    const initialRawToken = crypto.randomBytes(32).toString("hex");
    const initialTokenHash = hashVerificationToken(initialRawToken);
    const initialExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 1. Attacker pre-registers the victim's email address
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, verification_token, verification_expires)
      VALUES (?, ?, ?, ?, FALSE, ?, ?)
      `,
      [
        "Victim",
        "User",
        testEmail,
        attackerPasswordHash,
        initialTokenHash,
        initialExpires,
      ],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // Verify initial attacker state
    const preClaimUser = await User.findByIdWithPassword(userId);
    assert.ok(preClaimUser.password_hash, "Attacker password hash must exist initially");

    // 2. Legitimate user logs in with Google; backend claims the unverified account
    const googleSub = `google-sub-${Date.now()}`;
    const avatar = "https://lh3.googleusercontent.com/photo.jpg";
    await User.claimUnverifiedAccountWithGoogle(userId, {
      googleId: googleSub,
      avatarUrl: avatar,
    });

    // 3. Inspect the updated user in the database
    const [rows] = await pool.execute(
      `
      SELECT user_id, email, google_id, password_hash, is_verified, verification_token, verification_expires, avatar_url
      FROM users
      WHERE user_id = ?
      `,
      [userId],
    );
    const claimedUser = rows[0];

    assert.equal(claimedUser.google_id, googleSub, "Google ID must be linked");
    assert.equal(claimedUser.password_hash, null, "Attacker password hash must be completely wiped (NULL)");
    assert.equal(claimedUser.verification_token, null, "Verification token must be cleared");
    assert.equal(claimedUser.verification_expires, null, "Verification expiry must be cleared");
    assert.equal(Boolean(claimedUser.is_verified), true, "Account must now be marked verified");

    // 4. Verify attacker can NO LONGER log in with their old password
    await assert.rejects(
      async () => {
        await loginUser({ email: testEmail, password: "AttackerSecret123!" });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.message, "Incorrect email or password.");
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 2: Expired Verification Token Handling & Scanner-Safe Verification
  // --------------------------------------------------------------------------
  it("Rejects expired verification token with HTTP 400 and verifies unexpired token", async () => {
    const testEmail = `test-token-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("UserPass123!");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashVerificationToken(rawToken);

    // Create user with an expired token (1 hour in the past)
    const expiredTimestamp = new Date(Date.now() - 3600 * 1000);
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, verification_token, verification_expires)
      VALUES (?, ?, ?, ?, FALSE, ?, ?)
      `,
      ["Token", "Tester", testEmail, passwordHash, tokenHash, expiredTimestamp],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // 1. Verify that expired token is rejected with statusCode 400 & expired = true
    await assert.rejects(
      async () => {
        await verifyEmail(rawToken);
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.expired, true);
        assert.match(err.message, /expired/i);
        return true;
      },
    );

    // Ensure user remains unverified
    const [unverifiedRows] = await pool.execute(
      `SELECT is_verified FROM users WHERE user_id = ?`,
      [userId],
    );
    assert.equal(Boolean(unverifiedRows[0].is_verified), false);

    // 2. Now grant a fresh, unexpired token and verify it succeeds
    const freshRawToken = crypto.randomBytes(32).toString("hex");
    const freshTokenHash = hashVerificationToken(freshRawToken);
    const futureExpires = new Date(Date.now() + 24 * 3600 * 1000);
    await User.setVerificationTokenHash(userId, freshTokenHash, futureExpires);

    const verificationResult = await verifyEmail(freshRawToken);
    assert.ok(verificationResult.message.includes("successfully verified"));

    // Ensure database was updated: verified = true, token = null
    const [verifiedRows] = await pool.execute(
      `SELECT is_verified, verification_token FROM users WHERE user_id = ?`,
      [userId],
    );
    assert.equal(Boolean(verifiedRows[0].is_verified), true);
    assert.equal(verifiedRows[0].verification_token, null);

    // 3. One-time use: trying to verify again with the same token must fail
    await assert.rejects(
      async () => {
        await verifyEmail(freshRawToken);
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /Invalid or already used/i);
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 3: Migration Guard / Server Restart Idempotency
  // --------------------------------------------------------------------------
  it("Migration cutoff guard preserves unverified status of users created after the deploy timestamp", async () => {
    const testEmail = `new-signup-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("NewUser12345!");

    // Create a new user timestamped after the cutoff ('2026-10-16 08:23:00')
    const futureTimestamp = "2026-10-16 12:00:00";
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, created_at)
      VALUES (?, ?, ?, ?, FALSE, ?)
      `,
      ["New", "Student", testEmail, passwordHash, futureTimestamp],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // Simulate startup backfill query from initDb.js
    await pool.execute(
      `
      UPDATE users
      SET is_verified = TRUE
      WHERE is_verified = FALSE
        AND created_at < '2026-10-16 08:23:00'
        AND google_id IS NULL
      `,
    );

    // Verify the new user was NOT modified
    const [rows] = await pool.execute(
      `SELECT is_verified FROM users WHERE user_id = ?`,
      [userId],
    );
    assert.equal(
      Boolean(rows[0].is_verified),
      false,
      "New user created after cutoff must remain unverified across server restarts",
    );
  });

  // --------------------------------------------------------------------------
  // TEST 4: Login Order & Account Enumeration Prevention
  // --------------------------------------------------------------------------
  it("Validates password before unverified status to prevent unverified account leakage", async () => {
    const testEmail = `login-order-${Date.now()}@example.com`;
    const correctPassword = "CorrectPassword123!";
    const passwordHash = await hashPassword(correctPassword);

    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, FALSE)
      `,
      ["Login", "OrderTest", testEmail, passwordHash],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // 1. Wrong password on unverified account -> generic 401, NOT 403
    await assert.rejects(
      async () => {
        await loginUser({ email: testEmail, password: "WrongPassword999!" });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.message, "Incorrect email or password.");
        assert.equal(err.unverified, undefined);
        return true;
      },
    );

    // 2. Correct password on unverified account -> 403 unverified
    await assert.rejects(
      async () => {
        await loginUser({ email: testEmail, password: correctPassword });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.unverified, true);
        assert.match(err.message, /verify your email/i);
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 5: Unverified Re-Registration Token Refresh
  // --------------------------------------------------------------------------
  it("Updating unverified account refreshes password and token hash without duplicate error", async () => {
    const testEmail = `reregister-${Date.now()}@example.com`;
    const oldPassHash = await hashPassword("OldPassword123!");

    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, FALSE)
      `,
      ["Initial", "Name", testEmail, oldPassHash],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // User tries to register again with updated details and new password
    const newPassHash = await hashPassword("NewPassword456!");
    const newRawToken = crypto.randomBytes(32).toString("hex");
    const newTokenHash = hashVerificationToken(newRawToken);
    const newExpires = new Date(Date.now() + 24 * 3600 * 1000);

    const updatedUser = await User.updateUnverifiedRegistration(userId, {
      firstName: "Updated",
      lastName: "Student",
      passwordHash: newPassHash,
      tokenHash: newTokenHash,
      expiresAt: newExpires,
    });

    assert.equal(updatedUser.first_name, "Updated");
    assert.equal(updatedUser.last_name, "Student");

    // Verify token was stored and password updated
    const userWithPass = await User.findByIdWithPassword(userId);
    assert.notEqual(userWithPass.password_hash, oldPassHash);

    const foundByToken = await User.findByVerificationTokenHash(newTokenHash);
    assert.equal(foundByToken.user_id, userId);
  });
});
