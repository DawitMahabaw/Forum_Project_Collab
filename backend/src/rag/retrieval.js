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

  // Step 4: Calculate and clamp the maximum number of text chunks (K value) to return
  const limit = Math.min(
    Math.max(Number(requestedK) || env.semanticSearch.defaultK, 1),
    env.semanticSearch.maxK,
  );

  // Step 5: Retrieve all prepared vectors belonging to this specific document from the database
  const readyChunks = await Document.findReadyChunks(document.documentId);

    // Step 6: Loop through chunks to calculate similarity scores and rank them by relevance
  const results = readyChunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryResult.embedding, chunk.embedding),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map(({ chunkId, chunkIndex, content, score }) => ({
      chunkId,
      chunkIndex,
      score,
      excerpt: content,
    }));

  // Step 7: Return the original plain text search string along with the ranked results array
  return { query, results };
};

export { searchDocument };
