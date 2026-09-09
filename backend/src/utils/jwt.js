// Import the jsonwebtoken package.
//
// This package gives us the functions we need to:
// 1. Create/sign JWT tokens.
// 2. Verify JWT tokens.
//
// We will use JWT for authentication in our application.
import jwt from "jsonwebtoken";

// Import our centralized environment configuration.
//
// The JWT secret will come from the .env file through env.js.
//
// Keeping environment variables in one place means that the rest
// of our application does not need to directly access
// process.env.JWT_SECRET.
import env from "../config/env.js";

// ============================================================
// JWT CONFIGURATION
// ============================================================

// Define how long our authentication token should remain valid.
//
// "1d" means the token will expire after one day.
//
// After expiration, the user will need to authenticate again.
const JWT_EXPIRES_IN = "1d";

// ============================================================
// CREATE JWT TOKEN
// ============================================================

// This function creates a JWT token for an authenticated user.
//
// We only put the information we actually need inside the token.
//
// We do NOT put sensitive information such as:
// - password
// - password_hash
// - database credentials
//
// The user's ID is enough for the server to identify the user.
const generateToken = (userId) => {
  // jwt.sign() creates and signs the JWT.
  //
  // The first argument is the payload.
  //
  // "userId" is stored inside the token so that later,
  // authMiddleware.js can identify the authenticated user.
  //
  // The second argument is our secret key.
  //
  // The third argument contains token configuration,
  // including its expiration time.
  const token = jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );

  // Return the generated JWT token to the caller.
  return token;
};

// ============================================================
// VERIFY JWT TOKEN
// ============================================================

// This function verifies whether a JWT token is valid.
//
// We will use this function later inside authMiddleware.js.
//
// If the token:
// - was created using our secret
// - has not been modified
// - has not expired
//
// jwt.verify() will return the token payload.
//
// If something is wrong, jwt.verify() throws an error.
const verifyToken = (token) => {
  // Verify the token using the same secret that was used
  // when the token was created.
  //
  // The returned value will contain the payload we originally
  // placed inside the token.
  return jwt.verify(token, env.jwtSecret);
};

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

// Export both functions so other parts of our backend can use them.
//
// generateToken()
// → Used after successful login/registration.
//
// verifyToken()
// → Used by authentication middleware to verify incoming tokens.
export { generateToken, verifyToken };
