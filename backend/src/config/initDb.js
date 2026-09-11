import mysql from "mysql2/promise";
import env from "./env.js";

// Connect to the existing Evangadi Forum database
export async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
  });

  try {
    // Create the users table if it does not already exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,

        email VARCHAR(255) NOT NULL UNIQUE,

        password_hash VARCHAR(255) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CHECK (email = LOWER(email))
      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Users table initialized successfully.");
  } finally {
    await connection.end();
  }
}
