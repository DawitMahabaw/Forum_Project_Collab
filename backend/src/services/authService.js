
// ============================================================
// AUTHENTICATION SERVICE
// ============================================================
//
// This file contains the business logic for authentication.
//
// The service sits between:
//     Controller → Service → Model
//
// The controller handles HTTP requests/responses.
// The service handles authentication rules and business logic.
// The model handles communication with MySQL.
//
// ============================================================

import User from "../models/User.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

import { generateToken } from "../utils/jwt.js";

// ============================================================
// REGISTER USER
// ============================================================
//
// Creates a new user account.
//
// Flow:
//
// Controller
//     ↓
// registerUser()
//     ↓
// Check whether email already exists
//     ↓
// Hash password
//     ↓
// Create user in database
//     ↓
// Generate JWT
//     ↓
// Return user + token
//
// ============================================================

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  // ----------------------v------------------------------------
  // Check whether an account already exists with this email.
  // ----------------------------------------------------------

  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists.",
    );

    error.statusCode = 409;

    throw error;
  }

  // ----------------------------------------------------------
  // Never store a plain-text password in the database.
  //
  // bcrypt converts the password into a secure hash.
  // ----------------------------------------------------------

  const passwordHash = await hashPassword(password);

  // ----------------------------------------------------------
  // Create the user through the User model.
  // ----------------------------------------------------------

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
  });

  // ----------------------------------------------------------
  // Generate a JWT containing the user's ID.
  //
  // The frontend will use this token for authenticated
  // requests.
  // ----------------------------------------------------------

  const token = generateToken(user.userId);

  // ----------------------------------------------------------
  // Return only the information the frontend needs.
  // ----------------------------------------------------------

  return {
    user,
    token,
  };
};

// ============================================================
// LOGIN USER
// ============================================================
//
// Authenticates an existing user.
//
// Flow:
//
// Controller
//     ↓
// loginUser()
//     ↓
// Find user by email
//     ↓
// Compare password with stored hash
//     ↓
// Generate JWT
//     ↓
// Return user + token
//
// ============================================================

const loginUser = async ({
  email,
  password,
}) => {
  // ----------------------------------------------------------
  // Find the user by email.
  // ----------------------------------------------------------

  const user = await User.findByEmail(email);

  // ----------------------------------------------------------
  // Do not reveal whether the email exists.
  //
  // Using the same message for both invalid-email and
  // invalid-password cases is safer.
  // ----------------------------------------------------------

  if (!user) {
    const error = new Error(
      "Invalid email or password.",
    );

    error.statusCode = 401;

    throw error;
  }

  // ----------------------------------------------------------
  // Compare the password entered by the user with the
  // password hash stored in MySQL.
  // ----------------------------------------------------------

  const isPasswordValid = await comparePassword(
    password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    const error = new Error(
      "Invalid email or password.",
    );

    error.statusCode = 401;

    throw error;
  }

  // ----------------------------------------------------------
  // Credentials are valid.
  // Generate a new JWT.
  // ----------------------------------------------------------

  const token = generateToken(user.user_id);

  // ----------------------------------------------------------
  // Return the user without exposing the password hash.
  // ----------------------------------------------------------

  return {
    user: {
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    },

    token,
  };
};

// ============================================================
// GET CURRENT USER
// ============================================================
//
// Retrieves the currently authenticated user's information.
//
// The user's ID comes from the verified JWT.
//
// Flow:
//
// Request
//     ↓
// authMiddleware
//     ↓
// req.user.userId
//     ↓
// getCurrentUser()
//     ↓
// User.findById()
//     ↓
// Return safe user information
//
// ============================================================

const getCurrentUser = async (userId) => {
  // ----------------------------------------------------------
  // Find the authenticated user in the database.
  // ----------------------------------------------------------

  const user = await User.findById(userId);

  // ----------------------------------------------------------
  // A valid token should normally belong to an existing user.
  // However, the user could have been deleted after the token
  // was issued.
  // ----------------------------------------------------------

  if (!user) {
    const error = new Error(
      "User not found.",
    );

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------------
  // Return only safe user information.
  //
  // Never send password_hash to the frontend.
  // ----------------------------------------------------------

  return {
    userId: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
};

// ============================================================
// EXPORT SERVICE FUNCTIONS
// ============================================================

export {
  registerUser,
  loginUser,
  getCurrentUser,
};

