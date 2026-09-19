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


const Document = {
 async create({ userId, title, mimeType, storagePath, byteSize }) {
    const [result] = await pool.execute(
      `INSERT INTO documents
        (user_id, title, mime_type, storage_path, byte_size)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, mimeType, storagePath, byteSize],
    );

    return result.insertId;
  },
  // Database lookup to find a specific document while checking user ownership
  async findByIdForUser(documentId, userId, options = {}) {
    // Step 1: Run a query filtered by both the document ID and the user ID
    const [rows] = await pool.execute(
      `SELECT document_id, title, mime_type, storage_path, byte_size, status,
              error_message, created_at, updated_at
       FROM documents WHERE document_id = ? AND user_id = ? LIMIT 1`,
      [documentId, userId],
    );

    // Step 2: If a matching document row is found, format it; otherwise return null
    return rows ? mapDocument(rows, options) : null;
  },

  // Database lookup to retrieve all prepared text chunks and vector embeddings
  async findReadyChunks(documentId) {
    // Step 1: Run an INNER JOIN query to collect chunk text and matching vector matrices
    const [rows] = await pool.execute(
      `SELECT c.chunk_id, c.chunk_index, c.content, v.embedding
       FROM document_chunks c
       INNER JOIN document_chunk_vectors v ON v.chunk_id = c.chunk_id
       WHERE c.document_id = ? AND v.status = 'ready'
       ORDER BY c.chunk_index ASC`,
      [documentId],
    );

    // Step 2: Loop through the rows and convert them into the clean objects needed for calculations
    return rows.map((row) => ({
      chunkId: Number(row.chunk_id),
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      // Convert the string vector back into an array of floats
      embedding: parseEmbedding(row.embedding),
    }));
  },

// ==========================================
  // TASK T-22: 
  // ==========================================
/**
   * Create a new document record in the database
   */
  
  async create({ userId, title, mimeType, storagePath, byteSize }) {
    const [result] = await pool.execute(
      `INSERT INTO documents (user_id, title, mime_type, storage_path, byte_size)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, mimeType, storagePath, byteSize]
    );
    return result.insertId;
  },

  /**
   * List all documents belonging to a specific user
   */
  async listForUser(userId) {
    const [rows] = await pool.execute(
      `SELECT document_id, title, mime_type, byte_size, status, error_message,
              created_at, updated_at
       FROM documents WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((row) => mapDocument(row));
  },

  /**
   * Update document processing status and optional error message
   */
  async updateStatus(documentId, status, errorMessage = null) {
    await pool.execute(
      `UPDATE documents SET status = ?, error_message = ? WHERE document_id = ?`,
      [status, errorMessage, documentId]
    );
  },

  /**
   * Insert extracted text chunk for a document
   */
  async addChunk(documentId, chunkIndex, content) {
    const [result] = await pool.execute(
      `INSERT INTO document_chunks (document_id, chunk_index, content)
       VALUES (?, ?, ?)`,
      [documentId, chunkIndex, content]
    );
    return result.insertId;
  },

  /**
   * Save vector embedding for a specific chunk
   */
  async addChunkVector(chunkId, embedding) {
    await pool.execute(
      `INSERT INTO document_chunk_vectors (chunk_id, embedding, status)
       VALUES (?, ?, 'ready')`,
      [chunkId, JSON.stringify(embedding)]
    );
  },

  /**
   * Delete document by ID ensuring user ownership
   */
  async deleteById(documentId, userId) {
    const [result] = await pool.execute(
      `DELETE FROM documents WHERE document_id = ? AND user_id = ?`,
      [documentId, userId]
    );
    return result.affectedRows > 0;
  },

};
export default Document;
