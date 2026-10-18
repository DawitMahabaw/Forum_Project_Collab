import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isDisposableEmail,
  normalizeEmail,
  extractEmailDomain,
  validateEmailForRegistration,
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

describe("Asynchronous Email Validation & MX Record Checking", () => {
  it("passes validation when MX records exist (gmail.com with mock resolver)", async () => {
    const mockResolveMx = async (domain) => {
      assert.equal(domain, "gmail.com");
      return [{ exchange: "gmail-smtp-in.l.google.com", priority: 5 }];
    };

    const result = await validateEmailForRegistration("  Dawit@Gmail.COM ", {
      resolveMx: mockResolveMx,
    });

    assert.equal(result.normalizedEmail, "dawit@gmail.com");
    assert.equal(result.domain, "gmail.com");
    assert.equal(result.mxChecked, true);
    assert.equal(result.mxFallback, false);
  });

  it("rejects definitively nonexistent domain (ENOTFOUND) with HTTP 400", async () => {
    const mockResolveMx = async () => {
      const err = new Error("queryMx ENOTFOUND fake-nonexistent-domain.xyz");
      err.code = "ENOTFOUND";
      throw err;
    };

    await assert.rejects(
      async () => {
        await validateEmailForRegistration("student@fake-nonexistent-domain.xyz", {
          resolveMx: mockResolveMx,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.field, "email");
        assert.equal(
          err.message,
          "That email domain can't receive mail. Please check your email address.",
        );
        return true;
      },
    );
  });

  it("rejects domain with no MX records (ENODATA) with HTTP 400", async () => {
    const mockResolveMx = async () => {
      const err = new Error("queryMx ENODATA no-mail-domain.com");
      err.code = "ENODATA";
      throw err;
    };

    await assert.rejects(
      async () => {
        await validateEmailForRegistration("student@no-mail-domain.com", {
          resolveMx: mockResolveMx,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.field, "email");
        assert.equal(
          err.message,
          "That email domain can't receive mail. Please check your email address.",
        );
        return true;
      },
    );
  });

  it("rejects domain returning empty MX records array with HTTP 400", async () => {
    const mockResolveMx = async () => [];

    await assert.rejects(
      async () => {
        await validateEmailForRegistration("student@empty-mx.com", {
          resolveMx: mockResolveMx,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.field, "email");
        assert.equal(
          err.message,
          "That email domain can't receive mail. Please check your email address.",
        );
        return true;
      },
    );
  });

  it("fails open when DNS lookup times out beyond the waiting limit", async () => {
    // Resolver simulates a slow DNS server taking longer than timeoutMs
    const mockSlowResolveMx = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [{ exchange: "slow-mail.com", priority: 10 }];
    };

    const result = await validateEmailForRegistration("student@slow-network.com", {
      resolveMx: mockSlowResolveMx,
      timeoutMs: 50, // Short timeout for unit test
    });

    assert.equal(result.normalizedEmail, "student@slow-network.com");
    assert.equal(result.domain, "slow-network.com");
    assert.equal(result.mxChecked, false);
    assert.equal(result.mxFallback, true);
  });

  it("fails open when DNS returns temporary or ambiguous resolver errors (SERVFAIL)", async () => {
    const mockResolveMx = async () => {
      const err = new Error("queryMx ESERVFAIL");
      err.code = "ESERVFAIL";
      throw err;
    };

    const result = await validateEmailForRegistration("student@flaky-dns.org", {
      resolveMx: mockResolveMx,
    });

    assert.equal(result.normalizedEmail, "student@flaky-dns.org");
    assert.equal(result.mxChecked, false);
    assert.equal(result.mxFallback, true);
  });

  it("enforces validation order: invalid syntax rejected before disposable or MX check", async () => {
    let mxCalled = false;
    const mockResolveMx = async () => {
      mxCalled = true;
      return [{ exchange: "mail.com", priority: 10 }];
    };

    await assert.rejects(
      async () => {
        await validateEmailForRegistration("not-a-valid-email", {
          resolveMx: mockResolveMx,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, "Please provide a valid email address.");
        return true;
      },
    );

    assert.equal(mxCalled, false, "MX lookup must NOT be called on invalid syntax");
  });

  it("enforces validation order: disposable domain rejected before MX check even if MX exists", async () => {
    let mxCalled = false;
    const mockResolveMx = async () => {
      mxCalled = true;
      return [{ exchange: "mail.mailinator.com", priority: 10 }];
    };

    await assert.rejects(
      async () => {
        await validateEmailForRegistration("attacker@mailinator.com", {
          resolveMx: mockResolveMx,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes("permanent email address"));
        return true;
      },
    );

    assert.equal(mxCalled, false, "MX lookup must NOT be called for disposable domain");
  });

  it("passes real live DNS MX resolution for gmail.com", async () => {
    const result = await validateEmailForRegistration("realuser@gmail.com", {
      timeoutMs: 10000,
    });
    assert.equal(result.normalizedEmail, "realuser@gmail.com");
    assert.equal(result.domain, "gmail.com");
    assert.ok(
      result.mxChecked === true || result.mxFallback === true,
      "Valid gmail domain must never be rejected",
    );
  });

  it("rejects real live DNS query for definitely nonexistent domain", async () => {
    await assert.rejects(
      async () => {
        await validateEmailForRegistration(
          "user@thisdomaindoesnotexist12345.com",
          { timeoutMs: 10000 },
        );
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(
          err.message,
          "That email domain can't receive mail. Please check your email address.",
        );
        return true;
      },
    );
  });
});

