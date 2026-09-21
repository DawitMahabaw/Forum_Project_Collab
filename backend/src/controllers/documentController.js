import fs from "node:fs/promises";
import Document from "../models/Document.js";
import { createDocument,deleteDocument, queryDocument,searchDocument } from "../rag/ragService.js";

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
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("A PDF file is required.");
      error.statusCode = 400;
      throw error;
    }

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
      await fs.rm(req.file.path, { force: true }).catch(() => {});
    }

    return next(error);
  }
};
const getDocument = async (req, res, next) => {
  // Controller for retrieving information about one document.

  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

        // Get the document ID from the URL.
    //
   
    return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data: document,
    });

    // Return the document information to the frontend.
  } catch (error) {
    return next(error);
  }

  // Pass errors to the centralized error handler.
};

const streamDocument = async (req, res, next) => {
  // Controller for sending the actual PDF file to the client.
  //
 

  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
      { includeStoragePath: true },
    );

    // Find the authenticated user's document.
    //
    // Notice the third argument:
    //

    
    if (!fs.existsSync(document.storagePath)) {
      const error = new Error("The uploaded PDF file is no longer available.");
      error.statusCode = 404;
      throw error;
    }

   
    res.type("application/pdf");
    return res.sendFile(document.storagePath);

  } catch (error) {
    return next(error);
  }

  // Pass errors to the centralized error handler.
};

const search = async (req, res, next) => {
  // Controller for semantic search inside a document.
  //
  // The user provides a search query,
  // and the RAG service finds the most semantically relevant
  // chunks/passages from that document.

  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

    // First verify that the requested document belongs
    // to the authenticated user.
    //
    // This ownership check happens BEFORE searching the document.

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

    // Return the ranked search results to the frontend.
    //
    // "Ranked chunk excerpts" means the response can contain
    // pieces of the document ordered according to semantic relevance.
  } catch (error) {
    return next(error);
  }

  // Pass errors to the centralized error handler.
};

const ask = async (req, res, next) => {
  
  try {
    const document = await findOwnedDocument(
      req.params.documentId,
      req.user.userId,
    );

    // Verify that the authenticated user owns the document.
    //
    // Again, ownership is checked before accessing the document.


export { search, uploadDocument };
