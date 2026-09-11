/*
 * ============================================================
 * AUTHENTICATION STORAGE UTILITIES
 * ============================================================
 *
 * The backend gives us a JWT after successful registration
 * or login.
 *
 * We need to store that token in the browser so that thehttps://github.com/DawitMahabaw/Forum_Project_Collab.git
 * frontend can remember the authenticated session.
 *
 * We keep the browser-storage logic in this file instead
 * of spreading localStorage calls throughout the application.
 * ============================================================
 */

const TOKEN_KEY = "evangadi_auth_token";
