import {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  updateUserAccount,
  changeUserPassword,
} from "../services/authService.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateTextField = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} is required.`;
  }

  if (typeof value !== "string") {
    return `${fieldName} must be text.`;
  }

  if (!value.trim()) {
    return `${fieldName} is required.`;
  }

  return null;
};

const validatePasswordField = (password) => {
  if (password === undefined || password === null || password === "") {
    return "Password is required.";
  }

  if (typeof password !== "string") {
    return "Password must be text.";
  }

  return null;
};

// ============================================================
// REGISTRATION INPUT VALIDATION
// ============================================================

const validateRegistrationInput = (input) => {
  if (!isPlainObject(input)) {
    return "Request body must be a JSON object.";
  }

  const { firstName, lastName, email, password } = input;

  const firstNameError = validateTextField(firstName, "First name");
  if (firstNameError) {
    return firstNameError;
  }

  const lastNameError = validateTextField(lastName, "Last name");
  if (lastNameError) {
    return lastNameError;
  }

  const emailError = validateTextField(email, "Email");
  if (emailError) {
    return emailError;
  }

  const passwordError = validatePasswordField(password);
  if (passwordError) {
    return passwordError;
  }

  if (firstName.trim().length < 2) {
    return "First name must contain at least 2 characters.";
  }

  if (lastName.trim().length < 2) {
    return "Last name must contain at least 2 characters.";
  }

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  return null;
};

// ============================================================
// LOGIN INPUT VALIDATION
// ============================================================

const validateLoginInput = (input) => {
  if (!isPlainObject(input)) {
    return "Request body must be a JSON object.";
  }

  const { email, password } = input;

  const emailError = validateTextField(email, "Email");
  if (emailError) {
    return emailError;
  }

  const passwordError = validatePasswordField(password);
  if (passwordError) {
    return passwordError;
  }

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  return null;
};

// ============================================================
// REGISTER CONTROLLER
// ============================================================

const register = async (req, res, next) => {
  try {
    const validationError = validateRegistrationInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { firstName, lastName, email, password } = req.body;

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const result = await registerUser({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// LOGIN CONTROLLER
// ============================================================

const login = async (req, res, next) => {
  try {
    const validationError = validateLoginInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const result = await loginUser({
      email: normalizedEmail,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CURRENT USER CONTROLLER
// ============================================================

const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PROFILE CONTROLLERS
// ============================================================

const getProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.userId);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      headline = "",
      bio = "",
      location = "",
      githubUrl = "",
    } = req.body || {};

    const sanitizedData = {
      headline:
        typeof headline === "string" ? headline.trim().slice(0, 150) : "",
      bio: typeof bio === "string" ? bio.trim().slice(0, 1000) : "",
      location:
        typeof location === "string" ? location.trim().slice(0, 100) : "",
      githubUrl:
        typeof githubUrl === "string" ? githubUrl.trim().slice(0, 255) : "",
    };

    const updatedProfile = await updateUserProfile(
      req.user.userId,
      sanitizedData,
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload.",
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await updateUserAvatar(req.user.userId, avatarUrl);

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      avatarUrl: result.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ACCOUNT & SECURITY CONTROLLERS
// ============================================================

const updateAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body || {};

    const firstNameError = validateTextField(firstName, "First name");
    if (firstNameError)
      return res.status(400).json({ success: false, message: firstNameError });

    const lastNameError = validateTextField(lastName, "Last name");
    if (lastNameError)
      return res.status(400).json({ success: false, message: lastNameError });

    const emailError = validateTextField(email, "Email");
    if (emailError)
      return res.status(400).json({ success: false, message: emailError });

    if (firstName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "First name must contain at least 2 characters.",
      });
    }

    if (lastName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Last name must contain at least 2 characters.",
      });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const updatedUser = await updateUserAccount(req.user.userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    });

    return res.status(200).json({
      success: true,
      message: "Account information updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is required." });
    }

    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters.",
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    const result = await changeUserPassword(req.user.userId, {
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
  uploadAvatar,
  updateAccount,
  changePassword,
};
