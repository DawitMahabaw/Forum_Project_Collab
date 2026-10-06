import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Route guard: restricts access exclusively to users with the "admin" role
const AdminRoute = () => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  // Wait while authentication state initializes
  if (isInitializing) {
    return (
      <main>
        <p>Checking permissions...</p>
      </main>
    );
  }

  // 1. Not logged in -> redirect to login/auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Logged in, but NOT an admin -> redirect to user dashboard
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Authenticated Admin -> allow access
  return <Outlet />;
};

export default AdminRoute;
