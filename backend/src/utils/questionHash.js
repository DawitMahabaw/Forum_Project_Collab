import crypto from "crypto";

// Earlier versions stored 16-character public IDs. Keep those links valid
// while new questions use the 64-character IDs generated below.
const QUESTION_HASH_PATTERN = /^(?:[a-f0-9]{16}|[a-f0-9]{64})$/i;

const generateQuestionHash = () => {
  return crypto.randomBytes(32).toString("hex");
};

const isQuestionHash = (value) =>
  typeof value === "string" && QUESTION_HASH_PATTERN.test(value);

export { generateQuestionHash, isQuestionHash };
