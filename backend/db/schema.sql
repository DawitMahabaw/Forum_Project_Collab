-- Create our project database if it does not already exist.
--
-- IF NOT EXISTS prevents MySQL from throwing an error if
-- the database has already been created.
CREATE DATABASE IF NOT EXISTS ai_powered_evangadi_forum;


-- Select our project database.
--
-- All tables created after this statement will belong to
-- this database.
USE ai_powered_evangadi_forum;


-- ============================================================
-- USERS TABLE
-- ============================================================
--
-- The users table stores the information required to identify
-- and authenticate people using our forum.
--
-- Authentication in Milestone 1 will use this table for:
--
-- 1. Registering new users
-- 2. Finding users during login
-- 3. Storing securely hashed passwords
-- 4. Identifying authenticated users
--
CREATE TABLE IF NOT EXISTS users (

    -- --------------------------------------------------------
    -- USER ID
    -- --------------------------------------------------------
    --
    -- BIGINT provides a very large range of possible IDs.
    --
    -- UNSIGNED means the number cannot be negative because
    -- a user ID should always be a positive number.
    --
    -- AUTO_INCREMENT tells MySQL to automatically generate
    -- the next ID whenever a new user is inserted.
    --
    -- PRIMARY KEY makes user_id the unique identifier for
    -- every row in the users table.
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,


    -- --------------------------------------------------------
    -- FIRST NAME
    -- --------------------------------------------------------
    --
    -- Stores the user's first name.
    --
    -- VARCHAR(100) means the value can contain up to
    -- 100 characters.
    --
    -- NOT NULL means every user must provide a first name.
    first_name VARCHAR(100) NOT NULL,


    -- --------------------------------------------------------
    -- LAST NAME
    -- --------------------------------------------------------
    --
    -- Stores the user's last name.
    --
    -- Every user must provide a last name.
    last_name VARCHAR(100) NOT NULL,


    -- --------------------------------------------------------
    -- EMAIL
    -- --------------------------------------------------------
    --
    -- The email address is used as the user's login identity.
    --
    -- VARCHAR(255) gives us enough room for normal email
    -- addresses while keeping the column efficient.
    --
    -- NOT NULL means an account cannot exist without an email.
    --
    -- UNIQUE means two different users cannot register with
    -- the same email address.
    email VARCHAR(255) NOT NULL UNIQUE,


    -- --------------------------------------------------------
    -- PASSWORD HASH
    -- --------------------------------------------------------
    --
    -- IMPORTANT:
    -- We NEVER store the user's original/plain password.
    --
    -- The password will first be processed by bcrypt in our
    -- backend application.
    --
    -- Only the resulting bcrypt hash will be stored here.
    password_hash VARCHAR(255) NOT NULL,


    -- --------------------------------------------------------
    -- CREATED AT
    -- --------------------------------------------------------
    --
    -- TIMESTAMP stores the date and time when the account
    -- was created.
    --
    -- DEFAULT CURRENT_TIMESTAMP tells MySQL to automatically
    -- use the current date and time when a new user is created.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    -- --------------------------------------------------------
    -- UPDATED AT
    -- --------------------------------------------------------
    --
    -- Stores the date and time when the user's record was
    -- last modified.
    --
    -- DEFAULT CURRENT_TIMESTAMP gives new users an initial
    -- timestamp automatically.
    --
    -- ON UPDATE CURRENT_TIMESTAMP automatically updates this
    -- value whenever the row is changed.
    --
    -- This becomes useful later when users can update things
    -- such as their profile information.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,


    -- --------------------------------------------------------
    -- EMAIL VALIDATION
    -- --------------------------------------------------------
    --
    -- This database-level CHECK constraint ensures that
    -- email addresses are stored in lowercase.
    --
    -- Example:
    --
    -- DAWIT@EMAIL.COM
    --
    -- becomes:
    --
    -- dawit@email.com
    --
    -- Our backend will also normalize emails before saving
    -- them, but this constraint gives us an additional layer
    -- of database protection.
    CHECK (email = LOWER(email))


-- ------------------------------------------------------------
-- STORAGE ENGINE
-- ------------------------------------------------------------
--
-- InnoDB is MySQL's standard transactional storage engine.
--
-- We use it because our future application will have
-- relationships between users, questions, answers, etc.,
-- and InnoDB supports transactions and foreign keys.
--
-- utf8mb4 allows the database to properly store modern
-- Unicode characters, including emojis and many international
-- writing systems.
--
-- utf8mb4_unicode_ci provides case-insensitive Unicode
-- comparison rules for text values.
--
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;