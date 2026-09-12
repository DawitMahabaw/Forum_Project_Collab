// ============================================================
// AUTHENTICATION CONTROLLER
// ============================================================
//
// This file handles HTTP requests related to authentication.
//
// Controller responsibilities:
//
// 1. Receive the HTTP request.
// 2. Validate incoming data.
// 3. Normalize user input.
// 4. Call the authentication service.
// 5. Send the HTTP response.
// 6. Pass unexpected errors to the error middleware.
//
// The controller does NOT directly communicate with MySQL.
//
// Architecture:
//
// Route
//   ↓
// Controller
//   ↓
// Service
//   ↓
// Model
//   ↓
// MySQL
//
// ============================================================

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService.js";

// ============================================================
// REGISTRATION INPUT VALIDATION
// ============================================================

const validateRegistrationInput = ({
  firstName,
  lastName,
  email,
  password,
}) => {
  // ----------------------------------------------------------
  // Check required fields one by one.
  // ----------------------------------------------------------

  if (!firstName || !firstName.trim()) {
    return "First name is required.";
  }

  if (!lastName || !lastName.trim()) {
    return "Last name is required.";
  }

  if (!email || !email.trim()) {
    return "Email is required.";
  }

  if (!password) {
    return "Password is required.";
  }

  // ----------------------------------------------------------
  // Validate first name length.
  // ----------------------------------------------------------

  if (firstName.trim().length < 2) {
    return "First name must contain at least 2 characters.";
  }

  // ----------------------------------------------------------
  // Validate last name length.
  // ----------------------------------------------------------

  if (lastName.trim().length < 2) {
    return "Last name must contain at least 2 characters.";
  }

  // ----------------------------------------------------------
  // Validate email format.
  // ----------------------------------------------------------

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  // ----------------------------------------------------------
  // Validate password length.
  // ----------------------------------------------------------

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  return null;
};

// ============================================================
// LOGIN INPUT VALIDATION
// ============================================================

const validateLoginInput = ({ email, password }) => {
  // ----------------------------------------------------------
  // Check email first.
  // ----------------------------------------------------------

  if (!email || !email.trim()) {
    return "Email is required.";
  }

  // ----------------------------------------------------------
  // Check password separately.
  // ----------------------------------------------------------

  if (!password) {
    return "Password is required.";
  }

  // ----------------------------------------------------------
  // Validate email format.
  // ----------------------------------------------------------

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  // ----------------------------------------------------------
  // Validate password length.
  // ----------------------------------------------------------

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  return null;
};

// ============================================================
// REGISTER CONTROLLER
// ============================================================
//
// Handles:
// POST /api/auth/register
//
// ============================================================

const register = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Extract registration data from the request body.
    // --------------------------------------------------------

    const { firstName, lastName, email, password } = req.body;

    // --------------------------------------------------------
    // Validate the incoming data.
    // --------------------------------------------------------

    const validationError = validateRegistrationInput({
      firstName,
      lastName,
      email,
      password,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // --------------------------------------------------------
    // Normalize user input before sending it to the service.
    //
    // Names:
    //     Remove unnecessary spaces.
    //
    // Email:
    //     Remove spaces and convert to lowercase.
    // --------------------------------------------------------

    const normalizedFirstName = firstName.trim();

    const normalizedLastName = lastName.trim();

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------------
    // Call the authentication service.
    // --------------------------------------------------------

    const result = await registerUser({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password,
    });

    // --------------------------------------------------------
    // Return the newly created user and JWT.
    //
    // IMPORTANT:
    // The password is NEVER returned.
    // The password hash is NEVER returned.
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    // --------------------------------------------------------
    // Send unexpected errors to centralized error handling.
    // --------------------------------------------------------

    next(error);
  }
};

// ============================================================
// LOGIN CONTROLLER
// ============================================================
//
// Handles:
// POST /api/auth/login
//
// ============================================================

const login = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Extract login credentials.
    // --------------------------------------------------------

    const { email, password } = req.body;

    // --------------------------------------------------------
    // Validate the credentials.
    // --------------------------------------------------------

    const validationError = validateLoginInput({
      email,
      password,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Normalize the email before authentication.
    const normalizedEmail = email.trim().toLowerCase();
    

    // Verify credentials through the database service
    const result = await loginUser({
      email: normalizedEmail,
      password,
    });

    // --------------------------------------------------------
    // Return the authenticated user and JWT.
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    // --------------------------------------------------------
    // Send errors to centralized error middleware.
    // --------------------------------------------------------

    next(error);
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

export { register, login, getMe };
