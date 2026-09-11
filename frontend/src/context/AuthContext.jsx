// ============================================================
// AUTHENTICATION CONTEXT
// ============================================================
//
// AuthContext provides authentication state and authentication
// actions to the entire React application.
//
// It is responsible for:
//
// 1. Keeping the current user in React state.
// 2. Keeping the JWT in React state.
// 3. Registering users.
// 4. Logging users in.
// 5. Logging users out.
// 6. Restoring the user after a browser refresh.
//
// Architecture:
//
// React Application
//        ↓
//   AuthProvider
//        ↓
//   Authentication State
//        ↓
// Pages / Components
//
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService.js";

import { getToken, removeToken, saveToken } from "../utils/auth.js";

// ============================================================
// CREATE AUTHENTICATION CONTEXT
// ============================================================

const AuthContext = createContext(null);

// ============================================================
// AUTH PROVIDER
// ============================================================

const AuthProvider = ({ children }) => {
  // ----------------------------------------------------------
  // Current authenticated user.
  // ----------------------------------------------------------

  const [user, setUser] = useState(null);

  // ----------------------------------------------------------
  // JWT stored in React state.
  //
  // We initialize it from localStorage so an existing token
  // survives a browser refresh.
  // ----------------------------------------------------------

  const [token, setToken] = useState(() => {
    return getToken();
  });

  // ----------------------------------------------------------
  // Indicates whether the application is checking an existing
  // authentication token when the application starts.
  //
  // Without this state, ProtectedRoute could redirect the user
  // before we finish checking the token.
  // ----------------------------------------------------------

  const [isInitializing, setIsInitializing] = useState(true);

  // ==========================================================
  // RESTORE AUTHENTICATION
  // ==========================================================
  //
  // This runs when the application first loads.
  //
  // If a JWT exists:
  //
  // JWT
  //  ↓
  // GET /auth/me
  //  ↓
  // Backend verifies JWT
  //  ↓
  // Backend returns user
  //  ↓
  // setUser()
  //
  // ==========================================================

  useEffect(() => {
    const restoreAuthentication = async () => {
      const storedToken = getToken();

      // ----------------------------------------------------
      // No token means there is no authenticated session.
      // ----------------------------------------------------

      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        // --------------------------------------------------
        // Ask backend who owns this token.
        // --------------------------------------------------

        const response = await getCurrentUser();

        // --------------------------------------------------
        // Restore the user into React state.
        // --------------------------------------------------

        setUser(response.user);

        setToken(storedToken);
      } catch (error) {
        // --------------------------------------------------
        // If the token is invalid or expired, remove it.
        // --------------------------------------------------

        removeToken();

        setToken(null);
        setUser(null);
      } finally {
        // --------------------------------------------------
        // Authentication initialization is complete.
        // --------------------------------------------------

        setIsInitializing(false);
      }
    };

    restoreAuthentication();
  }, []);

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (userData) => {
    const response = await registerUser(userData);
    return response;
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    // --------------------------------------------------------
    // Save authenticated user.
    // --------------------------------------------------------

    setUser(response.user);

    // --------------------------------------------------------
    // Save JWT in React state.
    // --------------------------------------------------------

    setToken(response.token);

    // --------------------------------------------------------
    // Persist JWT in localStorage.
    // --------------------------------------------------------

    saveToken(response.token);

    return response;
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    // --------------------------------------------------------
    // Remove user from React state.
    // --------------------------------------------------------

    setUser(null);

    // --------------------------------------------------------
    // Remove token from React state.
    // --------------------------------------------------------

    setToken(null);

    // --------------------------------------------------------
    // Remove token from localStorage.
    // --------------------------------------------------------

    removeToken();
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    user,
    token,
    isInitializing,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// USE AUTH HOOK
// ============================================================
//
// Components use:
//
// const { user, login, logout } = useAuth();
//
// instead of accessing AuthContext directly.
//
// ============================================================

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};

// ============================================================
// EXPORT
// ============================================================

export { AuthProvider, useAuth };
