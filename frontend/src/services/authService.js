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



export { registerUser, loginUser, getCurrentUser };