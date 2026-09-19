 
  // ============================================================
 // DOCUMENT SERVICE
  // ============================================================
  // Handles business logic for document operations.

 // Securely delete a user's RAG document and clean up// its physical PDF and related database data.

 import fs from "node:fs/promises";
 import Document from "../models/Document.js";
 //               DELETE RAG DOCUMENT

 // Deletes a document only when it belongs to the authenticated user.
 //
 // The operation performs:
 // 1. Find the user's document.
 // 2. Verify ownership through findByIdForUser().
 // 3. Delete the document database record.
 // 4. Database cascade removes related chunks and vectors.
 // 5. Remove the physical PDF from disk.
 // Remove only an owned database record and its paired on-disk PDF.
 
const deleteDocument = async (document, userId) => {




