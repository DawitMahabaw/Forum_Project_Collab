
// ============================================================
// IMPORT DEPENDENCIES
// ============================================================

// Import Express.
//
// Express is the web framework we are using to build our
// backend API server.
import express from "express";

// Importing and initializing the  automatic database initialization for authentication schema
import { initializeDatabase } from "./src/config/initDb.js";
await initializeDatabase();

// Import CORS.
//
// CORS allows our React frontend, which will run on a
// different origin during development, to communicate with
// our Express backend.
import cors from "cors";

// Import our centralized environment configuration.
//
// env.js loads values from our .env file and makes them
// available to the rest of the application.
import env from "./src/config/env.js";

// Import our authentication routes.
//
// These routes contain:
// POST /register
// POST /login
//
// They will eventually connect to our authentication controllers.
import authRoutes from "./src/routes/authRoutes.js";

// Import our centralized error middleware.
//
// notFound handles requests to routes that do not exist.
//
// errorHandler handles errors passed through next(error).
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";

// Import the MySQL connection pool.
//
// We import the pool here so we can test the database
// connection when the server starts.
//
// The actual database queries are still handled by models.
import pool from "./src/config/db.js";

// ============================================================
// CREATE EXPRESS APPLICATION
// ============================================================

// Create our Express application.
//
// The "app" object will be used to configure middleware,
// routes, and server behavior.
const app = express();

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Enable CORS.
//
// During development, this allows our frontend application
// to send requests to this backend.
//
// We can make this more restrictive when we configure
// production deployment later.
app.use(cors());

// Tell Express to automatically parse incoming JSON bodies.
//
// Without this middleware:
//
// req.body
//
// would not contain JSON data sent by the frontend.
app.use(express.json());

// ============================================================
// BASIC HEALTH CHECK
// ============================================================

// Create a simple root endpoint.
//
// This gives us an easy way to check whether the server
// itself is running.
//
// Visiting:
//
// http://localhost:4000/
//
// should return a small JSON response.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Evangadi Forum API is running.",
  });
});

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================

// Mount our authentication router.
//
// The "/api/auth" prefix is added here.
//
// Therefore:
//
// router.post("/register", register)
//
// becomes:
//
// POST /api/auth/register
//
// And:
//
// router.post("/login", login)
//
// becomes:
//
// POST /api/auth/login
app.use("/api/auth", authRoutes);

// ============================================================
// NOT FOUND HANDLER
// ============================================================

// If the request did not match any route above,
// send it to our notFound middleware.
//
// This middleware creates a 404 error and passes it to
// errorHandler.
app.use(notFound);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

// Register the centralized error handler.
//
// IMPORTANT:
//
// This must come AFTER our routes and notFound middleware.
//
// Errors passed using next(error) will eventually reach
// this function.
app.use(errorHandler);

// ============================================================
// DATABASE CONNECTION TEST
// ============================================================

// Create a small function to test whether our application
// can successfully communicate with MySQL.
//
// This is useful during development because we can immediately
// see whether our database configuration is correct.
const testDatabaseConnection = async () => {
  try {
    // Ask the MySQL connection pool for one connection.
    //
    // If the database is unavailable or our credentials are
    // incorrect, this operation will throw an error.
    const connection = await pool.getConnection();

    // Release the connection immediately.
    //
    // We are only testing the connection here, so we don't need
    // to keep this particular connection.
    connection.release();

    // Print a success message to the terminal.
    console.log("MySQL database connected successfully.");
  } catch (error) {
    // Print the database connection error.
    //
    // We don't stop writing our application here; this message
    // simply makes the problem visible during development.
    console.error("MySQL database connection failed:", error.message);
  }
};

// ============================================================
// START SERVER
// ============================================================

// Start the Express server.
//
// env.port comes from our environment configuration.
//
// If PORT is not defined, env.js currently defaults to 4000.
app.listen(env.port, async () => {
  // Tell us which port the server is listening on.
  console.log(`AI Powered Evangadi Forum API is running on port ${env.port}.`);

  // Test our MySQL connection after the server starts.
  await testDatabaseConnection();
});
