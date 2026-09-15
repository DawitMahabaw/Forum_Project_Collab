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
