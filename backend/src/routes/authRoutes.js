
// ============================================================
// AUTHENTICATION ROUTES
// ============================================================
//
// This file defines all HTTP endpoints related to
// authentication.
//
// Routes connect:
//
// HTTP Request
//     ↓
// Route
//     ↓
// Controller
//
// The route file should remain thin.
// Business logic belongs in the service layer.
//
// ============================================================

import express from "express";

// ------------------------------------------------------------
// Authentication controllers
// ------------------------------------------------------------

import {
  register,
  login,
  getMe,
} from "../controllers/authController.js";

// ------------------------------------------------------------
// Authentication middleware
//
// This middleware verifies the JWT before allowing access to
// protected authentication routes such as /me.
// ------------------------------------------------------------

import authenticate from "../middleware/authMiddleware.js";

// ============================================================
// CREATE ROUTER
// ============================================================

const router = express.Router();

// ============================================================
// PUBLIC AUTHENTICATION ROUTES
// ============================================================
//
// These endpoints do NOT require a JWT.
//
// POST /api/auth/register
// POST /api/auth/login
//
// ============================================================

router.post(
  "/register",
  register,
);

router.post(
  "/login",
  login,
);

// ============================================================
// PROTECTED AUTHENTICATION ROUTE
// ============================================================
//
// GET /api/auth/me
//
// This endpoint requires a valid JWT.
//
// Request:
//
// Authorization: Bearer <JWT>
//
// Flow:
//
// Client
//   ↓
// GET /api/auth/me
//   ↓
// authenticate middleware
//   ↓
// Verify JWT
//   ↓
// req.user.userId
//   ↓
// getMe controller
//   ↓
// getCurrentUser service
//   ↓
// User.findById()
//   ↓
// Return current user
//
// ============================================================

router.get(
  "/me",
  authenticate,
  getMe,
);

// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;

