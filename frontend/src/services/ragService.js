// Retrieve documents belonging to the authenticated user.
const listDocuments = async () =>
  (await api.get("/rag/documents")).data.data || [];

// Upload a PDF using multipart FormData.
const uploadPdf = async (file) => {
  const formData = new FormData();

  // The field name must match uploadPdf.single("file") on the backend.
  formData.append("file", file);

 
  });

  return response.data.data;
};;

export { listDocuments, uploadPdf };
