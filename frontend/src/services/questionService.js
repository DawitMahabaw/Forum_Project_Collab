import { apiClient } from "./api.js";

// Get all questions for the Dashboard.
export const getQuestions = async (params = {}) => {
  const response = await apiClient.get("/questions", {
    params,
  });

  return response.data;
};

// Search questions using the backend question endpoint.
export const searchQuestions = async (searchTerm) => {
  const response = await apiClient.get("/questions", {
    params: {
      search: searchTerm,
    },
  });

  return response.data;
};

// Get one question by its ID.
export const getQuestionById = async (questionId) => {
  const response = await apiClient.get(`/questions/${questionId}`);

  return response.data;
};
