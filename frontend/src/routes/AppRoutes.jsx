import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

function AuthPagePlaceholder() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "#0d0a24",
        color: "#ffffff",
      }}
    >
      <h1 style={{ margin: 0 }}>Authentication</h1>
      <p style={{ margin: 0, color: "#c7c3e8" }}>
        Sign in and registration arrive with the Auth page task (T-07).
      </p>
      <Link to="/" style={{ color: "#a5b4fc" }}>
        Back to home
      </Link>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPagePlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;