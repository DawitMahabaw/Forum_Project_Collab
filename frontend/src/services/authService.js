import api from "./api.js";

/**
 * Registers a new user.
 * @param {Object} userData - User details for registration.
 */
const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData,
  );

  return response.data;
};

/**
 * Logs in an existing user.
 * @param {Object} credentials - User login credentials.
 */
const loginUser = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    credentials,
  );

  return response.data;
};

/**
 * Fetches the currently authenticated user's information
 * using the token attached by the API client.
 */
const getCurrentUser = async () => {
  const response = await api.get(
    "/auth/me",
  );

  return response.data;
};

/**
 * Fetches user profile with stats.
 */
const getUserProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

/**
 * Updates profile details (headline, bio, location, githubUrl).
 */
const updateUserProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

/**
 * Uploads a user avatar image.
 */
const uploadAvatar = async (formData) => {
  const response = await api.post("/auth/avatar", formData);
  return response.data;
};

/**
 * Updates account details (firstName, lastName, email).
 */
const updateAccount = async (accountData) => {
  const response = await api.put("/auth/account", accountData);
  return response.data;
};

/**
 * Changes user password.
 */
const changePassword = async (passwords) => {
  const response = await api.put("/auth/change-password", passwords);
  return response.data;
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  updateAccount,
  changePassword,
};