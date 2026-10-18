import express from "express";
import questionRoutes from "./src/routes/questionRoutes.js";
// Importing and initializing the automatic database initialization for authentication schema
import { initializeDatabase } from "./src/config/initDb.js";

// for saved questions/bookmarks
import bookmarkRoutes from "./src/routes/bookmarkRoutes.js";

// Import CORS.
import cors from "cors";

// Import our centralized environment configuration.
import createQuestionRoutes from "./src/routes/createQuestionRoutes.js";
import answerRoutes from "./src/routes/answerRoutes.js";
import replyRoutes from "./src/routes/replyRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import env from "./src/config/env.js";
import authRoutes from "./src/routes/authRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import pool from "./src/config/db.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import assistantRoutes from "./src/routes/assistantRoutes.js";
import { startUnverifiedAccountsCleanupScheduler } from "./src/utils/cleanupUnverifiedAccounts.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CREATE EXPRESS APPLICATION
// ============================================================

const app = express();

// Trust the single proxy hop in front of the Render service.
// This lets express-rate-limit identify the client IP correctly.
app.set("trust proxy", 1);

const normalizeOrigin = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return "";
  return urlStr.trim().replace(/\/+$/, "");
};

const explicitAllowedOrigins = new Set(
  [
    env.frontendUrl,
    "https://forum-project-collab.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
    .flatMap((origins) => (origins ? origins.split(",") : []))
    .map(normalizeOrigin)
    .filter(Boolean),
);

const isLocalViteOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;

  try {
    const url = new URL(origin);
    const port = Number(url.port);

    // Allow alternate Vite ports only during local development.
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      Number.isInteger(port) &&
      port >= 5173 &&
      port <= 5199
    );
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);

  if (explicitAllowedOrigins.has(normalized)) return true;
  if (isLocalViteOrigin(normalized)) return true;

  try {
    const url = new URL(normalized);
    // Allow Vercel deployments and preview URLs for this forum project
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app") &&
      url.hostname.includes("forum-project-collab")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));

// Serve uploaded assets (avatars, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Evangadi Forum API is running.",
  });
});

app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/questions", createQuestionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/rag/documents", documentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assistant", assistantRoutes);
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
  try {
    await initializeDatabase();
    if (env.unverifiedCleanup?.enabled) {
      startUnverifiedAccountsCleanupScheduler({
        retentionDays: env.unverifiedCleanup.retentionDays,
        intervalHours: env.unverifiedCleanup.intervalHours,
      });
    }
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
});
