// RAG SEARCH AND AI API SERVICE
import api from "./api.js";


// SEMANTIC SEARCH
const searchDocument = async (documentId, query) => {
  const response = await api.get(`/rag/documents/${documentId}/search`, {
    params: { query },
  });

  return response.data.data;
};

// ASK AI
const askDocument = async (documentId, query) => {
  const response = await api.post(`/rag/documents/${documentId}/query`, {
    query,
  });

  return response.data.data;
};

export { askDocument, searchDocument };
