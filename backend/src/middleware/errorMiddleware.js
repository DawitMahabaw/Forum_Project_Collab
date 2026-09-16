const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body.";
  }

  if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large.";
  }

  if (statusCode >= 500) {
    message = "Internal server error.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export { notFound, errorHandler };
