import express from "express";
import authenticate from "../middleware/authMiddleware.js";

// Initialize the Express router instance
const router = express.Router();

// Enforce global authentication across all routes declared in this file
router.use(authenticate);
