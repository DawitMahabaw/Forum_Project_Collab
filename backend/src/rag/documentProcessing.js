import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import Document from "../models/Document.js";
import { embedContent } from "../ai/gemini.js";
import { splitText } from "./chunking.js";

const extractText = async (filePath) => {
  // Skeleton for PDF text extraction
};
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
  } catch (error) {
    await Document.updateStatus(
      documentId,
      "failed",
      error.message || "Document processing failed.",
    );
    return false;
  }
};