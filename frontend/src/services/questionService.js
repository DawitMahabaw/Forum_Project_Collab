import { apiClient } from "./api.js";

// Get the normal question feed.
export const getQuestions = async (params = {}) => {
  const response = await apiClient.get("/api/questions", {
    params,
  });

  return response.data;
};

// Search questions by keyword or the server's AI/semantic search mode.
export const searchQuestions = async (searchTerm, { mode = "keyword" } = {}) => {
  const response = await apiClient.get("/api/questions", {
    params: {
      search: searchTerm,
      ...(mode === "ai" ? { mode: "ai" } : {}),
    },
  });

  return response.data;
};

// Get one question by ID.
export const getQuestionById = async (questionId) => {
  const response = await apiClient.get(`/api/questions/${questionId}`);

  return response.data;
};
