/*
 * ============================================================
 * AUTHENTICATION STORAGE UTILITIES
 * ============================================================
 *
 * The backend gives us a JWT after successful registration
 * or login.
 *
 * We need to store that token in the browser so that the https://github.com/DawitMahabaw/Forum_Project_Collab.git
 * frontend can remember the authenticated session.
 *
 * We keep the browser-storage logic in this file instead
 * of spreading localStorage calls throughout the application.
 * ============================================================
 */

const TOKEN_KEY = "evangadi_auth_token";


/*
 * ------------------------------------------------------------
 * STORE TOKEN
 * ------------------------------------------------------------
 *
 * Saves the JWT in localStorage.
 *
 * localStorage survives a browser refresh, so the token
 * remains available during the user's session.
 */
const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};


/*
 * ------------------------------------------------------------
 * GET TOKEN
 * ------------------------------------------------------------
 *
 * Retrieves the JWT from localStorage.
 *
 * Returns null when no token exists.
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
