import axios from "axios";

<<<<<<< HEAD
import { getToken } from "../utils/auth.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,

=======
/**
 * Configured axios instance for API communication.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3777",
  timeout: 10000,
>>>>>>> df26f27a071aae84324a47b51ca253ace6c1b86f
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to attach the JWT token to headers.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

<<<<<<< HEAD
export default api;
=======
/**
 * Response interceptor to handle global 401 unauthorized errors.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Skip global 401 redirect for auth endpoints so components can handle login/register errors
    const isAuthEndpoint =
      error.config?.url?.includes("/api/auth/login") ||
      error.config?.url?.includes("/api/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

export { apiClient };
>>>>>>> df26f27a071aae84324a47b51ca253ace6c1b86f
