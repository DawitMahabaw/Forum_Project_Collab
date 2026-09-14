import Question from "../models/Question.js";

// GET /api/questions
const getQuestionsService = async ({ search, onlyMine, userId }) => {
  const questions = await Question.findMany({
    search: search || null,
    userId: onlyMine ? userId : null,
  });

  return {
    questions,
    meta: {
      limit: 100,
      total: questions.length,
      sortBy: "newest",
      sortOrder: "desc",
    },
  };
};

export { getQuestionsService };