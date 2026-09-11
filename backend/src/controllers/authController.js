import { loginUser } from "../services/authService.js";

// ==========================================
// 1. INPUT VALIDATION HELPER
// ==========================================

// Both fields are required.
const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  // Validate email format.

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Please provide a valid email address.";
  }

  // Validate password length.
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  return null;
};

// ==========================================
// 2. LOGIN USER CONTROLLER (TASK T-05)
// ==========================================
export const login = async (req, res, next) => {
  try {
    // Extract incoming user inputs
    const { email, password } = req.body;

    // Run input validation checks
    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Verify credentials through the database service
    const result = await loginUser({
      email: normalizedEmail,
      password,
    });

    // Return the successful login token and user info
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });

    // Clean up email formatting
    const normalizedEmail = email.trim().toLowerCase();
  } catch (error) {
    next(error);
  }
};
