export const handleProcessingFailure = async ({
  documentId,
  error,
  deleteChunks,
  updateStatus,
  logError = console.error,
}) => {
  try {
    await deleteChunks(documentId);
  } catch (cleanupError) {
    logError(
      `Could not clean up chunks for RAG document ${documentId}:`,
      cleanupError.message,
    );
  }

  try {
    await updateStatus(
      documentId,
      "failed",
      error.message || "Document processing failed.",
    );
  } catch (statusError) {
    logError(
      `Could not mark RAG document ${documentId} as failed:`,
      statusError.message,
    );
  }
};
