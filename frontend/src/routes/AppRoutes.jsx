import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Layout from "../components/Layout/Layout.jsx";

import AuthPage from "../pages/Auth/AuthPage.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import LandingPage from "../pages/Landing/LandingPage.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected application pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
