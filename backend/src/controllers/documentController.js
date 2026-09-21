import fs from "node:fs/promises";
import Document from "../models/Document.js";
import {
  createDocument,
  deleteDocument,
  queryDocument,
  searchDocument,
} from "../rag/ragService.js";


// Accept document ID
const getDocumentId = (rawDocumentId) => {
  const documentId = Number(rawDocumentId);

  // Fail early if ID is not a safe, positive integer
  if (!Number.isSafeInteger(documentId) || documentId < 1) {
    const error = new Error("Document identifier must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }
  return documentId;
};

//  Verify document ownership
const findOwnedDocument = async (rawDocumentId, userId, options = {}) => {
  // Query DB verifying both the Document ID and the specific User ID context
  const document = await Document.findByIdForUser(
    getDocumentId(rawDocumentId),
    userId,
    options,
  );

  // Handle missing documents & Handle unauthorized access
  // Returning generic 404 prevents unauthorized users from knowing if a document exists
  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }
  return document;
};

//  Accept search query
const requireQuery = (rawQuery) => {
  if (typeof rawQuery !== "string" || !rawQuery.trim()) {
    const error = new Error("Please enter a question or search query.");
    error.statusCode = 400;
    throw error;
  }
  return rawQuery.trim();
};

// Controller for retrieving information about one document.
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

  // Pass errors to the centralized error handler.
};


// Create semantic search endpoint
const search = async (req, res, next) => {
  try {
    // 1. Accept document ID & Verify document ownership
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );
    // 2. Accept search query and delegate down to your lower service layers
    const data = await searchDocument(
      document,
      requireQuery(req.query.query),
      req.query.k,
    );
    // 3. Return chunk text and relevance information
    return res.status(200).json({
      success: true,
      message: "Ranked chunk excerpts.",
      data, // Contains chunk texts and their calculated metrics
    });
  } catch (error) {
    // 4. Handle embedding errors & Handle database errors
    return next(error);
  }
};

// delete document

const remove = async (req, res, next) => {
  //  Find the document and verify ownership.
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
      { includeStoragePath: true },
    );

    // Delegate deletion to the RAG service
    // The service can handle the complete deletion process,
    // such as removing:
    // document database information: chunks, embeddings, physical PDF file

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

const ask = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

    const data = await queryDocument(document, requireQuery(req.body.query));

    return res.status(200).json({
      success: true,
      message: "Answer generated from document sources.",
      data,
    });

  } catch (error) {
    return next(error);
  }

  // Pass errors to the centralized error handler.
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("A PDF file is required.");
      error.statusCode = 400;
      throw error;
    }

    const document = await createDocument({
      userId: req.user.userId,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and is being processed.",
      data: document,
    });

    const documentId = await Document.create({
      userId: req.user.userId,
      title: req.file.originalname,
      mimeType: req.file.mimetype,
      storagePath: req.file.path,
      byteSize: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        documentId: Number(documentId),
        title: req.file.originalname,
        mimeType: req.file.mimetype,
        byteSize: req.file.size,
        status: "processing",
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.rm(req.file.path, { force: true }).catch(() => { });
    }

    return next(error);
  }
};

export { ask, uploadDocument, remove, search, getDocument };
