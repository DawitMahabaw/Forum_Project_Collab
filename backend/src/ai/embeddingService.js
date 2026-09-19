import { embedContent } from "./gemini.js";
/**
 * Generates vector embeddings for a given text chunk using Gemini API.
 * @param {string} text - The text string to embed.
 * @param {string} [taskType="RETRIEVAL_DOCUMENT"] - Task intent type.
 * @returns {Promise<{ success: boolean, embedding?: number[], error?: string }>}
 */
const createEmbedding = async (text, taskType = "RETRIEVAL_DOCUMENT") => {
if (!text || typeof text !== "string") {
    return {
      success: false,
      error: "Invalid input: Text content must be a non-empty string.",
    };
  }
export { embedContent };
export const createEmbedding = embedContent;
