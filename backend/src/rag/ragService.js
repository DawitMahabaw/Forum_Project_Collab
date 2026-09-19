import env from "../config/env.js";
import * as ai from "../ai/gemini.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import Document from "../models/Document.js";

const rankDocumentChunks = async (document, query, requestedK) => {
  // Step 1: Ensure the document processing is completely finished before allowing a search
  if (document.status !== "ready") {
    const error = new Error("This document is still processing.");
    error.statusCode = 409;
    throw error;
  }

  // Step 2: Request the AI service to generate a vector embedding for the search query string
  const queryResult = await ai.embedContent(query, "RETRIEVAL_QUERY");

  // Step 3: Handle embedding errors cleanly if the external AI service fails or times out
  if (!queryResult.success) {
    const error = new Error(
      "Search is taking longer than usual. Please try again in a moment.",
    );
    error.statusCode = 503;
    throw error;
  }
};