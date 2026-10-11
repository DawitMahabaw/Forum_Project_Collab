import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import {
  googleClientId,
  isGoogleAuthConfigured,
} from "./config/googleAuth.js";

const application = (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")).render(
  isGoogleAuthConfigured ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {application}
    </GoogleOAuthProvider>
  ) : (
    application
  ),
);
