import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  MailCheck,
  ArrowRight,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { verifyEmail, resendVerification } from "../../services/authService.js";
import styles from "./VerifyEmail.module.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  // State: 'idle' | 'verifying' | 'success' | 'error' | 'already_verified'
  const [status, setStatus] = useState("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState({ type: "", message: "" });

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setFeedbackMessage(
        "No verification token found in this link. Please check your email or request a new link below.",
      );
      return;
    }

    setStatus("verifying");
    setFeedbackMessage("");

    try {
      const response = await verifyEmail(token);
      setStatus("success");
      setFeedbackMessage(
        response.message ||
          "Your email address has been successfully verified! You can now access your account.",
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Could not verify your email. The link may be expired or already used.";

      if (/already\s+(verified|used)/i.test(errorMsg)) {
        setStatus("already_verified");
      } else {
        setStatus("error");
      }
      setFeedbackMessage(errorMsg);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const cleanEmail = resendEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setResendStatus({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setIsResending(true);
    setResendStatus({ type: "", message: "" });

    try {
      const response = await resendVerification(cleanEmail);
      setResendStatus({
        type: "success",
        message:
          response.message ||
          "A fresh verification link has been sent to your email inbox.",
      });
      setResendEmail("");
    } catch (err) {
      setResendStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to resend verification link. Please wait a moment and try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.branding}
          onClick={() => navigate("/")}
        >
          <span className={styles.logoBadge} aria-hidden>
            <MessageSquare size={20} />
          </span>
          <span>
            <p className={styles.title}>Evangadi Forum</p>
            <p className={styles.tagline}>Learn together. Ask with context.</p>
          </span>
        </button>
      </header>

      <main className={styles.main}>
        <Motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* STATE 1: IDLE (WAITING FOR EXPLICIT ACTION - SCANNER SAFE) */}
          {status === "idle" && (
            <div className={styles.contentWrap}>
              <div className={`${styles.iconCircle} ${styles.iconIdle}`}>
                <MailCheck size={32} />
              </div>
              <h1>Confirm your email address</h1>
              <p className={styles.description}>
                Click the button below to complete your registration and activate
                your Evangadi Forum account.
              </p>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleVerify}
                disabled={!token}
              >
                Verify My Email
                <ArrowRight size={16} />
              </button>

              {!token && (
                <div className={styles.alertError} role="alert">
                  <AlertCircle size={16} />
                  <span>No verification token was detected in this link.</span>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: VERIFYING (SPINNER) */}
          {status === "verifying" && (
            <div className={styles.contentWrap}>
              <div className={styles.spinnerWrap}>
                <span className={styles.spinner} aria-hidden />
              </div>
              <h1>Verifying your email...</h1>
              <p className={styles.description}>
                Validating your secure activation token with the server.
              </p>
            </div>
          )}

          {/* STATE 3: SUCCESS */}
          {status === "success" && (
            <div className={styles.contentWrap}>
              <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>
                <CheckCircle2 size={36} />
              </div>
              <h1>Email Verified!</h1>
              <p className={styles.description}>{feedbackMessage}</p>

              <Link to="/auth" className={styles.primaryButton}>
                Proceed to Sign In
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* STATE 4: ALREADY VERIFIED */}
          {status === "already_verified" && (
            <div className={styles.contentWrap}>
              <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>
                <CheckCircle2 size={36} />
              </div>
              <h1>Account Already Active</h1>
              <p className={styles.description}>
                {feedbackMessage ||
                  "This email address has already been verified. You can sign in anytime."}
              </p>

              <Link to="/auth" className={styles.primaryButton}>
                Sign In to Your Account
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* STATE 5: ERROR OR EXPIRED TOKEN */}
          {status === "error" && (
            <div className={styles.contentWrap}>
              <div className={`${styles.iconCircle} ${styles.iconError}`}>
                <AlertCircle size={36} />
              </div>
              <h1>Verification Failed</h1>
              <p className={styles.description}>{feedbackMessage}</p>

              <div className={styles.resendSection}>
                <h3>Need a new activation link?</h3>
                <p>
                  Enter your registered email address and we will dispatch a fresh
                  verification link to your inbox.
                </p>

                {resendStatus.message && (
                  <div
                    className={
                      resendStatus.type === "success"
                        ? styles.alertSuccess
                        : styles.alertError
                    }
                    role="alert"
                  >
                    {resendStatus.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>{resendStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleResend} className={styles.resendForm}>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    disabled={isResending}
                    required
                  />
                  <button
                    type="submit"
                    className={styles.secondaryButton}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <RefreshCw size={14} className={styles.spinIcon} />
                        Sending...
                      </>
                    ) : (
                      "Resend Verification Link"
                    )}
                  </button>
                </form>
              </div>

              <div className={styles.switchRow}>
                <Link to="/auth" className={styles.backLink}>
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </Motion.div>
      </main>
    </div>
  );
};

export default VerifyEmail;
