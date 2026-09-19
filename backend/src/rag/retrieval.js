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
}