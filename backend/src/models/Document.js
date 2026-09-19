import pool from "../config/db.js";

// Helper function to turn the database's string embedding back into a numerical array
const parseEmbedding = (embedding) => {
  // If it is already an array, return it directly
  if (Array.isArray(embedding)) return embedding;

  // Otherwise, parse the JSON text string into a real JavaScript array
  return JSON.parse(embedding);
};
