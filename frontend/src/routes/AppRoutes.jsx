import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Layout from "../components/Layout/Layout.jsx";

import PostQuestion from "../pages/PostQuestion/PostQuestion.jsx";
import AuthPage from "../pages/Auth/AuthPage.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import QuestionDetail from "../pages/QuestionDetail/QuestionDetail.jsx";
import MyQuestions from "../pages/MyQuestions/MyQuestions.jsx";

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
            <Route path="/questions/ask" element={<PostQuestion />} />
            <Route
              path="/questions/:questionHash"
              element={<QuestionDetail />}
            />
            <Route path="/my-questions" element={<MyQuestions />} />
          </Route>
        </Route>

        {/* ------------------------------------------------
         * UNKNOWN ROUTES
         * ------------------------------------------------ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
