// Import the dotenv package.
// dotenv allows our Node.js application to read variables
// from a local .env file and place them inside process.env.
import dotenv from "dotenv";

// Load the variables from the .env file.
//
// After this runs, values such as:
// PORT=4000
// DB_HOST=localhost
// DB_USER=root
//
// become available through process.env.
dotenv.config();

// Create one central configuration object.
//
// Instead of accessing process.env throughout the entire application,
// the rest of our backend can import this "env" object.
//
// This gives us one organized place for application configuration.
const env = {
  // The port on which our Express server will run.
  //
  // process.env.PORT reads the PORT value from our .env file.
  //
  // || 4000 means:
  // "If PORT was not provided, use 4000 as the default."
  port: process.env.PORT || 4000,

  // All database-related configuration is grouped together.
  database: {
    // MySQL server address.
    host: process.env.DB_HOST,

    // MySQL server port.
    //
    // Environment variables are strings by default,
    // so Number() converts something like "3306" into 3306.
    port: Number(process.env.DB_PORT) || 8889,

    // MySQL username.
    user: process.env.DB_USER,

    // MySQL password.
    password: process.env.DB_PASSWORD,

    // Name of our project database.
    name: process.env.DB_NAME,
  },

  // Secret used later when creating and verifying JWTs.
  //
  // We don't put the actual secret in our source code.
  jwtSecret: process.env.JWT_SECRET,

  // Google Gemini API configuration.
  //
  // We won't use these during the first authentication step,
  // but defining them here gives the application one central
  // configuration system for future AI features.
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL,
};

// Export the configuration object.
//
// Any backend file can now import it using:
//
// import env from "./config/env.js";
//
// or, depending on its location:
//
// import env from "../config/env.js";
export default env;
