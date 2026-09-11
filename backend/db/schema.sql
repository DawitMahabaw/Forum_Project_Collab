-- Week 1 authentication database foundation.
-- Creates the database and the users table required by T-04 and T-05.

CREATE DATABASE IF NOT EXISTS evangadi_forum_collab;

USE evangadi_forum_collab;

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    -- Email addresses must be unique and stored in lowercase.
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Stores the bcrypt-generated password hash, never the plain password.
    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CHECK (email = LOWER(email))
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;