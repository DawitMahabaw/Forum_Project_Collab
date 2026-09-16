import crypto from "crypto";

const generateQuestionHash = () => {
  return crypto.randomBytes(32).toString("hex");
};

export { generateQuestionHash };
