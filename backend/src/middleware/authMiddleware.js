// Import our JWT verification utility.
//
// verifyToken() is responsible for checking whether the JWT
// was created using our secret and whether it is still valid.
import { verifyToken } from "../utils/jwt.js";

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

// This middleware protects routes that require authentication.
//
// Express middleware receives:
//
// req  → incoming HTTP request
// res  → outgoing HTTP response
// next → function that passes the request to the next middleware
//        or controller
const authenticate = (req, res, next) => {
  try {
    // --------------------------------------------------------
    // STEP 1: GET THE AUTHORIZATION HEADER
    // --------------------------------------------------------

    // The frontend will eventually send the JWT using the
    // standard Authorization HTTP header.
    //
    // Expected format:
    //
    // Authorization: Bearer eyJhbGciOi...
    //
    // req.headers.authorization contains the complete value.
    const authorizationHeader = req.headers.authorization;

    // --------------------------------------------------------
    // STEP 2: CHECK WHETHER THE HEADER EXISTS
    // --------------------------------------------------------

    // If the client did not send an Authorization header,
    // there is no JWT for us to verify.
    if (!authorizationHeader) {
      // Create an authentication error.
      const error = new Error("Authentication token is required.");

      // HTTP 401 means the client is not authenticated.
      error.statusCode = 401;

      // Send the error to our centralized error middleware.
      return next(error);
    }

    // --------------------------------------------------------
    // STEP 3: CHECK THE BEARER FORMAT
    // --------------------------------------------------------

    // A valid Authorization header should look like:
    //
    // Bearer <token>
    //
    // split(" ") separates the two pieces:
    //
    // ["Bearer", "<token>"]
    const parts = authorizationHeader.split(" ");

    // Make sure we received exactly the expected format.
    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
      // Create an error for an incorrectly formatted header.
      const error = new Error("Invalid authentication token format.");

      // HTTP 401 means authentication failed.
      error.statusCode = 401;

      // Pass the error to the centralized error handler.
      return next(error);
    }

    // --------------------------------------------------------
    // STEP 4: EXTRACT THE JWT
    // --------------------------------------------------------

    // The second part is the actual JWT.
    //
    // Example:
    //
    // ["Bearer", "eyJhbGciOi..."]
    //              ↑
    //           this value
    const token = parts[1];

    // --------------------------------------------------------
    // STEP 5: VERIFY THE JWT
    // --------------------------------------------------------

    // verifyToken() checks:
    //
    // 1. Was the token signed with our JWT secret?
    // 2. Has the token been modified?
    // 3. Has the token expired?
    //
    // If everything is valid, it returns the payload.
    const decodedToken = verifyToken(token);

    // --------------------------------------------------------
    // STEP 6: ATTACH USER INFORMATION TO THE REQUEST
    // --------------------------------------------------------

    // When we generated the JWT, we stored:
    //
    // {
    //   userId: user.userId
    // }
    //
    // Therefore decodedToken.userId contains the authenticated
    // user's database ID.
    //
    // We attach it to req.user so that controllers later in
    // the request chain can access the authenticated user.
    req.user = {
      userId: decodedToken.userId,
    };

    // --------------------------------------------------------
    // STEP 7: CONTINUE THE REQUEST
    // --------------------------------------------------------

    // next() tells Express:
    //
    // "Authentication succeeded. Continue to the next
    // middleware/controller."
    next();
  } catch (error) {
    // --------------------------------------------------------
    // JWT VERIFICATION FAILED
    // --------------------------------------------------------

    // jwt.verify() throws an error when the token is:
    //
    // - invalid
    // - expired
    // - modified
    // - signed with the wrong secret
    //
    // We don't expose the internal JWT error to the client.
    const authenticationError = new Error(
      "Invalid or expired authentication token.",
    );

    // HTTP 401 means authentication failed.
    authenticationError.statusCode = 401;

    // Pass the clean error to our centralized error handler.
    next(authenticationError);
  }
};

// ============================================================
// EXPORT MIDDLEWARE
// ============================================================

// Export the middleware so protected routes can use it.
export default authenticate;
