const normalizeText = (text) => text.replace(/\s+/g, " ").trim();

const validateChunkOptions = (chunkSize, chunkOverlap) => {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError("chunkSize must be a positive integer.");
  }

  if (
    !Number.isInteger(chunkOverlap) ||
    chunkOverlap < 0 ||
    chunkOverlap >= chunkSize
  ) {
    throw new RangeError(
      "chunkOverlap must be a non-negative integer smaller than chunkSize.",
    );
  }
};

const splitNormalizedText = (normalized, chunkSize, chunkOverlap) => {
  const step = chunkSize - chunkOverlap;
  const chunks = [];

  for (let start = 0; start < normalized.length; start += step) {
    const rawChunk = normalized.slice(start, start + chunkSize);
    const leadingWhitespace = rawChunk.length - rawChunk.trimStart().length;
    const chunk = rawChunk.trim();

    if (chunk) {
      chunks.push({
        text: chunk,
        start: start + leadingWhitespace,
        end: start + leadingWhitespace + chunk.length,
      });
    }

    if (start + chunkSize >= normalized.length) {
      break;
    }
  }

  return chunks;
};

/**
 * Splits extracted text into overlapping character windows.
 * @param {string} text - Raw input text
 * @param {number} chunkSize - Maximum characters per chunk (default: 1000)
 * @param {number} chunkOverlap - Overlapping characters (default: 120)
 * @returns {string[]} Array of text chunks
 */
export const splitText = (text, chunkSize = 1000, chunkOverlap = 120) => {
  if (typeof text !== "string") {
    return [];
  }

  validateChunkOptions(chunkSize, chunkOverlap);

  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  return splitNormalizedText(normalized, chunkSize, chunkOverlap).map(
    ({ text: chunk }) => chunk,
  );
};

/**
 * Splits page text into overlapping chunks while tracking source pages.
 * @param {{ pageNumber: number, text: string }[]} pages
 * @param {number} chunkSize
 * @param {number} chunkOverlap
 * @returns {{ text: string, pageNumbers: number[] }[]}
 */
export const splitTextWithPages = (
  pages,
  chunkSize = 1000,
  chunkOverlap = 120,
) => {
  if (!Array.isArray(pages)) {
    return [];
  }

  validateChunkOptions(chunkSize, chunkOverlap);

  let normalized = "";
  const pageRanges = [];

  for (const page of pages) {
    if (
      !page ||
      typeof page.text !== "string" ||
      !Number.isSafeInteger(page.pageNumber)
    ) {
      continue;
    }

    const pageText = normalizeText(page.text);

    if (!pageText) {
      continue;
    }

    if (normalized) {
      normalized += " ";
    }

    const start = normalized.length;
    normalized += pageText;

    pageRanges.push({
      pageNumber: page.pageNumber,
      start,
      end: normalized.length,
    });
  }

  return splitNormalizedText(normalized, chunkSize, chunkOverlap).map(
    ({ text, start, end }) => ({
      text,
      pageNumbers: pageRanges
        .filter((page) => page.start < end && page.end > start)
        .map((page) => page.pageNumber),
    }),
  );
};
