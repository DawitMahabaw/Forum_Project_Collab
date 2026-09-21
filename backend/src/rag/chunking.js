/**
 * Splits extracted text into smaller chunks with overlap.
 * @param {string} text - Raw input text
 * @param {number} chunkSize - Maximum characters per chunk (default: 1000)
 * @param {number} chunkOverlap - Overlapping characters between chunks (default: 120)
 * @returns {string[]} Array of text chunks
 */
export const splitText = (text, chunkSize = 1000, chunkOverlap = 120) => {
  if (typeof text !== "string") {
    return [];
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const step = Math.max(1, chunkSize - chunkOverlap);
  const chunks = [];

  for (let start = 0; start < normalized.length; start += step) {
    const chunk = normalized.slice(start, start + chunkSize).trim();

    if (chunk) chunks.push(chunk);

    if (start + chunkSize >= normalized.length) break;
  }

  return chunks;
};