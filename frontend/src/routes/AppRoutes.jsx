import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";


import LandingPage from "../pages/Landing/LandingPage.jsx";
import AuthPage from "../pages/Auth/AuthPage.jsx";


const AppRoutes = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
