// ============================================================
// NOT FOUND MIDDLEWARE
// ============================================================

// This middleware handles requests that do not match any
// registered route.
//
// For example, if the client requests:
//
// GET /api/does-not-exist
//
// and no route exists for that URL, Express eventually reaches
// this middleware.
const notFound = (req, res, next) => {
  // Create an error describing the missing endpoint.
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);

  // HTTP 404 means the requested resource could not be found.
  error.statusCode = 404;

  // Pass the error to the main error handler below.
  next(error);
};

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

// This is our centralized error-handling middleware.
//
// IMPORTANT:
//
// Express recognizes an error-handling middleware because it
// has FOUR parameters:
//
// (error, req, res, next)
//
// We intentionally keep "next" even though we may not use it
// directly in every situation.
const errorHandler = (error, req, res, next) => {
  // ----------------------------------------------------------
  // DETERMINE HTTP STATUS CODE
  // ----------------------------------------------------------

  // If another part of our application already assigned a
  // statusCode, use it.
  //
  // Otherwise, use 500.
  //
  // 500 means an unexpected server-side error occurred.
  const statusCode = error.statusCode || 500;

  // ----------------------------------------------------------
  // SEND ERROR RESPONSE
  // ----------------------------------------------------------

  // Send a consistent JSON structure to the client.
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : error.message,
  });
};

// ============================================================
// EXPORT MIDDLEWARE
// ============================================================

// Export both middleware functions.
//
// index.js will later register them in the correct order.
export { notFound, errorHandler };
