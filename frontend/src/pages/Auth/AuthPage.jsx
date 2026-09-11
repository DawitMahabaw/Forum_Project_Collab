import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Code,
  ArrowRight,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import styles from "./AuthPage.module.css";

/*
 * ============================================================
 * AUTHENTICATION PAGE
 * ============================================================
 *
 * This page handles both:
 *
 * 1. User registration
 * 2. User login
 *
 * The actual API communication is NOT handled here.
 *
 * AuthPage
 *    ↓
 * AuthContext
 *    ↓
 * authService
 *    ↓
 * api.js
 *    ↓
 * Backend
 *
 * This keeps our architecture clean.
 *
 * NOTE ON AUTO-LOGIN:
 * Our backend's /api/auth/register endpoint returns a JWT along
 * with the new user (see authController.js). AuthContext's
 * register() stores that token immediately, exactly like login()
 * does. That means, in THIS project, a successful registration
 * already leaves the user authenticated — we don't need a
 * separate "please log in now" step.
 * ============================================================
 */

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  /*
   * Determines whether the page is showing the
   * login form or the registration form.
   */
  const [isRegistering, setIsRegistering] = useState(false);

  /*
   * Form data.
   *
   * We use one state object for both login and
   * registration.
   */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  /*
   * Toggles the password field between masked ("password") and
   * plain-text ("text") display. Purely a UI convenience — it
   * does not change what gets sent to the backend.
   */
  const [showPassword, setShowPassword] = useState(false);

  /*
   * Stores an error message that should be shown
   * to the user.
   */
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Prevents the user from submitting the form
   * multiple times while the request is running.
   */
  const [isLoading, setIsLoading] = useState(false);

  /*
   * ----------------------------------------------------------
   * HANDLE INPUT
   * ----------------------------------------------------------
   *
   * Updates the appropriate property in formData whenever
   * the user types into an input.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    /*
     * Remove an old error as soon as the user starts
     * correcting the form.
     */
    setError("");
  };

  /*
   * ----------------------------------------------------------
   * HANDLE FORM SUBMISSION
   * ----------------------------------------------------------
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    if (isRegistering) {
      if (formData.firstName.trim().length < 2) {
        setError("First name must contain at least 2 characters.");
        return;
      }

      if (formData.lastName.trim().length < 2) {
        setError("Last name must contain at least 2 characters.");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
    }

    setIsLoading(true);

    try {
      /*
       * Registration
       */
      if (isRegistering) {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email,
          password: formData.password,
        });
        setSuccess("Registration successful! Please sign in.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        setShowPassword(false);
        setIsRegistering(false);
        return;
      } else {
        /*
         * Login
         */
        await login({
          email,
          password: formData.password,
        });
      }

      /*
       * Authentication succeeded.
       *
       * Both login() and register() already stored the JWT and
       * the user in AuthContext by this point (see
       * context/AuthContext.jsx), so we can send the user
       * straight to the protected dashboard.
       */
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (requestError) {
      /*
       * The backend sends useful error messages such as:
       *
       * "Invalid email or password."
       *
       * or:
       *
       * "An account with this email already exists."
       */
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.msg ||
        (requestError.response
          ? `Request failed (${requestError.response.status}). Please try again.`
          : "Unable to connect to the server. Make sure the backend is running on port 4000.");

      setError(message);
    } finally {
      /*
       * Whether the request succeeds or fails,
       * loading must stop.
       */
      setIsLoading(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * SWITCH LOGIN / REGISTER
   * ----------------------------------------------------------
   */
  const toggleMode = () => {
    setIsRegistering((previousMode) => !previousMode);

    /*
     * Clear previous form information and errors when
     * switching between login and registration.
     */
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });

    setShowPassword(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className={styles.page}>
      {/* ------------------------------------------------------
       * LEFT: BRANDING PANEL
       * ------------------------------------------------------ */}
      <section className={styles.infoPanel}>
        <div className={styles.infoContent}>
          <header className={styles.infoHeader}>
            <button
              type="button"
              className={styles.infoBranding}
              onClick={() => navigate("/")}
            >
              <span className={styles.infoLogo} aria-hidden>
                <MessageSquare className={styles.infoLogoIcon} size={22} />
              </span>
              <span>
                <p className={styles.infoTitle}>Evangadi Forum</p>
                <p className={styles.infoTagline}>
                  Learn together. Ask with context.
                </p>
              </span>
            </button>
            <p className={styles.infoDescription}>
              Sign in to post technical questions, follow threads, and search
              the forum with both keyword and AI similarity modes, built for
              Evangadi coursework and peer review.
            </p>
          </header>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Visible reasoning</h3>
                <p className={styles.featureDescription}>
                  Threads stay readable: markdown, code blocks, and replies
                  build a mini knowledge base your cohort can revisit before
                  exams.
                </p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Code size={20} />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Low-friction workflow</h3>
                <p className={styles.featureDescription}>
                  One layout for asking, answering, and scanning search results,
                  so you spend energy on the problem, not on hunting controls.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.infoFooter}>
            <div className={styles.infoFooterContent}>
              <div className={styles.infoAvatars} aria-hidden>
                {[1, 2, 3].map((index) => (
                  <img
                    key={index}
                    src={`https://picsum.photos/seed/${index + 50}/100/100`}
                    className={styles.infoAvatar}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <span className={styles.infoBadge}>
                Evangadi cohorts · weekly stand-ups · office-hour style help
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------
       * RIGHT: FORM CARD
       * ------------------------------------------------------ */}
      <section className={styles.formSection}>
        <div className={styles.formCard}>
          {/*
           * AnimatePresence + a changing "key" is Framer Motion's
           * pattern for cross-fading between two different pieces
           * of content — here, the Login form vs the Register form.
           */}
          <AnimatePresence mode="wait">
            <Motion.div
              key={isRegistering ? "register" : "login"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <header className={styles.formHeader}>
                <h1>
                  {isRegistering
                    ? "Create an account"
                    : "Sign in to your account"}
                </h1>
                <p>
                  {isRegistering
                    ? "Complete the form below to create your account."
                    : "Enter your email address and password to continue."}
                </p>
              </header>

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>
                {isRegistering && (
                  <>
                    <div className={styles.field}>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        autoComplete="given-name"
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </>
                )}

                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      id="password"
                      name="password"
                      /*
                       * Toggling the "type" attribute between
                       * "password" and "text" is what shows/hides
                       * the characters.
                       */
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete={
                        isRegistering ? "new-password" : "current-password"
                      }
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden />
                      ) : (
                        <Eye size={18} aria-hidden />
                      )}
                    </button>
                  </div>
                </div>

                {success && (
                  <div className={styles.success} role="status">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : isRegistering
                      ? "Create Account"
                      : "Sign In"}
                  {!isLoading && <ArrowRight size={16} aria-hidden />}
                </button>
              </form>

              <div className={styles.divider} aria-hidden>
                <span>Additional options</span>
              </div>

              <div className={styles.switch}>
                {isRegistering
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className={styles.switchButton}
                >
                  {isRegistering ? "Back to sign in" : "Create an account"}
                </button>
              </div>
            </Motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
