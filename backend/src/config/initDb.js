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

    // Create the questions table if it does not already exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        question_hash VARCHAR(64) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,

        user_id BIGINT UNSIGNED NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_questions_user
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
    `);

    // Create the answers table if it does not already exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        question_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_answers_question
          FOREIGN KEY (question_id) REFERENCES questions(id),
        CONSTRAINT fk_answers_user
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Questions and answers tables initialized successfully.");
  } finally {
    await connection.end();
  }
}
