 
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

const document = await Document.findByIdForUser(
    document,
     userId,
     { includeStoragePath: true },
  );
  // The document does not exist for this user
  // This also prevents one user from accessing another user's
   // document by changing the document ID.

   if (!document) {
   const error = new Error("Document not found.");
     error.statusCode = 404;
     throw error;
   }
const deleted = await Document.deleteById(document.documentId, userId);
  // Ask the model to delete the database record.
  //
  // IMPORTANT:The model checks BOTH:documentId AND userId
  // so one user cannot delete another user's document.

  if (deleted) {
    // Only remove the physical PDF if the database deletion succeeded.

    await fs.rm(document.storagePath, { force: true });
    // Delete the actual PDF file from the server's filesystem.
    // force: true means fs.rm() won't throw an error merely
    // because the file is already missing.
  }
  

