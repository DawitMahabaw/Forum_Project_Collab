import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import env from "../config/env.js";

const uploadDirectory = path.resolve(process.cwd(), env.rag.uploadDir);

// Make sure the upload directory exists.
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const safeFilename = `${Date.now()}-${crypto.randomUUID()}.pdf`;
    callback(null, safeFilename);
  },
});

const uploadPdf = multer({
  storage,

  limits: {
    fileSize: env.rag.maxFileSizeBytes,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype !== "application/pdf" || extension !== ".pdf") {
      const error = new Error("Only PDF files are supported.");
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  },
});

export { uploadDirectory, uploadPdf };
