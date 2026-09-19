import env from "../config/env.js";
import Document from "../models/Document.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import { embedContent } from "../ai/gemini.js";

const searchDocument = async (document, query, requestedK) => {
  // Step 1: Prevent searching if the document processing is not finished
  if (document.status !== "ready") {
    const error = new Error("This document is still processing.");
    error.statusCode = 409;
    throw error;
  }

  // Step 2: Request the AI service to generate a vector embedding for the search query string
  const queryResult = await embedContent(query, "RETRIEVAL_QUERY");

  // Step 3: Handle embedding errors cleanly if the external AI service fails
  if (!queryResult.success) {
    const error = new Error(
      "The AI search service is temporarily unavailable.",
    );
    error.statusCode = 502;
    throw error;
  }
};