import Document from "../models/Document.js";
import { searchDocument } from "../rag/ragService.js";

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

