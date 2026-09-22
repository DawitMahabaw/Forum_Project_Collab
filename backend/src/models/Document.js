import pool from "../config/db.js";

const parseEmbedding = (embedding) => {
  const parsed = Array.isArray(embedding) ? embedding : JSON.parse(embedding);

  if (!Array.isArray(parsed) || !parsed.length || !parsed.every(Number.isFinite)) {
    return null;
  }

  return parsed;
};

const mapDocument = (row, { includeStoragePath = false } = {}) => ({
  documentId: Number(row.document_id),
  title: row.title,
  mimeType: row.mime_type,
  byteSize: Number(row.byte_size),
  status: row.status,
  errorMessage: row.error_message,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
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

    return Number(result.insertId);
  },

  async listForUser(userId) {
    const [rows] = await pool.execute(
      `SELECT document_id, title, mime_type, byte_size, status, error_message,
              created_at, updated_at
       FROM documents
       WHERE user_id = ?
       ORDER BY created_at DESC, document_id DESC`,
      [userId],
    );

    return rows.map((row) => mapDocument(row));
  },

  async findByIdForUser(documentId, userId, options = {}) {
    const [rows] = await pool.execute(
      `SELECT document_id, title, mime_type, storage_path, byte_size, status,
              error_message, created_at, updated_at
       FROM documents
       WHERE document_id = ? AND user_id = ?
       LIMIT 1`,
      [documentId, userId],
    );

    return rows[0] ? mapDocument(rows[0], options) : null;
  },

  async updateStatus(documentId, status, errorMessage = null) {
    await pool.execute(
      `UPDATE documents
       SET status = ?, error_message = ?
       WHERE document_id = ?`,
      [status, errorMessage, documentId],
    );
  },

  async addChunk(documentId, chunkIndex, content) {
    const [result] = await pool.execute(
      `INSERT INTO document_chunks (document_id, chunk_index, content)
       VALUES (?, ?, ?)`,
      [documentId, chunkIndex, content],
    );

    return Number(result.insertId);
  },

  async addChunkVector(chunkId, embedding) {
    await pool.execute(
      `INSERT INTO document_chunk_vectors (chunk_id, embedding, status)
       VALUES (?, ?, 'ready')`,
      [chunkId, JSON.stringify(embedding)],
    );
  },

  async findReadyChunks(documentId) {
    const [rows] = await pool.execute(
      `SELECT c.chunk_id, c.chunk_index, c.content, v.embedding
       FROM document_chunks c
       INNER JOIN document_chunk_vectors v ON v.chunk_id = c.chunk_id
       WHERE c.document_id = ? AND v.status = 'ready'
       ORDER BY c.chunk_index ASC`,
      [documentId],
    );

    return rows.flatMap((row) => {
      try {
        const embedding = parseEmbedding(row.embedding);
        if (!embedding) return [];

        return [{
          chunkId: Number(row.chunk_id),
          chunkIndex: Number(row.chunk_index),
          content: row.content,
          embedding,
        }];
      } catch {
        return [];
      }
    });
  },

  async deleteById(documentId, userId) {
    const [result] = await pool.execute(
      `DELETE FROM documents WHERE document_id = ? AND user_id = ?`,
      [documentId, userId],
    );

    return result.affectedRows > 0;
  },
};

export default Document;
