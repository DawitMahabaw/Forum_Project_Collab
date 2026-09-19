import fs from "node:fs";
import Document from "../models/Document.js";
import { 
  createDocument,
  deleteDocument,
  queryDocument,
  searchDocument } from "../rag/ragService.js";

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
  try{
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

  return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data: document,
    });

}

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

export { search };
