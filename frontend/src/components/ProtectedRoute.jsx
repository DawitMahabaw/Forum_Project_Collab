import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Prevents unauthenticated users from accessing private pages
const ProtectedRoute = () => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  // Component logic will go here
};

export default ProtectedRoute;
