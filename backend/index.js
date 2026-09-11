import express from "express";

// Importing and initializing the  automatic database initialization for authentication schema
import { initializeDatabase } from "./src/config/initDb.js";
await initializeDatabase();

// Import CORS.
import cors from "cors";

// Import our centralized environment configuration.

import env from "./src/config/env.js";
import authRoutes from "./src/routes/authRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import pool from "./src/config/db.js";

// ============================================================
// CREATE EXPRESS APPLICATION
// ============================================================

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Evangadi Forum API is running.",
  });
});


app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("MySQL database connected successfully.");
  } catch (error) {
    console.error("MySQL database connection failed:", error.message);
  }
};
app.listen(env.port, async () => {
  console.log(`AI Powered Evangadi Forum API is running on port ${env.port}.`);
  await testDatabaseConnection();
});
