import express from "express";
import {
  register,
  login,
  googleLogin,
  linkGoogle,
  getMe,
  initiatePasswordReset,
  handlePasswordResetConfirm,
  getProfile,
  updateProfile,
  uploadAvatar,
  updateAccount,
  changePassword,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/authController.js";
import authenticate from "../middleware/authMiddleware.js";
import avatarUpload from "../middleware/avatarUploadMiddleware.js";
import {
  registerLimiter,
  resendVerificationLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerLimiter, register);

router.post("/login", login);

// Two-step scanner-safe email verification
router.post("/verify-email", verifyEmailController);

// Resend verification link
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  resendVerificationController,
);


router.post("/google", googleLogin);

router.post("/google/link", authenticate, linkGoogle);

router.get("/me", authenticate, getMe);

// Profile endpoints
router.get("/profile", authenticate, getProfile);

router.put("/profile", authenticate, updateProfile);

router.post(
  "/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  uploadAvatar,
);

router.post("/forgot-password", initiatePasswordReset);
router.post("/reset-password-confirm", handlePasswordResetConfirm);
// Account & Password settings endpoints
router.put("/account", authenticate, updateAccount);

router.put("/change-password", authenticate, changePassword);

export default router;
