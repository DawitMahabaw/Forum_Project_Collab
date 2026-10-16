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
