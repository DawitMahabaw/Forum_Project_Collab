import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      const error = new Error("Authentication token is required.");
      error.statusCode = 401;
      return next(error);
    }

    const parts = authorizationHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
      const error = new Error("Invalid authentication token format.");
      error.statusCode = 401;
      return next(error);
    }

    const token = parts[1];
    let decodedToken;
    try {
      decodedToken = verifyToken(token);
    } catch {
      const authenticationError = new Error(
        "Invalid or expired authentication token.",
      );
      authenticationError.statusCode = 401;
      return next(authenticationError);
    }

    // Verify user exists in database and enforce verified status
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      const error = new Error("User account no longer exists.");
      error.statusCode = 401;
      return next(error);
    }

    // Unverified accounts cannot access protected resources
    if (!user.is_verified) {
      const error = new Error(
        "Please verify your email address before accessing this resource.",
      );
      error.statusCode = 403;
      error.unverified = true;
      return next(error);
    }

    req.user = {
      userId: user.user_id,
      role: user.role || "user",
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
