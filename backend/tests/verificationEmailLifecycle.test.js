import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import pool from "../src/config/db.js";
import User from "../src/models/User.js";
import {
  registerUser,
  loginUser,
  resendVerification,
  verifyEmail,
  updateUserAccount,
  hashVerificationToken,
  setMailSenderHook,
  GENERIC_RESEND_RESPONSE,
} from "../src/services/authService.js";
import { hashPassword } from "../src/utils/password.js";

describe("Verification Email Lifecycle & Dispatch Rules Suite", () => {
  const createdUserIds = [];
  const sentEmails = [];

  before(() => {
    // Install deterministic test mailer hook
    setMailSenderHook(async (mailData) => {
      sentEmails.push(mailData);
    });
  });

  beforeEach(() => {
    sentEmails.length = 0;
  });

  after(async () => {
    // Reset mailer hook
    setMailSenderHook(null);

    // Clean up all seeded test users
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
  // 1. Password-based Signup
  // --------------------------------------------------------------------------
  it("Signup sends exactly one email and issues no JWT", async () => {
    const email = `signup-test-${Date.now()}@gmail.com`;
    const password = "StrongPassword123!";

    const result = await registerUser({
      firstName: "Alice",
      lastName: "Developer",
      email,
      password,
    });

    const user = await User.findByEmail(email);
    assert.ok(user, "User must be created in DB");
    createdUserIds.push(user.user_id);

    // Verify unverified status and no JWT issued
    assert.equal(result.unverified, true);
    assert.equal(result.token, undefined, "Signup must issue NO JWT");
    assert.equal(Boolean(user.is_verified), false, "User must start unverified");

    // Verify exactly one email was sent
    assert.equal(sentEmails.length, 1, "Signup must send exactly one verification email");
    assert.equal(sentEmails[0].email, email);
    assert.equal(sentEmails[0].firstName, "Alice");
    assert.ok(sentEmails[0].rawToken, "Verification email must contain rawToken");

    // Verify token hash and expiration
    const expectedHash = hashVerificationToken(sentEmails[0].rawToken);
    assert.equal(user.verification_token, expectedHash);
    assert.ok(
      new Date(user.verification_expires).getTime() > Date.now(),
      "Verification expiry must be in the future",
    );
  });

  // --------------------------------------------------------------------------
  // 2. Resend within cooldown
  // --------------------------------------------------------------------------
  it("Resend within the cooldown sends nothing but returns the same generic response", async () => {
    const email = `cooldown-test-${Date.now()}@gmail.com`;
    const password = "StrongPassword123!";

    await registerUser({
      firstName: "Bob",
      lastName: "Cooldown",
      email,
      password,
    });
    const user = await User.findByEmail(email);
    createdUserIds.push(user.user_id);

    // Clear sent emails from initial signup
    sentEmails.length = 0;
    const initialToken = user.verification_token;

    // Resend immediately while cooldown (60s) is active
    const resendResult = await resendVerification(email);

    // Must return the exact generic response
    assert.equal(resendResult.message, GENERIC_RESEND_RESPONSE);

    // Must send NO email
    assert.equal(
      sentEmails.length,
      0,
      "Resend during cooldown must NOT send an email",
    );

    // Token must remain unchanged
    const afterUser = await User.findByEmail(email);
    assert.equal(
      afterUser.verification_token,
      initialToken,
      "Token must not be modified during cooldown",
    );
  });

  // --------------------------------------------------------------------------
  // 3. Resend after cooldown
  // --------------------------------------------------------------------------
  it("Resend after the cooldown sends one email and invalidates the old token", async () => {
    const email = `after-cooldown-${Date.now()}@gmail.com`;
    const password = "StrongPassword123!";

    await registerUser({
      firstName: "Charlie",
      lastName: "CooldownPass",
      email,
      password,
    });
    const user = await User.findByEmail(email);
    createdUserIds.push(user.user_id);
    const oldTokenHash = user.verification_token;

    // Simulate elapsed cooldown by setting verification_expires back 70 seconds
    const simulatedOldExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 70 * 1000,
    );
    await pool.execute(
      "UPDATE users SET verification_expires = ? WHERE user_id = ?",
      [simulatedOldExpiry, user.user_id],
    );

    sentEmails.length = 0;

    // Request resend after cooldown has elapsed
    const resendResult = await resendVerification(email);

    assert.equal(resendResult.message, GENERIC_RESEND_RESPONSE);
    assert.equal(
      sentEmails.length,
      1,
      "Resend after cooldown must dispatch exactly one email",
    );
    assert.equal(sentEmails[0].email, email);

    // Verify token hash is refreshed and old token invalidated
    const updatedUser = await User.findByEmail(email);
    assert.notEqual(
      updatedUser.verification_token,
      oldTokenHash,
      "Old verification token must be invalidated",
    );
    const expectedNewHash = hashVerificationToken(sentEmails[0].rawToken);
    assert.equal(updatedUser.verification_token, expectedNewHash);
  });

  // --------------------------------------------------------------------------
  // 4. Resend enumeration resistance
  // --------------------------------------------------------------------------
  it("Resend for a nonexistent email, a verified account, and a Google account returns the same generic response and sends nothing", async () => {
    // 4a. Nonexistent email
    sentEmails.length = 0;
    const nonExistentEmail = `does-not-exist-${Date.now()}@gmail.com`;
    const nonExistentResult = await resendVerification(nonExistentEmail);
    assert.equal(nonExistentResult.message, GENERIC_RESEND_RESPONSE);
    assert.equal(sentEmails.length, 0, "Must not send email for nonexistent account");

    // 4b. Verified account
    const verifiedEmail = `already-verified-${Date.now()}@gmail.com`;
    const [verifiedInsert] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Verified", "User", verifiedEmail, await hashPassword("VerifiedPass123!")],
    );
    createdUserIds.push(verifiedInsert.insertId);

    sentEmails.length = 0;
    const verifiedResult = await resendVerification(verifiedEmail);
    assert.equal(verifiedResult.message, GENERIC_RESEND_RESPONSE);
    assert.equal(sentEmails.length, 0, "Must not send email for verified account");

    // 4c. Google account
    const googleEmail = `google-account-${Date.now()}@gmail.com`;
    const [googleInsert] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, google_id, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Google", "User", googleEmail, `sub-${Date.now()}`],
    );
    createdUserIds.push(googleInsert.insertId);

    sentEmails.length = 0;
    const googleResult = await resendVerification(googleEmail);
    assert.equal(googleResult.message, GENERIC_RESEND_RESPONSE);
    assert.equal(sentEmails.length, 0, "Must not send email for Google account");
  });

  // --------------------------------------------------------------------------
  // 5. Re-registering with unverified email
  // --------------------------------------------------------------------------
  it("Re-registering with an unverified email refreshes the token and sends one email, with no duplicate-row error", async () => {
    const email = `reregister-unverified-${Date.now()}@gmail.com`;
    const oldPassword = "OldPassword123!";
    const newPassword = "NewStrongPassword456!";

    // First registration
    await registerUser({
      firstName: "Dave",
      lastName: "FirstReg",
      email,
      password: oldPassword,
    });
    const firstUser = await User.findByEmail(email);
    createdUserIds.push(firstUser.user_id);
    const firstTokenHash = firstUser.verification_token;

    // Simulate cooldown elapsed so re-registration issues a fresh token & link
    const simulatedOldExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 70 * 1000,
    );
    await pool.execute(
      "UPDATE users SET verification_expires = ? WHERE user_id = ?",
      [simulatedOldExpiry, firstUser.user_id],
    );

    sentEmails.length = 0;

    // Re-register with the same email and new password
    const reRegisterResult = await registerUser({
      firstName: "David",
      lastName: "UpdatedReg",
      email,
      password: newPassword,
    });

    assert.equal(reRegisterResult.unverified, true);
    assert.equal(sentEmails.length, 1, "Re-registration outside cooldown must dispatch one email");
    assert.equal(sentEmails[0].email, email);

    // Verify row was updated, NOT duplicated
    const [countRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users WHERE email = ?",
      [email],
    );
    assert.equal(countRows[0].total, 1, "Must not create duplicate row in database");

    // Verify updated details and refreshed token
    const updatedUser = await User.findByEmail(email);
    assert.equal(updatedUser.first_name, "David");
    assert.notEqual(
      updatedUser.verification_token,
      firstTokenHash,
      "Verification token must be refreshed on re-registration",
    );
  });

  // --------------------------------------------------------------------------
  // 6. Re-registering with verified or Google email
  // --------------------------------------------------------------------------
  it("Re-registering with a verified or Google email does not send an email", async () => {
    // 6a. Verified email
    const verifiedEmail = `verified-re-reg-${Date.now()}@gmail.com`;
    const [verifiedInsert] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Verified", "Student", verifiedEmail, await hashPassword("Verified123!")],
    );
    createdUserIds.push(verifiedInsert.insertId);

    sentEmails.length = 0;
    await assert.rejects(
      async () => {
        await registerUser({
          firstName: "Duplicate",
          lastName: "Attempt",
          email: verifiedEmail,
          password: "NewPassword123!",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.equal(err.message, "An account with this email already exists.");
        return true;
      },
    );
    assert.equal(sentEmails.length, 0, "Must not send email on verified email re-registration");

    // 6b. Google account email
    const googleEmail = `google-re-reg-${Date.now()}@gmail.com`;
    const [googleInsert] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, google_id, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Google", "User", googleEmail, `sub-reg-${Date.now()}`],
    );
    createdUserIds.push(googleInsert.insertId);

    sentEmails.length = 0;
    await assert.rejects(
      async () => {
        await registerUser({
          firstName: "Duplicate",
          lastName: "Attempt",
          email: googleEmail,
          password: "NewPassword123!",
        });
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.equal(err.message, "An account with this email already exists.");
        return true;
      },
    );
    assert.equal(sentEmails.length, 0, "Must not send email on Google email re-registration");
  });

  // --------------------------------------------------------------------------
  // 7. Login sends NO email
  // --------------------------------------------------------------------------
  it("Login with an unverified account, with the correct or wrong password, sends no email", async () => {
    const email = `login-no-email-${Date.now()}@gmail.com`;
    const password = "CorrectPassword123!";
    const passwordHash = await hashPassword(password);

    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, FALSE)
      `,
      ["Login", "Test", email, passwordHash],
    );
    createdUserIds.push(insertResult.insertId);

    sentEmails.length = 0;

    // 7a. Login with wrong password
    await assert.rejects(
      async () => {
        await loginUser({ email, password: "WrongPassword123!" });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        return true;
      },
    );
    assert.equal(sentEmails.length, 0, "Wrong password login must send no email");

    // 7b. Login with correct password on unverified account
    await assert.rejects(
      async () => {
        await loginUser({ email, password });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.unverified, true);
        return true;
      },
    );
    assert.equal(
      sentEmails.length,
      0,
      "Correct password unverified login must send no email automatically",
    );
  });

  // --------------------------------------------------------------------------
  // 8. Email send failure at signup keeps account and returns resend guidance
  // --------------------------------------------------------------------------
  it("Email send failure at signup keeps the account and returns the resend guidance", async () => {
    const email = `smtp-fail-${Date.now()}@gmail.com`;
    const password = "StrongPassword123!";

    // Configure hook to simulate network or SMTP failure
    setMailSenderHook(async () => {
      throw new Error("SMTP connection refused: connection timed out");
    });

    const result = await registerUser({
      firstName: "Frank",
      lastName: "MailerFailure",
      email,
      password,
    });

    // Restore standard recording hook
    setMailSenderHook(async (mailData) => {
      sentEmails.push(mailData);
    });

    // Account MUST still exist in database as unverified
    const user = await User.findByEmail(email);
    assert.ok(user, "Account must be kept in database even if email delivery fails");
    createdUserIds.push(user.user_id);
    assert.equal(Boolean(user.is_verified), false);

    // Must return guidance pointing the user to "Resend verification email"
    assert.equal(result.unverified, true);
    assert.match(
      result.message,
      /Resend verification/i,
      "Message must instruct user to use resend verification",
    );
  });

  // --------------------------------------------------------------------------
  // 9. Email change: pending email only takes effect after verification
  // --------------------------------------------------------------------------
  it("If email change is implemented: the pending email only takes effect after verification", async () => {
    const oldEmail = `old-email-${Date.now()}@gmail.com`;
    const newEmail = `new-email-${Date.now()}@gmail.com`;
    const passwordHash = await hashPassword("AccountPass123!");

    // Create active verified user
    const [insertResult] = await pool.execute(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, TRUE)
      `,
      ["Grace", "Hopper", oldEmail, passwordHash],
    );
    const userId = insertResult.insertId;
    createdUserIds.push(userId);

    sentEmails.length = 0;

    // Request account update with a new email address
    const updateResult = await updateUserAccount(userId, {
      firstName: "Grace",
      lastName: "Hopper",
      email: newEmail,
    });

    // Old email MUST still be active
    assert.equal(updateResult.email, oldEmail, "Active email must remain unchanged");
    assert.equal(updateResult.pendingEmail, newEmail, "New email must be stored as pending");

    const dbUserBefore = await User.findById(userId);
    assert.equal(dbUserBefore.email, oldEmail, "Database email must not change yet");
    assert.equal(dbUserBefore.pending_email, newEmail, "Database must store pending_email");

    // Verification link must have been sent to NEW address ONLY
    assert.equal(sentEmails.length, 1, "Verification email must be sent to the new address");
    assert.equal(sentEmails[0].email, newEmail);
    assert.notEqual(sentEmails[0].email, oldEmail);

    const changeRawToken = sentEmails[0].rawToken;

    // Confirm verification using the token sent to the new address
    const verifyResult = await verifyEmail(changeRawToken);
    assert.match(verifyResult.message, /verified and updated/i);

    // Now inspect database: email must be updated to newEmail and pending_email cleared
    const dbUserAfter = await User.findById(userId);
    assert.equal(dbUserAfter.email, newEmail, "Email must now be updated to new email");
    assert.equal(dbUserAfter.pending_email, null, "pending_email must be cleared");
    assert.equal(Boolean(dbUserAfter.is_verified), true);
  });
});
