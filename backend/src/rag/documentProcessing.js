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