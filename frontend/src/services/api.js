import axios from "axios";
import { getToken } from "../utils/auth.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ============================================================
// CREATE AXIOS CLIENT
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to attach the JWT token to headers.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor to handle global 401 unauthorized errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("evangadi_auth_token");

      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
