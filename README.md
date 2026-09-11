# AI-Powered Evangadi Forum

An AI-powered collaborative discussion platform designed to help users ask questions, share knowledge, discover similar questions, receive AI-assisted guidance, and interact with a structured knowledge base.

The project combines a traditional community forum with Artificial Intelligence capabilities such as semantic search, question similarity detection, AI-assisted question and answer evaluation, embeddings, and Retrieval-Augmented Generation (RAG).

The application is being developed as a collaborative full-stack project using a separate frontend and backend architecture.

---

## Project Overview

The Evangadi Forum is designed as a modern question-and-answer platform where users can:

* Create an account and securely authenticate.
* Ask technical and educational questions.
* Browse existing questions.
* View individual questions and their answers.
* Submit answers to questions.
* Search for questions using semantic meaning rather than only exact keywords.
* Detect questions that are similar or potentially duplicated.
* Receive AI assistance while drafting questions.
* Evaluate whether an answer appropriately addresses a question.
* Upload knowledge-base documents.
* Search information contained inside uploaded documents.
* Ask AI questions grounded in the uploaded knowledge base.

The project is organized into three major development milestones.

---

# Development Milestones

The project is intentionally divided into three milestones so that the system can be developed incrementally and tested at each stage.

```text
┌──────────────────────────────────────────┐
│        AI-POWERED EVANGADI FORUM         │
└──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
  MILESTONE 1   MILESTONE 2   MILESTONE 3
 Authentication  Questions &   Knowledge Base
                 Answers            / RAG
```

### Milestone 1 — Authentication

The first milestone establishes the foundation of the application.

It focuses on:

* Project initialization.
* MySQL database foundation.
* User registration.
* Password hashing.
* User login.
* JWT authentication.
* Axios authentication handling.
* Authentication state management.
* Protected routes.
* Public landing page.

The goal is to establish a secure identity and access system before users begin interacting with forum content.

---

### Milestone 2 — Questions & Answers

The second milestone builds the core forum functionality on top of the authentication foundation.

It focuses on:

* Creating questions.
* Listing questions.
* Viewing question details.
* Creating answers.
* Managing a user's questions.
* Semantic question search.
* Similar-question detection.
* Automatic question embeddings.
* AI question drafting assistance.
* AI answer-fit evaluation.
* Main application layout and dashboard functionality.

This milestone transforms the authentication foundation into a functional question-and-answer platform.

---

### Milestone 3 — Knowledge Base / RAG

The third milestone introduces the advanced AI knowledge-base functionality.

It focuses on:

* Uploading documents.
* Processing uploaded documents.
* Splitting documents into searchable chunks.
* Generating embeddings.
* Semantic retrieval.
* Asking questions against uploaded knowledge.
* Grounding AI responses in retrieved information.
* RAG document metadata.
* Document management.
* Secure document access.
* Streaming PDF documents.

This milestone adds the Retrieval-Augmented Generation architecture that allows the AI system to work with project-specific knowledge.

---

# Technology Stack

## Frontend

The frontend is built with:

* React
* React Router
* Axios
* Context API
* CSS Modules
* Framer Motion
* Vite

The frontend communicates with the backend through REST API endpoints.

---

## Backend

The backend is built with:

* Node.js
* Express.js
* MySQL
* mysql2
* bcrypt
* JSON Web Tokens
* dotenv
* CORS

The backend follows a modular architecture with separate responsibilities for:

* Routes
* Controllers
* Services
* Models
* Middleware
* Configuration
* AI functionality
* RAG functionality
* Utilities

The backend uses **ES Modules (ESM)** throughout the project.

---

## Database

The project uses MySQL as its relational database.

The database is responsible for storing application data such as:

* Users
* Questions
* Answers
* AI-related data
* Knowledge-base documents
* Question vectors

Database design is introduced incrementally according to the project milestones.

---

## Artificial Intelligence

The AI layer uses Google's Gemini ecosystem for generative AI functionality.

AI functionality includes:

* Text generation.
* Embeddings.
* Semantic similarity.
* Question similarity detection.
* AI question assistance.
* AI answer evaluation.
* Retrieval-Augmented Generation.

AI functionality is introduced progressively rather than being added to the application all at once.

---

# Milestone 1 — Authentication

## Overview

Milestone 1 establishes the authentication and database foundation required by the rest of the application.

Before users can ask questions or submit answers, the application needs to know:

* Who the user is.
* How the user registers.
* How passwords are securely stored.
* How users log in.
* How authenticated requests are identified.
* Which pages require authentication.
* How authentication state is maintained on the frontend.

Therefore, authentication is implemented first.

---

## Milestone 1 Objectives

The main objectives of this milestone are:

* Establish the project structure.
* Establish the MySQL database foundation.
* Create the users table.
* Implement secure user registration.
* Hash passwords using bcrypt.
* Implement user login.
* Generate JWT authentication tokens.
* Configure Axios for authenticated API requests.
* Handle unauthorized requests.
* Maintain authentication state using React Context.
* Protect authenticated routes.
* Create the public landing page.

---

# Database Foundation

The database foundation provides the persistence layer required by registration and login.

The main database for the project is:

```text
evangadi_forum_collab
```

The first authentication table is:

```text
users
```

The schema is maintained in:

```text
backend/db/schema.sql
```

The schema acts as the database definition and source of truth for the authentication database structure.

---

## Users Table

The `users` table contains the information required to identify and authenticate users.

The primary fields are:

```text
user_id
first_name
last_name
email
password_hash
created_at
updated_at
```

The `user_id` uniquely identifies each user.

The first and last names store the user's basic profile information.

The email address is unique so that the same email cannot be registered multiple times.

The `password_hash` column stores the bcrypt-generated password hash rather than the user's original password.

The timestamp fields record when the account was created and when it was last updated.

---

## Database Configuration

Database connection information is stored in environment variables rather than being hard-coded into the application.

Example configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=evangadi_forum_collab
```

Sensitive credentials are not committed to GitHub.

The backend reads these values through:

```text
backend/src/config/env.js
```

The database connection pool is configured through:

```text
backend/src/config/db.js
```

Using a connection pool allows the backend to efficiently reuse database connections.

---

# Automatic Database Table Initialization

The backend includes a database initialization process.

The initialization logic is located in:

```text
backend/src/config/initDb.js
```

The current approach assumes that the MySQL database itself has already been created.

When the backend starts, the initialization process connects to the configured database and ensures that the required authentication table exists.

The basic flow is:

```text
Backend starts
      ↓
Read environment variables
      ↓
Connect to MySQL database
      ↓
Check whether users table exists
      ↓
Create users table if necessary
      ↓
Continue application startup
```

The table is created using:

```sql
CREATE TABLE IF NOT EXISTS users
```

This allows a teammate to clone the project, configure their local environment, and start the backend without manually recreating the table.

---

# User Model

The database operations for users are handled by:

```text
backend/src/models/User.js
```

The User model provides the database operations required by authentication.

The main operations include:

### Create User

Creates a new user record in the `users` table.

The model receives a bcrypt-generated password hash rather than a plain-text password.

---

### Find User by Email

Searches for an existing user using their email address.

This operation is required during login because the backend needs to retrieve the stored password hash before comparing it with the password supplied during authentication.

---

## Parameterized Queries

Database operations use parameterized queries.

For example:

```js
await pool.execute(
  `
  SELECT
    user_id,
    first_name,
    last_name,
    email,
    password_hash
  FROM users
  WHERE email = ?
  LIMIT 1
  `,
  [email],
);
```

The `?` placeholder prevents user input from being directly inserted into the SQL statement.

This helps protect the application against SQL injection.

---

# User Registration

User registration is implemented through:

```text
POST /api/auth/register
```

The registration process follows this general flow:

```text
User submits registration form
          ↓
Frontend sends registration request
          ↓
Backend receives request
          ↓
Validate input
          ↓
Check whether email already exists
          ↓
Hash password with bcrypt
          ↓
Create user in MySQL
          ↓
Return registration response
```

The original password is never stored in the database.

Instead:

```text
Plain Password
      ↓
    bcrypt
      ↓
Password Hash
      ↓
MySQL users.password_hash
```

---

# Password Security

Passwords are protected using bcrypt.

The application never stores a user's original password in the database.

For example, if a user enters:

```text
MyPassword123
```

the database does not store:

```text
MyPassword123
```

Instead, it stores a bcrypt-generated hash similar to:

```text
$2b$...
```

The exact hash is different for each password because bcrypt uses a salt.

During login, the submitted password is compared against the stored hash.

---

# User Login

User login is implemented through:

```text
POST /api/auth/login
```

The login process follows:

```text
User enters email + password
          ↓
Backend finds user by email
          ↓
Retrieve stored password hash
          ↓
Compare submitted password with bcrypt
          ↓
Credentials valid?
       ↙       ↘
     YES        NO
      ↓          ↓
Create JWT    Reject login
      ↓
Return token
```

A successful login results in a signed JWT authentication token.

---

# JWT Authentication

JSON Web Tokens are used to identify authenticated users.

The general authentication flow is:

```text
Login
  ↓
Credentials verified
  ↓
JWT created
  ↓
Token returned to frontend
  ↓
Frontend stores authentication state
  ↓
Axios attaches token to requests
  ↓
Backend verifies token
  ↓
Protected resource becomes accessible
```

JWT functionality is kept separate from the database logic.

Authentication utilities are located under:

```text
backend/src/utils/
```

---

# Axios Authentication

The frontend communicates with the backend through Axios.

The main Axios configuration is located in:

```text
frontend/src/services/api.js
```

The authentication service is located in:

```text
frontend/src/services/authService.js
```

The Axios configuration is responsible for attaching the JWT to authenticated requests.

The general request flow is:

```text
React component
      ↓
Service function
      ↓
Axios
      ↓
JWT attached
      ↓
Express API
      ↓
Authentication middleware
      ↓
Protected controller
```

---

# Authentication Context

Frontend authentication state is managed through:

```text
frontend/src/context/AuthContext.jsx
```

The authentication context provides a central place for the application to know whether the current user is authenticated.

This prevents individual components from having to independently manage authentication state.

The context can be used by components and pages that need information about the current authentication state.

---

# Protected Routes

Authenticated pages are protected using:

```text
frontend/src/components/ProtectedRoute.jsx
```

The basic idea is:

```text
User requests protected page
          ↓
Is user authenticated?
       ↙       ↘
     YES        NO
      ↓          ↓
Show page    Redirect to auth
```

This prevents unauthenticated users from accessing pages that require login.

---

# Public Landing Page

The public landing page is implemented as part of Milestone 1.

It provides an entry point for users who have not yet authenticated.

The page is located under:

```text
frontend/src/pages/Landing/
```

The landing page introduces the application and provides navigation toward authentication.

---

# Milestone 1 File Responsibilities

The primary backend files introduced or used by this milestone include:

```text
backend/
├── db/
│   └── schema.sql
│
└── src/
    ├── config/
    │   ├── db.js
    │   ├── env.js
    │   └── initDb.js
    │
    ├── controllers/
    │   └── authController.js
    │
    ├── middleware/
    │   └── authMiddleware.js
    │
    ├── models/
    │   └── User.js
    │
    ├── routes/
    │   └── authRoutes.js
    │
    └── utils/
        ├── hash.js
        ├── jwt.js
        └── password.js
```

The primary frontend authentication files include:

```text
frontend/
└── src/
    ├── components/
    │   └── ProtectedRoute.jsx
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── pages/
    │   └── Auth/
    │       ├── AuthPage.jsx
    │       └── AuthPage.module.css
    │
    └── services/
        ├── api.js
        └── authService.js
```

---

# Milestone 1 Development Tasks

The milestone is organized around the following major tasks:

| Task                   | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| Project Initialization | Establish the shared project structure and development environment |
| Database Foundation    | Create the database structure required for authentication          |
| User Registration      | Validate and create new user accounts                              |
| Password Security      | Hash passwords securely with bcrypt                                |
| User Login             | Verify credentials and authenticate users                          |
| JWT Authentication     | Create and verify authentication tokens                            |
| Axios Authentication   | Attach JWT tokens to authenticated requests                        |
| Auth Service           | Connect frontend authentication actions to backend APIs            |
| Authentication UI      | Build the login and registration interface                         |
| Auth Context           | Manage authentication state across the React application           |
| Protected Routes       | Restrict access to authenticated pages                             |
| Landing Page           | Provide the public entry point to the application                  |

---

# Milestone 1 Completion Criteria

Milestone 1 is considered complete when the authentication foundation works as an integrated system.

The expected flow is:

```text
                    USER
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
      Register                Login
          │                     │
          └──────────┬──────────┘
                     ↓
                  React
                     ↓
                  Axios
                     ↓
             Express Backend
                     ↓
            Authentication Logic
                     ↓
                  bcrypt
                     ↓
                  MySQL
                     ↓
                JWT Token
                     ↓
             Authenticated User
                     ↓
              Protected Pages
```

The milestone should satisfy the following conditions:

* The project runs successfully.
* The MySQL database is available.
* The users table is created successfully.
* Users can register.
* Registration validates required information.
* Passwords are stored as bcrypt hashes.
* Users can log in.
* Invalid credentials are rejected.
* Successful login produces a JWT.
* Authenticated requests can include the JWT.
* Protected routes reject unauthenticated users.
* The frontend maintains authentication state.
* The public landing page is accessible without authentication.
* Backend and frontend responsibilities remain separated.
* Environment variables are used for configuration.
* No sensitive credentials are committed to Git.
* The milestone has been tested through frontend/backend integration.
* Completed changes are reviewed and pushed to the shared repository.

---

# Development Workflow

The project is developed collaboratively using Git and GitHub.

Development work is organized around individual tasks.

Branches should describe the task being implemented rather than the developer's name.

Example:

```text
feature/T-04-register-user
feature/database-user-schema
feature/T-05-login-user
```

The general workflow is:

```text
Task
 ↓
Create task branch
 ↓
Implement change
 ↓
Test locally
 ↓
Commit changes
 ↓
Push branch
 ↓
Create Pull Request
 ↓
Code Review
 ↓
QA / Integration
 ↓
Merge
```

Small, focused commits are preferred because they make the development history easier to understand and review.

---

# Environment Configuration

Environment files contain local configuration values and must not be committed to the repository.

The repository provides example environment files so that each developer can create their own local configuration.

Typical backend environment variables include:

```env
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=evangadi_forum_collab
```

Actual passwords and other sensitive credentials must remain local.

---

# Current Project Status

## Milestone 1 — Authentication

**Status:** In Development / Completion Stage

The current milestone establishes the authentication foundation and prepares the project for the question-and-answer functionality that will be developed in the next milestone.

---

# Future Development

The README will evolve together with the project.

When Milestone 2 begins, its architecture, features, implementation details, API behavior, and completion criteria will be added to this README under a new:

```text
Milestone 2 — Questions & Answers
```

section.

Milestone 3 will subsequently add:

```text
Milestone 3 — Knowledge Base / RAG
```

This keeps the README as a single project-level source of documentation while allowing each milestone to maintain its own detailed technical documentation.

---

# Project Vision

The final goal is to combine the usefulness of a community-driven question-and-answer platform with modern AI capabilities.

The completed platform will connect:

```text
Users
  ↓
Authentication
  ↓
Questions & Answers
  ↓
Semantic Search
  ↓
AI Assistance
  ↓
Knowledge Base
  ↓
Retrieval-Augmented Generation
  ↓
Grounded AI Responses
```

The project is therefore developed incrementally, beginning with a reliable authentication and database foundation and progressively adding forum functionality and advanced AI capabilities.
