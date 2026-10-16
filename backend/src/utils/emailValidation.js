import dns from "node:dns";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rawDisposableDomains = require("disposable-email-domains");

// Maintain an O(1) lookup set of disposable domains
const disposableSet = new Set(
  rawDisposableDomains.map((d) => String(d).trim().toLowerCase()).filter(Boolean),
);

// Optional extra domains from environment variable (comma or space separated)
const extraDomainsEnv = process.env.DISPOSABLE_DOMAINS_EXTRA || "";
if (extraDomainsEnv) {
  extraDomainsEnv
    .split(/[\s,]+/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
    .forEach((d) => disposableSet.add(d));
}

// Major trusted providers that must NEVER be blocked
const TRUSTED_MAJOR_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "myyahoo.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "mail.com",
]);

export const DISPOSABLE_EMAIL_ERROR_MESSAGE =
  "Please use a permanent email address. Temporary or disposable email services aren't supported.";

export const INVALID_MX_ERROR_MESSAGE =
  "That email domain can't receive mail. Please check your email address.";

export const INVALID_EMAIL_SYNTAX_MESSAGE =
  "Please provide a valid email address.";

const EMAIL_SYNTAX_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an email string (trims and converts to lowercase).
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Extracts the domain portion of an email.
 * @param {string} email
 * @returns {string}
 */
export function extractEmailDomain(email) {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex === -1 || atIndex === normalized.length - 1) return "";
  return normalized.slice(atIndex + 1);
}

/**
 * Checks whether an email address uses a disposable or temporary domain.
 * Inspects the exact domain and all parent domains (e.g. sub.mailinator.com -> mailinator.com).
 * Guarantees that major trusted providers are never marked as disposable.
 *
 * @param {string} email
 * @returns {boolean} true if disposable, false otherwise
 */
export function isDisposableEmail(email) {
  const domain = extractEmailDomain(email);
  if (!domain) return false;

  // Never block major trusted email providers
  if (TRUSTED_MAJOR_PROVIDERS.has(domain)) {
    return false;
  }

  // Check the exact domain and parent domain hierarchy
  const parts = domain.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".");
    if (disposableSet.has(candidate)) {
      return true;
    }
  }

  return false;
}

/**
 * Asynchronously validates an email for password-based registration or resend requests.
 *
 * Validation Order:
 * 1. Normalize email using trim() and toLowerCase().
 * 2. Validate email syntax.
 * 3. Reject known disposable email domains using the existing disposable-domain checker.
 * 4. Check the email domain's MX records using Node.js dns.promises.resolveMx().
 *
 * Timeout & Resolver Behavior:
 * - A genuine 3-second waiting limit (timeoutMs) is enforced for the MX lookup.
 * - Note on timeout: The timeout timer stops waiting for the DNS result and allows the
 *   registration flow to proceed; it does not cancel the underlying operating-system
 *   DNS resolution query if it is already in flight.
 * - Temporary failures (ETIMEOUT, SERVFAIL, ECONNREFUSED, EREFUSED, etc.) fail open,
 *   allowing the user to proceed to email verification.
 * - Definitive failures (ENOTFOUND, ENODATA, ENOTIMP, EBADNAME, or empty MX records)
 *   are rejected with HTTP 400: "That email domain can't receive mail. Please check your email address."
 * - Notice: An MX lookup confirms that the domain has mail exchange servers configured.
 *   It is NOT proof that an individual recipient mailbox exists.
 *
 * @param {string} email
 * @param {object} [options]
 * @param {Function} [options.resolveMx] Injectable DNS resolver function for testing
 * @param {number} [options.timeoutMs] Waiting limit in milliseconds (defaults to 3000)
 * @returns {Promise<{ normalizedEmail: string, domain: string, mxChecked: boolean, mxFallback: boolean }>}
 */
export async function validateEmailForRegistration(
  email,
  { resolveMx = dns.promises.resolveMx, timeoutMs = 3000 } = {},
) {
  // 1. Normalize
  const normalized = normalizeEmail(email);

  // 2. Syntax validation
  if (!normalized || !EMAIL_SYNTAX_PATTERN.test(normalized)) {
    const error = new Error(INVALID_EMAIL_SYNTAX_MESSAGE);
    error.statusCode = 400;
    error.field = "email";
    throw error;
  }

  // 3. Disposable domain check
  if (isDisposableEmail(normalized)) {
    const error = new Error(DISPOSABLE_EMAIL_ERROR_MESSAGE);
    error.statusCode = 400;
    error.field = "email";
    throw error;
  }

  // 4. MX Record Lookup
  const domain = extractEmailDomain(normalized);

  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const timeoutErr = new Error("DNS MX lookup timed out");
      timeoutErr.code = "ETIMEOUT";
      reject(timeoutErr);
    }, timeoutMs);
  });

  try {
    const records = await Promise.race([
      resolveMx(domain),
      timeoutPromise,
    ]);

    // If records resolved to empty array or missing exchange
    if (!Array.isArray(records) || records.length === 0 || !records.some((r) => r && r.exchange)) {
      const error = new Error(INVALID_MX_ERROR_MESSAGE);
      error.statusCode = 400;
      error.field = "email";
      throw error;
    }

    return { normalizedEmail: normalized, domain, mxChecked: true, mxFallback: false };
  } catch (err) {
    if (err.statusCode === 400) {
      throw err;
    }

    // Definitive non-existence or lack of MX records
    const definitiveFailureCodes = new Set([
      "ENOTFOUND",
      "ENODATA",
      "ENOTIMP",
      "EBADNAME",
    ]);

    if (definitiveFailureCodes.has(err.code)) {
      const error = new Error(INVALID_MX_ERROR_MESSAGE);
      error.statusCode = 400;
      error.field = "email";
      throw error;
    }

    // Fail open for temporary resolver errors or timeout
    console.warn(
      `[DNS MX Warning]: Resolver returned ${err.code || err.message} for domain "${domain}". Failing open to verification email.`,
    );

    return { normalizedEmail: normalized, domain, mxChecked: false, mxFallback: true };
  } finally {
    clearTimeout(timerId);
  }
}

