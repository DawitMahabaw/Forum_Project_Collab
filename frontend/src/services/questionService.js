import { apiClient } from "./api.js";

// Get the normal question feed.
export const getQuestions = async (params = {}) => {
  const response = await apiClient.get("/api/questions", {
    params,
  });

  return response.data;
};

// Search questions by keyword.
export const searchQuestions = async (searchTerm) => {
  const response = await apiClient.get("/api/questions", {
    params: {
      search: searchTerm,
    },
  });

  return response.data;
};

// Get one question by ID.
export const getQuestionById = async (questionId) => {
  const response = await apiClient.get(`/api/questions/${questionId}`);

  return response.data;
};

// Create a new question.
export const createQuestion = async (questionData) => {
  const response = await apiClient.post("/api/questions", questionData);

  return response.data;
};
// ============================================================
// AI ANSWER FIT
// ============================================================

// Ask the backend to evaluate an answer against a question.
const getAnswerFit = async (questionHash, answerText) => {
  const response = await api.post(
    `/questions/${questionHash}/answer-fit`,
    {
      answerText,
    },
  );

  return response.data.data;
};

// ============================================================
// EXPORT
// ============================================================
export { getAnswerFit };
