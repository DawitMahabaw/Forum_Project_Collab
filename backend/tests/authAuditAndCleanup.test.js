import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import pool from "../src/config/db.js";
import User from "../src/models/User.js";
import authenticate from "../src/middleware/authMiddleware.js";
import { generateToken } from "../src/utils/jwt.js";
import { hashPassword } from "../src/utils/password.js";
import { cleanupUnverifiedAccounts } from "../src/utils/cleanupUnverifiedAccounts.js";

describe("Authentication Enforcement & Scheduled Cleanup Suite", () => {
  const createdUserIds = [];

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
  // TEST 1: Protected Route Enforcement in authMiddleware
  // --------------------------------------------------------------------------
  it("rejects unverified user with valid JWT accessing protected route with HTTP 403", async () => {
    const testEmail = `unverified-jwt-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("ValidPassword123!");

    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, FALSE)
      `,
      ["Unverified", "Tester", testEmail, passwordHash],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    // Create a syntactically valid JWT for this user
    const validJwt = generateToken(userId);

    const req = {
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    };
    const res = {};

    await assert.rejects(
      async () => {
        await new Promise((resolve, reject) => {
          authenticate(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.unverified, true);
        assert.match(err.message, /verify your email address/i);
        return true;
      },
    );
  });

  it("allows verified user with valid JWT accessing protected route", async () => {
    const testEmail = `verified-jwt-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("ValidPassword123!");

    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Verified", "Tester", testEmail, passwordHash],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    const validJwt = generateToken(userId);

    const req = {
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    };
    const res = {};

    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    assert.equal(req.user.userId, userId);
    assert.equal(req.user.email, testEmail);
  });

  it("rejects token when user account no longer exists in database", async () => {
    const nonexistentUserId = 99999999;
    const jwt = generateToken(nonexistentUserId);

    const req = {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    };
    const res = {};

    await assert.rejects(
      async () => {
        await new Promise((resolve, reject) => {
          authenticate(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /no longer exists/i);
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 2: Scheduled Cleanup Job for Stale Unverified Accounts
  // --------------------------------------------------------------------------
  it("deletes password-based unverified accounts older than 7 days", async () => {
    const staleEmail = `stale-unverified-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("StaleUser123!");

    // Insert account with created_at 8 days ago
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, created_at)
      VALUES (?, ?, ?, ?, FALSE, NOW() - INTERVAL 8 DAY)
      `,
      ["Stale", "Account", staleEmail, passwordHash],
    );
    const staleUserId = insertResult.insertId;
    createdUserIds.push(staleUserId);

    // Run cleanup job with retentionDays = 7
    const cleanupResult = await cleanupUnverifiedAccounts({ retentionDays: 7 });
    assert.ok(cleanupResult.deletedCount >= 1);

    // Verify stale account is deleted
    const [rows] = await pool.execute(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [staleUserId],
    );
    assert.equal(rows.length, 0, "Stale unverified account must be deleted");
  });

  it("never deletes unverified accounts created within the retention window (e.g., 2 days old)", async () => {
    const recentEmail = `recent-unverified-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("RecentUser123!");

    // Insert account with created_at 2 days ago
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, created_at)
      VALUES (?, ?, ?, ?, FALSE, NOW() - INTERVAL 2 DAY)
      `,
      ["Recent", "Account", recentEmail, passwordHash],
    );
    const recentUserId = insertResult.insertId;
    createdUserIds.push(recentUserId);

    // Run cleanup job with retentionDays = 7
    await cleanupUnverifiedAccounts({ retentionDays: 7 });

    // Verify recent account was NOT deleted
    const [rows] = await pool.execute(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [recentUserId],
    );
    assert.equal(rows.length, 1, "Recent unverified account must be preserved");
  });

  it("never deletes verified accounts even if older than 7 days", async () => {
    const verifiedOldEmail = `verified-old-${Date.now()}@example.com`;
    const passwordHash = await hashPassword("VerifiedOld123!");

    // Insert verified account with created_at 30 days ago
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified, created_at)
      VALUES (?, ?, ?, ?, TRUE, NOW() - INTERVAL 30 DAY)
      `,
      ["Old", "Verified", verifiedOldEmail, passwordHash],
    );
    const verifiedUserId = insertResult.insertId;
    createdUserIds.push(verifiedUserId);

    // Run cleanup job with retentionDays = 7
    await cleanupUnverifiedAccounts({ retentionDays: 7 });

    // Verify verified account was NOT deleted
    const [rows] = await pool.execute(
      `SELECT user_id, is_verified FROM users WHERE user_id = ?`,
      [verifiedUserId],
    );
    assert.equal(rows.length, 1, "Verified account must never be deleted");
    assert.equal(Boolean(rows[0].is_verified), true);
  });

  it("never deletes Google accounts even if older than 7 days", async () => {
    const googleOldEmail = `google-old-${Date.now()}@example.com`;
    const googleSub = `google-sub-old-${Date.now()}`;

    // Insert Google account with created_at 30 days ago
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, google_id, password_hash, is_verified, created_at)
      VALUES (?, ?, ?, ?, NULL, TRUE, NOW() - INTERVAL 30 DAY)
      `,
      ["Old", "GoogleUser", googleOldEmail, googleSub],
    );
    const googleUserId = insertResult.insertId;
    createdUserIds.push(googleUserId);

    // Run cleanup job with retentionDays = 7
    await cleanupUnverifiedAccounts({ retentionDays: 7 });

    // Verify Google account was NOT deleted
    const [rows] = await pool.execute(
      `SELECT user_id, google_id FROM users WHERE user_id = ?`,
      [googleUserId],
    );
    assert.equal(rows.length, 1, "Google account must never be deleted");
    assert.equal(rows[0].google_id, googleSub);
  });
});
