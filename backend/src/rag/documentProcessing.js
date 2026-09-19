import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import Document from "../models/Document.js";
import { embedContent } from "../ai/gemini.js";
import { splitText } from "./chunking.js";

/**
 * Task: Extract raw text content from a PDF file.
 * Reads the file asynchronously and cleans up parser resources afterwards.
 */
const extractText = async (filePath) => {
  const parser = new PDFParse({ data: await fs.readFile(filePath) });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
};

/**
 * Task: Execute the complete RAG document processing pipeline.
 * Extracts text, splits it into overlapping chunks, generates Gemini vector
 * embeddings, stores chunks and vectors in the database, and updates status.
 */
const processDocument = async (documentId, filePath) => {
  try {
    // Step 1: Extract text from PDF
    const text = await extractText(filePath);
    
    // Step 2: Split text into chunks (1000 chars, 120 overlap)
    const chunks = splitText(text, 1000, 120);

    if (!chunks.length) {
      throw new Error("The PDF does not contain readable text.");
    }

    // Step 3: Loop through chunks, generate embeddings, and persist to database
    for (let index = 0; index < chunks.length; index += 1) {
      const embeddingResult = await embedContent(
        chunks[index],
        "RETRIEVAL_DOCUMENT"
      );

      if (!embeddingResult.success) {
        throw new Error("Could not generate document embeddings.");
      }

      // Save chunk text and vector embedding
      const chunkId = await Document.addChunk(documentId, index, chunks[index]);
      await Document.addChunkVector(chunkId, embeddingResult.embedding);
    }

    // Step 4: Mark document status as ready
    await Document.updateStatus(documentId, "ready");
    return true;
  } catch (error) {
    // Handle processing failure and update status
    await Document.updateStatus(
      documentId,
      "failed",
      error.message || "Document processing failed."
    );
    return false;
  }
};

/**
 * Task: Express controller entry point for document upload.
 * Registers the document record and initiates background pipeline processing.
 */
const createDocument = async ({ userId, file }) => {
  // Create initial document database record
  const documentId = await Document.create({
    userId,
    title: file.originalname,
    mimeType: file.mimetype,
    storagePath: path.resolve(file.path),
    byteSize: file.size,
  });

  // Trigger non-blocking async processing in the background
  void processDocument(documentId, path.resolve(file.path));

  // Return initial document metadata to client immediately
  return Document.findByIdForUser(documentId, userId);
};

export { createDocument, extractText, processDocument };