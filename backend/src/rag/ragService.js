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
}