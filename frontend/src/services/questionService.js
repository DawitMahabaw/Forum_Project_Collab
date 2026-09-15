import api from "./api.js";

// Get questions for the Dashboard discussion feed.
export const getQuestions = async () => {
  const response = await api.get("/questions");

  return response.data;
};
