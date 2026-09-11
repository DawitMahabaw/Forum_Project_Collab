import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import LandingPage from "../pages/Landing/LandingPage.jsx";
import AuthPage from "../pages/Auth/AuthPage.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";

const AppRoutes = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
