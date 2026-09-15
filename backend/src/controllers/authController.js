import {
  registerUser,
  loginUser,
  getCurrentUser,
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

  // ----------------------------------------------------------
  // Check required fields one by one.
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Validate first name length.
  // ----------------------------------------------------------

  if (firstName.trim().length < 2) {
    return "First name must contain at least 2 characters.";
  }

  // ----------------------------------------------------------
  // Validate last name length.
  // ----------------------------------------------------------

  if (lastName.trim().length < 2) {
    return "Last name must contain at least 2 characters.";
  }

  // ----------------------------------------------------------
  // Validate email format.
  // ----------------------------------------------------------

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  // ----------------------------------------------------------
  // Validate password length.
  // ----------------------------------------------------------

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
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

  // ----------------------------------------------------------
  // Check email first.
  // ----------------------------------------------------------

  const emailError = validateTextField(email, "Email");
  if (emailError) {
    return emailError;
  }

  // ----------------------------------------------------------
  // Check password separately.
  // ----------------------------------------------------------

  const passwordError = validatePasswordField(password);
  if (passwordError) {
    return passwordError;
  }

  // ----------------------------------------------------------
  // Validate email format.
  // ----------------------------------------------------------

  if (!emailPattern.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  return null;
};

// ============================================================
// REGISTER CONTROLLER
// ============================================================
//
// Handles:
// POST /api/auth/register
//
// ============================================================

const register = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Extract registration data from the request body.
    // --------------------------------------------------------


    // --------------------------------------------------------
    // Validate the incoming data.
    // --------------------------------------------------------


    const validationError = validateRegistrationInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // --------------------------------------------------------
    // Normalize user input before sending it to the service.
    //
    // Names:
    //     Remove unnecessary spaces.
    //
    // Email:
    //     Remove spaces and convert to lowercase.
    // --------------------------------------------------------

    const normalizedFirstName = firstName.trim();

    const normalizedLastName = lastName.trim();

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------------
    // Call the authentication service.
    // --------------------------------------------------------

    const result = await registerUser({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password,
    });

    // --------------------------------------------------------
    // Return the newly created user and JWT.
    //
    // IMPORTANT:
    // The password is NEVER returned.
    // The password hash is NEVER returned.
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    // --------------------------------------------------------
    // Send unexpected errors to centralized error handling.
    // --------------------------------------------------------

    next(error);
  }
};

// ============================================================
// LOGIN CONTROLLER
// ============================================================
//
// Handles:
// POST /api/auth/login
//
// ============================================================

const login = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Extract login credentials.
    // --------------------------------------------------------


    // --------------------------------------------------------
    // Validate the credentials.
    // --------------------------------------------------------

    const validationError = validateLoginInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email, password } = req.body;

    // Normalize the email before authentication.
    const normalizedEmail = email.trim().toLowerCase();
    

    // Verify credentials through the database service
    const result = await loginUser({
      email: normalizedEmail,
      password,
    });

    // --------------------------------------------------------
    // Return the authenticated user and JWT.
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    // --------------------------------------------------------
    // Send errors to centralized error middleware.
    // --------------------------------------------------------

    next(error);
  }
};




const getMe = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Get the authenticated user's information.
    // --------------------------------------------------------
    const user = await getCurrentUser(req.user.userId);
    // --------------------------------------------------------
    // Return the authenticated user's information.
    // --------------------------------------------------------
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // --------------------------------------------------------
    // Send errors to centralized error middleware.
    // --------------------------------------------------------
    next(error);
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

export { register, login, getMe };
