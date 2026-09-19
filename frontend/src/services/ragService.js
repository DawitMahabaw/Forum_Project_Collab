
// RAG SEARCH AND AI API SERVICE
import api from "./api.js";
// Retrieve documents belonging to the authenticated user.
const listDocuments = async () =>
  (await api.get("/rag/documents")).data.data || [];

// Upload a PDF using multipart FormData.
const uploadPdf = async (file) => {
  const formData = new FormData();

  // The field name must match uploadPdf.single("file") on the backend.
  formData.append("file", file);

  const response = await api.post("/rag/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",},
    });
    return response.data.data;
    };


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

export { askDocument, searchDocument,listDocuments, uploadPdf };
