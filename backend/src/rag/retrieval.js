import env from "../config/env.js";
import Document from "../models/Document.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import { embedContent, generateContent } from "../ai/gemini.js";

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

const queryDocument = async (document, query) => {
  const retrieval = await searchDocument(document, query);

  if (!retrieval.results.length) {

    return {
      answer:
        "I could not find relevant text in this document for that question.",

      citations: [],

      chunksUsed: [],
    };
  }

  const context = retrieval.results
    .map((result, index) => `[${index + 1}] ${result.excerpt}`)

    .join("\n\n");

  const answer = await generateContent(
    `Answer the user's question using only the provided document excerpts. If the answer is not present, say so clearly. Cite supporting excerpts using [1], [2], etc.\n\nQuestion: ${query}\n\nDocument excerpts:\n${context}`,
  );

  return {
    answer,
    citations: retrieval.results.map((result, index) => ({
      ref: index + 1,

      chunkIndex: result.chunkIndex,

      excerpt: result.excerpt,
    })),

    chunksUsed: retrieval.results.map((result) => result.chunkId),
  };
};

export { queryDocument, searchDocument };
