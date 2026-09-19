import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import Document from "../models/Document.js";
import { embedContent } from "../ai/gemini.js";
import { splitText } from "./chunking.js";

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
    const text = await extractText(filePath);
    const chunks = splitText(text, 1000, 120);

    if (!chunks.length) {
      throw new Error("The PDF does not contain readable text.");
    }

    for (let index = 0; index < chunks.length; index += 1) {
      const embeddingResult = await embedContent(
        chunks[index],
        "RETRIEVAL_DOCUMENT"
      );

      if (!embeddingResult.success) {
        throw new Error("Could not generate document embeddings.");
      }

      const chunkId = await Document.addChunk(documentId, index, chunks[index]);
      await Document.addChunkVector(chunkId, embeddingResult.embedding);
    }

    await Document.updateStatus(documentId, "ready");
    return true;
  } catch (error) {
    await Document.updateStatus(
      documentId,
      "failed",
      error.message || "Document processing failed."
    );
    return false;
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

export { createDocument, extractText, processDocument };