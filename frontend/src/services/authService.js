import { apiClient } from "./api.js";

/**
 * Registers a new user.
 * @param {Object} userData - User details for registration.
 */
async function registerUser(userData) {
  try {
    const response = await apiClient.post("/api/auth/register", userData);
    return { user: response.data.user, token: response.data.token };
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Logs in an existing user.
 * @param {Object} credentials - User login credentials.
 */
async function loginUser(credentials) {
  try {
    const response = await apiClient.post("/api/auth/login", credentials);
    return { user: response.data.user, token: response.data.token };
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Fetches the currently authenticated user's information
 * using the token attached by the API client.
 */
async function getCurrentUser() {
  try {
    const response = await apiClient.get("/api/auth/me");
    return { user: response.data.user };
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Centralized error handler for auth service requests.
 */
function handleAuthError(error) {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return new Error("Request timed out. Please try again.");
    }
    return new Error(
      "Unable to connect to server. Please check your internet connection.",
    );
  }

  const status = error.response.status;
  const backendMessage =
    error.response.data?.msg || error.response.data?.message;

  switch (status) {
    case 400:
      return new Error(backendMessage || "Invalid input data.");
    case 401:
      return new Error(backendMessage || "Invalid email or password.");
    case 500:
      return new Error(
        "Something went wrong on our end. Please try again later.",
      );
    default:
      return new Error(backendMessage || "An unexpected error occurred.");
  }
}

export { registerUser, loginUser, getCurrentUser };