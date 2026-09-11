import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import AuthPage from "../pages/Auth/AuthPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;