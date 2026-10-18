import api from "./api.js";

/**
 * Send a message to the source-grounded AI Assistant.
 * @param {string} message - User query
 * @param {Array} history - Previous conversation messages [{role, content}]
 * @returns {Promise<{success: boolean, answer: string, sources: Array, suggestedFollowUps: Array}>}
 */
export const sendAssistantMessage = async (message, history = []) => {
  const response = await api.post("/assistant/chat", {
    message,
    history,
  });
  return response.data;
};
