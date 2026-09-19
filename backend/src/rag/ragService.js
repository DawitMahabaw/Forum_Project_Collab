import env from "../config/env.js";
import * as ai from "../ai/gemini.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import Document from "../models/Document.js";
import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { splitText } from "./chunking.js";

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

  // Step 4: Calculate and clamp the maximum number of text chunks (K value) to return
  const limit = Math.min(
    Math.max(Number(requestedK) || env.semanticSearch.defaultK, 1),
    env.semanticSearch.maxK,
  );

  // Step 5: Retrieve all prepared vectors belonging to this specific document from the database
  const chunks = await Document.findReadyChunks(document.documentId);

  // Step 6: Loop through chunks to calculate similarity scores and rank them by relevance
  return (
    chunks
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
      }))
  );
};


// Main orchestration entry point called directly by your document controller
const searchDocument = async (document, query, requestedK) => {
  return {
    query,
    results: await rankDocumentChunks(document, query, requestedK),
  };
};

// --- TASK T-22 ADDITIONS: PDF Extraction & Processing ---

const extractText = async (filePath) => {
  const parser = new PDFParse({ data: await fs.readFile(filePath) });
  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
};



export { searchDocument };

