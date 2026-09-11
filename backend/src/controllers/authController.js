import { loginUser } from "../services/authService.js";

// ==========================================
// 1. INPUT VALIDATION HELPER
// ==========================================
const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  return null;
};
