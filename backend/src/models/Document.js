import pool from "../config/db.js";

// Helper function to turn the database's string embedding back into a numerical array
const parseEmbedding = (embedding) => {
  // If it is already an array, return it directly
  if (Array.isArray(embedding)) return embedding;

  // Otherwise, parse the JSON text string into a real JavaScript array
  return JSON.parse(embedding);
};

// Helper function to clean up database row headers into standard camelCase keys
const mapDocument = (row, { includeStoragePath = false } = {}) => ({
  documentId: Number(row.document_id),
  title: row.title,
  mimeType: row.mime_type,
  byteSize: Number(row.byte_size),
  status: row.status,
  errorMessage: row.error_message,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  // Add the storage path only if it is explicitly requested by the service
  ...(includeStoragePath ? { storagePath: row.storage_path } : {}),
});
