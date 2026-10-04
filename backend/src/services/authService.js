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

// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async ({ email, password }) => {
  const user = await User.findByEmail(email);

  if (!user) {
    const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.password_hash) {
   const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Compare the supplied password with the stored password hash.
  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
   const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Generate a JWT after successful authentication.
  const token = generateToken(user.user_id);

  return {
    user: {
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role || "user",
      avatarUrl: user.avatar_url || null,
      headline: user.headline || null,
    },
    token,
  };
};

// ============================================================
// GET CURRENT USER
// ============================================================

const getCurrentUser = async (userId) => {
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
    role: user.role || "user",
    avatarUrl: user.avatar_url || null,
    headline: user.headline || null,
  };
};

// ============================================================
// GET USER PROFILE (WITH COMPUTED STATS)
// ============================================================

const getUserProfile = async (userId) => {
  const profile = await User.getProfileWithStats(userId);

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role || "user",
    avatarUrl: profile.avatar_url || null,
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    githubUrl: profile.github_url || "",
    createdAt: profile.created_at,
    questionsCount: Number(profile.questions_count) || 0,
    answersCount: Number(profile.answers_count) || 0,
  };
};

// ============================================================
// UPDATE USER PROFILE
// ============================================================

const updateUserProfile = async (userId, { headline, bio, location, githubUrl }) => {
  const profile = await User.updateProfile(userId, { headline, bio, location, githubUrl });

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    avatarUrl: profile.avatar_url || null,
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    githubUrl: profile.github_url || "",
    createdAt: profile.created_at,
    questionsCount: Number(profile.questions_count) || 0,
    answersCount: Number(profile.answers_count) || 0,
  };
};

// ============================================================
// UPDATE AVATAR
// ============================================================

const updateUserAvatar = async (userId, avatarUrl) => {
  const profile = await User.updateAvatar(userId, avatarUrl);

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    avatarUrl: profile.avatar_url,
  };
};

// ============================================================
// UPDATE ACCOUNT INFORMATION (FIRST NAME, LAST NAME, EMAIL)
// ============================================================

const updateUserAccount = async (userId, { firstName, lastName, email }) => {
  // If email was changed, ensure no other user has it
  const existingUser = await User.findByEmail(email);

  if (existingUser && Number(existingUser.user_id) !== Number(userId)) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const updated = await User.updateAccount(userId, { firstName, lastName, email });

  if (!updated) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: updated.user_id,
    firstName: updated.first_name,
    lastName: updated.last_name,
    email: updated.email,
    role: updated.role || "user",
    avatarUrl: updated.avatar_url || null,
    headline: updated.headline || null,
  };
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByIdWithPassword(userId);

  if (!user || !user.password_hash) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error("New password must contain at least 8 characters.");
    error.statusCode = 400;
    throw error;
  }

  const newPasswordHash = await hashPassword(newPassword);
  await User.updatePassword(userId, newPasswordHash);

  return { message: "Password updated successfully." };
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserAccount,
  changeUserPassword,
};
