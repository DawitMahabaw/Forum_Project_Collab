import fs from "node:fs/promises";
import Document from "../models/Document.js";
import {
  createDocument,
  deleteDocument,
  queryDocument,
  searchDocument,
} from "../rag/ragService.js";

const getDocumentId = (rawDocumentId) => {
  const documentId = Number(rawDocumentId);

  if (!Number.isSafeInteger(documentId) || documentId < 1) {
    const error = new Error("Document identifier must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  return documentId;
};

const findOwnedDocument = async (rawDocumentId, userId, options = {}) => {
  const document = await Document.findByIdForUser(
    getDocumentId(rawDocumentId),
    userId,
    options,
  );

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  return document;
};

const requireQuery = (rawQuery) => {
  if (typeof rawQuery !== "string" || !rawQuery.trim()) {
    const error = new Error("Please enter a question or search query.");
    error.statusCode = 400;
    throw error;
  }

  const query = rawQuery.trim();
  if (query.length > 2_000) {
    const error = new Error("Questions and search queries must be 2,000 characters or fewer.");
    error.statusCode = 400;
    throw error;
  }

  return query;
};

const validateUploadedPdf = async (filePath) => {
  const handle = await fs.open(filePath, "r");

  try {
    const header = Buffer.alloc(5);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);

    if (bytesRead !== header.length || header.toString("ascii") !== "%PDF-") {
      const error = new Error("The uploaded file is not a valid PDF.");
      error.statusCode = 400;
      throw error;
    }
  } finally {
    await handle.close();
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const documents = await Document.listForUser(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully.",
      data: documents,
    });
  } catch (error) {
    return next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

    return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data: document,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("A PDF file is required.");
      error.statusCode = 400;
      throw error;
    }

    await validateUploadedPdf(req.file.path);
    const document = await createDocument({
      userId: req.user.userId,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and is being processed.",
      data: document,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.rm(req.file.path, { force: true }).catch(() => { });
    }

    return next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );
    const data = await searchDocument(
      document,
      requireQuery(req.query.query),
      req.query.k,
    );

    return res.status(200).json({
      success: true,
      message: "Ranked chunk excerpts.",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const ask = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );
    const data = await queryDocument(document, requireQuery(req.body?.query));

    return res.status(200).json({
      success: true,
      message: "Answer generated from document sources.",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const streamDocument = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
      { includeStoragePath: true },
    );

    try {
      await fs.access(document.storagePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        const notFoundError = new Error("The uploaded PDF file is no longer available.");
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }

    res.type("application/pdf");
    return res.sendFile(document.storagePath, (error) => {
      if (!error) return;
      if (!res.headersSent) return next(error);
      return res.destroy(error);
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
      { includeStoragePath: true },
    );
    await deleteDocument(document, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
      data: { documentId: document.documentId },
    });
  } catch (error) {
    return next(error);
  }
};

export {
  ask,
  getDocument,
  listDocuments,
  remove,
  search,
  streamDocument,
  uploadDocument,
};