import User from "../models/User.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { generateToken } from "../utils/jwt.js";

// ============================================================
// REGISTER USER
// ============================================================

const registerUser = async ({ firstName, lastName, email, password }) => {
  // Check whether an account already exists with this email.

  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    const error = new Error("An account with this email already exists.");

    error.statusCode = 409;

    throw error;
  }

  // Validate password length after checking for an existing
  // account.

  if (password.length < 8) {
    const error = new Error("Password must contain at least 8 characters.");

    error.statusCode = 400;

    throw error;
  }

  // Hash the password before storing it in the database.
  

  const passwordHash = await hashPassword(password);

  // Create the user account.

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
  });

  // Generate a JWT for the newly created user.

  const token = generateToken(user.userId);

  return {
    user,
    token,
  };
};

// LOGIN USER

const loginUser = async ({ email, password }) => {

  const user = await User.findByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password.");

    error.statusCode = 401;

    throw error;
  }


  if (!user.password_hash) {
    const error = new Error("Invalid email or password.");

    error.statusCode = 401;

    throw error;
  }

  // Compare the supplied password with the stored password
  // hash.

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");

    error.statusCode = 401;

    throw error;
  }

  // ----------------------------------------------------------
  // Generate a JWT after successful authentication.
  // ----------------------------------------------------------

  const token = generateToken(user.user_id);

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

const getCurrentUser = async (userId) => {
  // ----------------------------------------------------------
  // Find the user by the ID extracted from the JWT.
  // ----------------------------------------------------------

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 404;

    throw error;
  }

  return {
    userId: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
};

export { registerUser, loginUser, getCurrentUser };
