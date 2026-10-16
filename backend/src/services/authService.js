import crypto from "node:crypto";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import env from "../config/env.js";
import { OAuth2Client } from "google-auth-library";

const googleAuthClient = new OAuth2Client();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateToken,
  generateResetToken,
  verifyToken,
} from "../utils/jwt.js";
import {
  getPasswordResetHTML,
  getEmailVerificationHTML,
} from "../utils/emailTemplates.js";
import {
  isDisposableEmail,
  normalizeEmail,
  DISPOSABLE_EMAIL_ERROR_MESSAGE,
} from "../utils/emailValidation.js";

const hashVerificationToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

const sendAccountVerificationEmail = async (email, firstName, rawToken) => {
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${rawToken}`;
  const emailHtml = getEmailVerificationHTML({
    firstName,
    verifyLink: verifyUrl,
    expiresHours: 24,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });

  await transporter.sendMail({
    from: `"Evangadi Forum Support" <${env.emailUser}>`,
    to: email,
    subject: "Verify your email address - Evangadi Forum",
    html: emailHtml,
  });
};

// ============================================================
// REGISTER USER
// ============================================================

const registerUser = async ({ firstName, lastName, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  // 1. Block disposable / temporary email domains
  if (isDisposableEmail(normalizedEmail)) {
    const error = new Error(DISPOSABLE_EMAIL_ERROR_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate password length
  if (password.length < 8) {
    const error = new Error("Password must contain at least 8 characters.");
    error.statusCode = 400;
    throw error;
  }

  // 3. Check whether an account already exists with this email
  const existingUser = await User.findByEmail(normalizedEmail);

  if (existingUser) {
    // If the account was already verified, disallow duplicate registration
    if (existingUser.is_verified) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    // Unverified account handling:
    // If user previously registered with an unverified email, refresh password and token, and resend
    const passwordHash = await hashPassword(password);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashVerificationToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.updateUnverifiedRegistration(existingUser.user_id, {
      firstName,
      lastName,
      passwordHash,
      tokenHash,
      expiresAt,
    });

    try {
      await sendAccountVerificationEmail(normalizedEmail, firstName, rawToken);
    } catch (emailErr) {
      console.error("[Registration Email Error]:", emailErr.message);
      return {
        message:
          "Account updated, but the verification email could not be sent. Please use the 'Resend verification' option.",
        unverified: true,
      };
    }

    return {
      message:
        "Account created! Please check your email to activate your account.",
      unverified: true,
    };
  }

  // Hash the password before storing it in the database
  const passwordHash = await hashPassword(password);
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create unverified account
  await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
    isVerified: false,
    verificationToken: tokenHash,
    verificationExpires: expiresAt,
  });

  try {
    await sendAccountVerificationEmail(normalizedEmail, firstName, rawToken);
  } catch (emailErr) {
    console.error("[Registration Email Error]:", emailErr.message);
    return {
      message:
        "Account created, but the verification email could not be sent. Please use 'Resend verification'.",
      unverified: true,
    };
  }

  return {
    message:
      "Account created! Please check your email to activate your account.",
    unverified: true,
  };
};

// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findByEmail(normalizedEmail);

  if (!user || !user.password_hash) {
    const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 1. Password must be checked first before revealing unverified status
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 2. Reject unverified accounts with HTTP 403
  if (!user.is_verified) {
    const error = new Error(
      "Please verify your email address before signing in. Check your inbox or request a new activation link.",
    );
    error.statusCode = 403;
    error.unverified = true;
    error.email = user.email;
    throw error;
  }

  // Generate a JWT after successful verified authentication
  const token = generateToken(user.user_id);

  return {
    user: toAuthenticatedUser(user),
    token,
  };
};


// ============================================================
// GET CURRENT USER
// ============================================================

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role || "user",
    avatarUrl: user.avatar_url || null,
    headline: user.headline || null,
  };
};


// ============================================================
// FORGOT PASSWORD
// ============================================================
const forgotPassword = async (email) => {
  // 1. Verify if the user exists in the database
  const user = await User.findByEmail(email);

  if (!user) {
    const error = new Error("No account found with this email address.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Generate a secure, short-lived reset token (15 mins) using your JWT utility
  const resetToken = generateResetToken(user.user_id);

  // 3. Construct the password reset URL for your Vite frontend application
  const resetUrl = `${env.frontendUrl}/reset-password/${resetToken}`;

  // 4. Generate the HTML template (passing only the resetUrl argument)
  const emailHtml = getPasswordResetHTML(resetUrl);

  // 5. Configure Nodemailer Transporter using the simplified Gmail service setting
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser, // Loaded from process.env.EMAIL_USER
      pass: env.emailPass, // Loaded from process.env.EMAIL_PASS (16-character App Password)
    },
  });

  // 6. Transmit the email to the user
  await transporter.sendMail({
    from: `"Evangadi Forum Support" <${env.emailUser}>`,
    to: user.email,
    subject: "Password Reset Request",
    html: emailHtml,
  });

  return { message: "Reset token sent successfully." };
};

// ============================================================
// RESET PASSWORD CONFIRM
// ============================================================
const resetPasswordConfirm = async (token, newPassword) => {
  let decoded;

  // 1. Verify the validity and expiration of the JWT reset token
  try {
    decoded = verifyToken(token);
  } catch (err) {
    const error = new Error("The reset link is invalid or has expired.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate the dedicated token purpose flag for strict safety
  if (decoded.purpose !== "password_reset") {
    const error = new Error("Invalid token authorization category.");
    error.statusCode = 400;
    throw error;
  }

  // 3. Extract the userId from the valid token payload
  const userId = decoded.userId; 
  if (!userId) {
    const error = new Error("Invalid token payload configuration.");
    error.statusCode = 400;
    throw error;
  }

  // 4. Enforce the standard 8-character password length rule
  if (newPassword.length < 8) {
    const error = new Error("New password must contain at least 8 characters.");
    error.statusCode = 400;
    throw error;
  }

  // 5. Securely hash the incoming new password
  const newPasswordHash = await hashPassword(newPassword);

  // 6. Update the database record reusing your teammate's model function
  const updateSuccess = await User.updatePassword(userId, newPasswordHash);

  if (!updateSuccess) {
    const error = new Error("Password reset operation failed. Account not found.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "Password updated successfully." };
};


// ============================================================
// GET USER PROFILE (WITH COMPUTED STATS)
// ============================================================

const getUserProfile = async (userId) => {
  const profile = await User.getProfileWithStats(userId);

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role || "user",
    avatarUrl: profile.avatar_url || null,
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    githubUrl: profile.github_url || "",
    portfolioUrl: profile.portfolio_url || "",
    createdAt: profile.created_at,
    questionsCount: Number(profile.questions_count) || 0,
    answersCount: Number(profile.answers_count) || 0,
  };
};

// ============================================================
// UPDATE USER PROFILE
// ============================================================

const updateUserProfile = async (userId, { headline, bio, location, githubUrl, portfolioUrl }) => {
  const profile = await User.updateProfile(userId, { headline, bio, location, githubUrl, portfolioUrl });

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    avatarUrl: profile.avatar_url || null,
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    githubUrl: profile.github_url || "",
    portfolioUrl: profile.portfolio_url || "",
    createdAt: profile.created_at,
    questionsCount: Number(profile.questions_count) || 0,
    answersCount: Number(profile.answers_count) || 0,
  };
};

// ============================================================
// UPDATE AVATAR
// ============================================================

const updateUserAvatar = async (userId, avatarUrl) => {
  const profile = await User.updateAvatar(userId, avatarUrl);

  if (!profile) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    avatarUrl: profile.avatar_url,
  };
};

// ============================================================
// UPDATE ACCOUNT INFORMATION (FIRST NAME, LAST NAME, EMAIL)
// ============================================================

const updateUserAccount = async (userId, { firstName, lastName, email }) => {
  // If email was changed, ensure no other user has it
  const existingUser = await User.findByEmail(email);

  if (existingUser && Number(existingUser.user_id) !== Number(userId)) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const updated = await User.updateAccount(userId, { firstName, lastName, email });

  if (!updated) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    userId: updated.user_id,
    firstName: updated.first_name,
    lastName: updated.last_name,
    email: updated.email,
    role: updated.role || "user",
    avatarUrl: updated.avatar_url || null,
    headline: updated.headline || null,
  };
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByIdWithPassword(userId);

  if (!user || !user.password_hash) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error("New password must contain at least 8 characters.");
    error.statusCode = 400;
    throw error;
  }

  const newPasswordHash = await hashPassword(newPassword);
  await User.updatePassword(userId, newPasswordHash);

  return { message: "Password updated successfully." };
};

// ============================================================
// GOOGLE AUTHENTICATION (SIGN-IN / SIGN-UP)
// ============================================================
const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isDuplicateEntryError = (error) => error?.code === "ER_DUP_ENTRY";

const toGoogleVerificationError = (cause) => {
  const providerMessage = String(cause?.message || "");

  if (/audience|recipient/i.test(providerMessage)) {
    return createHttpError(
      "Google sign-in is configured with a different client ID. Ensure VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID match.",
      401,
    );
  }

  if (/\bexpired\b|\bexpiration\b|\btoo late\b/i.test(providerMessage)) {
    return createHttpError(
      "Google sign-in session expired. Try again; if it persists, synchronize the server system clock.",
      401,
    );
  }

  return createHttpError("Invalid Google authentication token. Please try again.", 401);
};

const toAuthenticatedUser = (user) => ({
  userId: user.user_id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  role: user.role || "user",
  avatarUrl: user.avatar_url || null,
  headline: user.headline || null,
  isVerified: Boolean(user.is_verified),
  isGoogleLinked: Boolean(user.google_id),
});

// ============================================================
// VERIFY EMAIL
// ============================================================

const verifyEmail = async (rawToken) => {
  if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
    const error = new Error("Verification token is required.");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashVerificationToken(rawToken.trim());
  const user = await User.findByVerificationTokenHash(tokenHash);

  if (!user) {
    const error = new Error(
      "Invalid or already used verification link. If your account is not verified, please request a new link.",
    );
    error.statusCode = 400;
    throw error;
  }

  // Check expiration
  if (
    user.verification_expires &&
    new Date(user.verification_expires).getTime() < Date.now()
  ) {
    const error = new Error(
      "This verification link has expired. Please request a new verification email.",
    );
    error.statusCode = 400;
    error.expired = true;
    error.email = user.email;
    throw error;
  }

  await User.markAsVerified(user.user_id);

  return {
    message: "Your email has been successfully verified! You can now sign in.",
    user: toAuthenticatedUser(user),
  };
};

// ============================================================
// RESEND VERIFICATION EMAIL
// ============================================================

const resendVerification = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (isDisposableEmail(normalizedEmail)) {
    const error = new Error(DISPOSABLE_EMAIL_ERROR_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByEmail(normalizedEmail);

  // Return generic, friendly message to prevent account enumeration
  if (!user || user.is_verified) {
    return {
      message:
        "If an unverified account exists with that email address, a new verification link has been sent.",
    };
  }

  // Cooldown protection: if a token was issued in the last 60 seconds, enforce rate limit
  if (user.verification_expires) {
    const expiresTime = new Date(user.verification_expires).getTime();
    const issuedTime = expiresTime - 24 * 60 * 60 * 1000;
    const elapsedSeconds = (Date.now() - issuedTime) / 1000;

    if (elapsedSeconds < 60) {
      const waitSeconds = Math.ceil(60 - elapsedSeconds);
      const error = new Error(
        `Please wait ${waitSeconds} seconds before requesting another verification email.`,
      );
      error.statusCode = 429;
      throw error;
    }
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await User.setVerificationTokenHash(user.user_id, tokenHash, expiresAt);

  try {
    await sendAccountVerificationEmail(user.email, user.first_name, rawToken);
  } catch (emailErr) {
    console.error("[Resend Verification Email Error]:", emailErr.message);
    const error = new Error(
      "Could not send verification email right now. Please try again later.",
    );
    error.statusCode = 500;
    throw error;
  }

  return {
    message:
      "A new verification link has been sent. Please check your inbox.",
  };
};

const getGoogleIdentity = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw createHttpError("Google ID token is required.", 400);
  }

  if (!env.googleClientId) {
    const error = createHttpError(
      "Google sign-in is not configured on the server. Set GOOGLE_CLIENT_ID and try again.",
      503,
    );
    // This is an actionable configuration state, not an internal failure.
    error.expose = true;
    throw error;
  }

  let payload;
  try {
    // The Google library validates the ID token signature, configured
    // audience, issuer, and expiration before exposing the payload.
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw toGoogleVerificationError(error);
  }

  const googleId = typeof payload?.sub === "string" ? payload.sub.trim() : "";
  const email = typeof payload?.email === "string"
    ? payload.email.trim().toLowerCase()
    : "";

  if (!googleId || !emailPattern.test(email)) {
    throw createHttpError("Google did not provide a valid account identity.", 401);
  }

  if (payload.email_verified !== true) {
    throw createHttpError(
      "Your Google email is not verified. Please verify it with Google first.",
      400,
    );
  }

  const nameParts = typeof payload.name === "string"
    ? payload.name.trim().split(/\s+/).filter(Boolean)
    : [];
  const givenName = typeof payload.given_name === "string"
    ? payload.given_name.trim()
    : "";
  const familyName = typeof payload.family_name === "string"
    ? payload.family_name.trim()
    : "";
  const firstName = (givenName || nameParts[0] || "Google").slice(0, 100);
  const lastName = (familyName || nameParts.slice(1).join(" ") || "User").slice(
    0,
    100,
  );
  const avatarUrl = typeof payload.picture === "string"
    ? payload.picture.trim().slice(0, 500) || null
    : null;

  return { googleId, email, firstName, lastName, avatarUrl };
};

const createGoogleAuthenticationResponse = (user) => ({
  user: toAuthenticatedUser(user),
  token: generateToken(user.user_id),
});

const existingEmailAccountError = () =>
  createHttpError(
    "An account with this email already exists. Sign in with your password, then link Google from Settings.",
    409,
  );

const authenticateWithGoogle = async (idToken) => {
  const identity = await getGoogleIdentity(idToken);

  // 1. Returning Google user with matching google_id
  let user = await User.findByGoogleId(identity.googleId);
  if (user) {
    return createGoogleAuthenticationResponse(user);
  }

  // 2. Check if an account exists with this email address
  const existingUser = await User.findByEmail(identity.email);
  if (existingUser) {
    // PRE-REGISTRATION TAKEOVER DEFENSE:
    // If someone pre-registered the victim's email address with a password but NEVER verified it,
    // the legitimate owner is now signing in with Google (which certifies email ownership).
    // In this case, wipe the unverified password backdoor and claim the account as verified Google user!
    if (!existingUser.is_verified) {
      user = await User.claimUnverifiedAccountWithGoogle(existingUser.user_id, {
        googleId: identity.googleId,
        avatarUrl: identity.avatarUrl,
      });
      return createGoogleAuthenticationResponse(user);
    }

    // If the account was ALREADY VERIFIED with a password:
    // Do NOT silently link; require the user to sign in with password first and link in Settings.
    throw existingEmailAccountError();
  }

  // 3. New user registration via Google (certified as verified by Google)
  try {
    const newUser = await User.createGoogleUser({
      ...identity,
      role: "user",
    });
    user = await User.findById(newUser.userId);
  } catch (error) {
    if (!isDuplicateEntryError(error)) throw error;

    // Two requests for the same Google credential can arrive together. If the
    // other request won the unique-key race, it is now a normal returning user.
    user = await User.findByGoogleId(identity.googleId);
    if (!user) throw existingEmailAccountError();
  }

  return createGoogleAuthenticationResponse(user);
};

const linkGoogleAccount = async (userId, idToken) => {
  const identity = await getGoogleIdentity(idToken);
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw createHttpError("User not found.", 404);
  }

  if (currentUser.email !== identity.email) {
    throw createHttpError(
      "Use the Google account with the same email as your forum account.",
      400,
    );
  }

  const linkedUser = await User.findByGoogleId(identity.googleId);
  if (linkedUser && Number(linkedUser.user_id) !== Number(userId)) {
    throw createHttpError("This Google account is already linked to another user.", 409);
  }

  if (currentUser.google_id && currentUser.google_id !== identity.googleId) {
    throw createHttpError("A different Google account is already linked.", 409);
  }

  if (currentUser.google_id === identity.googleId) {
    return { user: toAuthenticatedUser(currentUser), alreadyLinked: true };
  }

  let updatedUser;
  try {
    updatedUser = await User.linkGoogleAccount(
      userId,
      identity.googleId,
      identity.avatarUrl,
    );
  } catch (error) {
    if (!isDuplicateEntryError(error)) throw error;
    throw createHttpError("This Google account is already linked to another user.", 409);
  }

  return { user: toAuthenticatedUser(updatedUser), alreadyLinked: false };
};

export {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  hashVerificationToken,
  getCurrentUser,
  forgotPassword,
  resetPasswordConfirm,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserAccount,
  changeUserPassword,
  authenticateWithGoogle,
  linkGoogleAccount,
};

