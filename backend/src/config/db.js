// Import the promise-based MySQL client.
//
// We use "mysql2/promise" because it allows us to work with
// database operations using async/await instead of callbacks.
import mysql from "mysql2/promise";

// Import our centralized environment configuration.
//
// db.js should NOT read process.env directly.
// env.js is responsible for managing our environment variables.
import env from "./env.js";

// Create a MySQL connection pool.
//
// A pool maintains multiple database connections that can be
// reused by different requests.
//
// This is better for a web application than opening a brand-new
// database connection for every request.
const pool = mysql.createPool({
  // MySQL server address.
  // Usually "localhost" during local development.
  host: env.database.host,

  // MySQL server port.
  // Normally 8889.
  port: env.database.port,

  // MySQL username.
  user: env.database.user,

  // MySQL password.
  password: env.database.password,

  // Database our application will use.
  database: env.database.name,

  // Tell the pool to wait when all connections are currently busy.
  //
  // Instead of immediately failing a request, MySQL waits until
  // another connection becomes available.
  waitForConnections: true,

  // Maximum number of database connections maintained by the pool.
  //
  // Ten is a reasonable starting point for local development.
  connectionLimit: 10,

  // Number of connection requests allowed to wait in the queue.
  //
  // 0 means there is no specific queue limit.
  queueLimit: 0,
});

// Export the pool so the models can use it.
//
// For example, User.js will eventually import:
//
// import pool from "../config/db.js";
//
// Then the User model can execute SQL queries through this pool.
export default pool;
