import Question from "../models/Question.js";
import { generateQuestionHash } from "../utils/questionHash.js";

const createQuestionService = async ({ title, content, userId }) => {
  const questionHash = generateQuestionHash();

  const questionId = await Question.create({
    questionHash,
    userId,
    title,
    content,
  });

  return {
    id: questionId,
    questionHash,
    title,
    content,
  };
};

export { createQuestionService };
