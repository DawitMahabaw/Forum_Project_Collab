import api from "./api.js";

const listDocuments = async () =>
  (await api.get("/rag/documents")).data.data || [];

const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // Axios supplies the multipart boundary when given FormData.
  return (await api.post("/rag/documents", formData)).data.data;
};

const searchDocument = async (documentId, query) =>
  (
    await api.get(`/rag/documents/${documentId}/search`, {
      params: { query },
    })
  ).data.data;

const askDocument = async (documentId, query) =>
  (await api.post(`/rag/documents/${documentId}/query`, { query })).data.data;

// Summaries read the whole PDF, so allow more time than a normal request.
const summarizeDocument = async (documentId, prompt) =>
  (
    await api.post(
      `/rag/documents/${documentId}/summarize`,
      { prompt },
      { timeout: 120_000 },
    )
  ).data.data;

const deleteDocument = async (documentId) =>
  (await api.delete(`/rag/documents/${documentId}`)).data.data;

const getDocumentFile = async (documentId) => {
  const response = await api.get(`/rag/documents/${documentId}/file`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data);
};

export {
  askDocument,
  deleteDocument,
  getDocumentFile,
  listDocuments,
  searchDocument,
  summarizeDocument,
  uploadDocument,
};
