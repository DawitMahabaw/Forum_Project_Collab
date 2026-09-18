// Retrieve documents belonging to the authenticated user.
const listDocuments = async () =>
  (await api.get("/rag/documents")).data.data || [];


  return response.data.data;
};

export { listDocuments, uploadPdf };
