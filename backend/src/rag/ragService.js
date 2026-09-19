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

const processDocument = async (documentId, filePath) => {
  try {
    const rawText = await extractText(filePath);
    const chunks = splitText(rawText);
    if (!chunks.length) {
      throw new Error("The PDF does not contain readable text.");
    }
for (let index = 0; index < chunks.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const embeddingResult = await ai.embedContent(
        chunks[index],
        "RETRIEVAL_DOCUMENT",
      );
if (!embeddingResult.success) {
        throw new Error("Could not generate document embeddings.");
      }

// eslint-disable-next-line no-await-in-loop
      const chunkId = await Document.addChunk(documentId, index, chunks[index]);

// eslint-disable-next-line no-await-in-loop
      await Document.addChunkVector(chunkId, embeddingResult.embedding);
    }
await Document.updateStatus(documentId, "ready");
  } catch (error) {
    await Document.updateStatus(
      documentId,
      "failed",
      error.message || "Document processing failed.",
    );
  }
};
const createDocument = async ({ userId, file }) => {
  const documentId = await Document.create({
    userId,
    title: file.originalname,
    mimeType: file.mimetype,
    storagePath: path.resolve(file.path),
    byteSize: file.size,
  });
void processDocument(documentId, path.resolve(file.path));

  return Document.findByIdForUser(documentId, userId);
};
const noEvidenceAnswer = (query) =>
  `The provided documents do not include the information: ${query}`;

const parseGroundedAnswer = (rawText) => {
  const jsonText = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");




export { searchDocument };

