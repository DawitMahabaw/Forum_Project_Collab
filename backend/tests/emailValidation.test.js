import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isDisposableEmail,
  normalizeEmail,
  extractEmailDomain,
  DISPOSABLE_EMAIL_ERROR_MESSAGE,
} from "../src/utils/emailValidation.js";

describe("Email Validation & Disposable Blocklist", () => {
  it("normalizes casing and leading/trailing whitespace", () => {
    assert.equal(normalizeEmail("  Dawit@Example.COM "), "dawit@example.com");
  });

  it("extracts the domain correctly", () => {
    assert.equal(extractEmailDomain("user@domain.com"), "domain.com");
    assert.equal(extractEmailDomain("user@sub.domain.co.uk"), "sub.domain.co.uk");
    assert.equal(extractEmailDomain("invalid-email"), "");
  });

  it("rejects direct disposable domains", () => {
    assert.equal(isDisposableEmail("test@mailinator.com"), true);
    assert.equal(isDisposableEmail("user@guerrillamail.com"), true);
    assert.equal(isDisposableEmail("temp@10minutemail.com"), true);
  });

  it("rejects subdomains of disposable domains", () => {
    assert.equal(isDisposableEmail("someone@sub.mailinator.com"), true);
    assert.equal(isDisposableEmail("someone@a.b.mailinator.com"), true);
  });

  it("normalizes email with uppercase and whitespace before checking", () => {
    assert.equal(isDisposableEmail("   USER@MAILINATOR.COM   "), true);
    assert.equal(isDisposableEmail("  TEST@SUB.GUERRILLAMAIL.COM  "), true);
  });

  it("never blocks major trusted providers", () => {
    const majorProviders = [
      "user@gmail.com",
      "user@googlemail.com",
      "user@outlook.com",
      "user@hotmail.com",
      "user@live.com",
      "user@yahoo.com",
      "user@icloud.com",
      "user@me.com",
      "user@proton.me",
      "user@protonmail.com",
      "user@zoho.com",
      "user@aol.com",
    ];

    for (const email of majorProviders) {
      assert.equal(
        isDisposableEmail(email),
        false,
        `Expected ${email} to not be blocked as disposable`,
      );
    }
  });

  it("allows standard organizational and personal domains", () => {
    assert.equal(isDisposableEmail("dawit@evangadi.com"), false);
    assert.equal(isDisposableEmail("student@aau.edu.et"), false);
  });

  it("exports friendly error message constant", () => {
    assert.ok(DISPOSABLE_EMAIL_ERROR_MESSAGE.includes("permanent email address"));
  });
});
