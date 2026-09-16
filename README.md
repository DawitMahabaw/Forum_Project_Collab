# AI-Powered Evangadi Forum

An AI-powered community forum designed to allow users to ask questions, share answers, discover similar discussions, and receive AI-assisted guidance.

The project is organized into **three development milestones**, with each milestone building on the architecture and functionality of the previous one.

## Project Milestones

```text
Milestone 1
Authentication & Application Foundation
        ↓
Milestone 2
Questions, Answers & AI Assistance
        ↓
Milestone 3
RAG Knowledge Base
```

### Milestone 1 — Authentication & Application Foundation

Establishes the application's core architecture and secure user authentication system.

Key areas:

* User registration
* User login
* Password hashing with bcrypt
* JWT authentication
* Protected frontend routes
* Authentication context
* Axios API configuration
* Centralized error handling
* Public landing page
* Backend MVC architecture
* MySQL database foundation

**Status: Completed**

---

# Milestone 1 — General Application Flow

Milestone 1 establishes the authentication foundation of the AI-Powered Evangadi Forum.

At a high level, the application follows this flow:

```text
                    USER
                     │
                     ▼
              React Frontend
                     │
                     ▼
              React Router
                     │
             ┌───────┴────────┐
             ▼                ▼
        Landing Page       Auth Page
                              │
                       Login / Register
                              │
                              ▼
                         API Request
                              │
                              ▼
                       Axios Service
                              │
                              ▼
                     Express Backend
                              │
                              ▼
                           Route
                              │
                              ▼
                        Controller
                              │
                              ▼
                         Auth Service
                              │
                              ▼
                         User Model
                              │
                              ▼
                         MySQL Database
```

After successful login:

```text
User Login
    │
    ▼
Backend verifies credentials
    │
    ▼
JWT generated
    │
    ▼
Frontend receives JWT
    │
    ▼
AuthContext updates authentication state
    │
    ▼
User can access protected routes
```

For protected API requests:

```text
React Component
      │
      ▼
Axios Service
      │
      ▼
Axios Interceptor
      │
      ▼
Attach JWT
      │
      ▼
Express API
      │
      ▼
Authentication Middleware
      │
      ▼
Protected Controller
      │
      ▼
Response
```

---

# Milestone 1 — Backend Architecture

The backend follows a layered MVC-style architecture:

```text
Request
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MySQL
```

### Backend Responsibilities

| Layer          | Responsibility                               |
| -------------- | -------------------------------------------- |
| `routes/`      | Defines API endpoints                        |
| `controllers/` | Handles HTTP requests and responses          |
| `services/`    | Contains application/business logic          |
| `models/`      | Communicates with the database               |
| `middleware/`  | Authentication and shared request processing |
| `config/`      | Environment and database configuration       |
| `utils/`       | Reusable helper functionality                |

### Important Milestone 1 Files

```text
backend/
├── index.js
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   ├── services/
│   │   └── authService.js
│   │
│   └── utils/
│       ├── password.js
│       └── jwt.js
│
└── db/
    └── schema.sql
```

`index.js` starts the Express server and connects the application's middleware and routes.

`env.js` manages environment configuration, while `db.js` provides the MySQL database connection.

`authRoutes.js` defines authentication endpoints such as:

```text
POST /api/auth/register
POST /api/auth/login
```

`authController.js` handles HTTP requests and responses.

`authService.js` contains the main authentication logic.

`User.js` handles user-related database operations.

`password.js` manages password hashing and verification using bcrypt.

`jwt.js` manages JWT creation and verification.

`authMiddleware.js` protects routes that require authentication.

`errorMiddleware.js` provides centralized backend error handling.

`schema.sql` defines the database structure.

---

# Milestone 1 — Frontend Architecture

The frontend follows this general structure:

```text
User
 ↓
React Page
 ↓
Frontend Service
 ↓
Axios
 ↓
Backend API
```

Important areas include:

```text
frontend/src/
├── components/
├── context/
├── pages/
├── routes/
├── services/
├── utils/
├── App.jsx
├── main.jsx
└── index.css
```

`main.jsx` starts the React application.

`App.jsx` provides the main application structure.

`AppRoutes.jsx` defines frontend navigation.

`LandingPage.jsx` provides the public entry point.

`AuthPage.jsx` provides login and registration.

`AuthContext.jsx` manages authentication state across the application.

`ProtectedRoute.jsx` prevents unauthenticated users from accessing protected pages.

`api.js` provides the centralized Axios configuration.

`authService.js` contains frontend authentication API functions.

`auth.js` contains reusable authentication utilities.

CSS Modules are used for page and component-specific styling.

---

# Milestone 2 — Questions, Answers & AI Assistance

Milestone 2 builds the main forum functionality on top of the authentication foundation created in Milestone 1.

The focus is now on:

* Creating questions
* Viewing questions
* Searching questions
* Viewing question details
* Posting answers
* Preventing users from answering their own questions
* Semantic search
* Similar-question discovery
* AI Draft Coach
* AI Answer Fit evaluation
* User-specific question management

**Status: In Progress / Current Milestone**

---

# Milestone 2 — General Application Flow

The main forum flow extends the architecture from Milestone 1:

```text
                         USER
                           │
                           ▼
                    React Frontend
                           │
                           ▼
                     Forum Page
                           │
                           ▼
                    Frontend Service
                           │
                           ▼
                         Axios
                           │
                           ▼
                    Express Backend
                           │
                           ▼
                         Route
                           │
                           ▼
                      Controller
                           │
                           ▼
                       Service
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
                Model          AI Service
                  │                 │
                  ▼                 ▼
                MySQL          AI / Vectors
```

For authenticated question creation:

```text
User
 ↓
Post Question
 ↓
Axios
 ↓
JWT attached
 ↓
Auth Middleware
 ↓
Question Controller
 ↓
Question Service
 ↓
Question Model
 ↓
MySQL
```

For AI-powered question processing:

```text
Question
   ↓
Question Service
   ↓
AI / Embedding Service
   ↓
Generate Vector
   ↓
Store Question + Vector
```

---

# Milestone 2 — Questions

The question system allows authenticated users to create and manage forum questions.

A question contains information such as:

```text
Question
├── Title
├── Description
├── Author
├── Question Hash
├── Creation Date
└── Vector Representation
```

The backend follows:

```text
POST /api/questions
        ↓
questionRoutes.js
        ↓
questionController.js
        ↓
questionService.js
        ↓
Question.js
        ↓
MySQL
```

When appropriate, the question can also be processed into an embedding for semantic search.

---

# Milestone 2 — Question Retrieval

Questions can be retrieved through the API.

The system supports:

```text
Get all questions
Search questions
Get my questions
Get a specific question
Get similar questions
```

A simplified flow is:

```text
Dashboard
   ↓
questionService.js
   ↓
Axios
   ↓
GET /api/questions
   ↓
Question Controller
   ↓
Question Service
   ↓
Question Model
   ↓
MySQL
   ↓
Questions
```

Query parameters allow the frontend to request specific results, such as a user's own questions or keyword-based searches.

---

# Milestone 2 — Semantic Search

One of the major AI features introduced in Milestone 2 is **semantic search**.

Traditional keyword search looks for matching words.

Semantic search attempts to find questions with similar **meaning**, even when the exact words are different.

```text
User Search
     ↓
Create Embedding
     ↓
Compare With Question Vectors
     ↓
Calculate Similarity
     ↓
Rank Results
     ↓
Return Similar Questions
```

The system uses vector representations of questions and similarity calculations to identify related discussions.

This allows the forum to discover questions that may be duplicates or closely related even when users phrase them differently.

---

# Milestone 2 — Question Similarity

The application can also find questions related to a specific question.

```text
Existing Question
       ↓
Question Vector
       ↓
Compare Against Other Vectors
       ↓
Similarity Score
       ↓
Ranked Similar Questions
```

This supports the goal of helping users discover existing discussions before creating duplicate questions.

---

# Milestone 2 — Answers

Authenticated users can answer questions.

The answer flow is:

```text
User
 ↓
Question Detail
 ↓
Write Answer
 ↓
Axios
 ↓
JWT
 ↓
Auth Middleware
 ↓
Answer Controller
 ↓
Answer Service
 ↓
Answer Model
 ↓
MySQL
```

The application also prevents a user from answering their own question when the business rules require this restriction.

The question and answer relationship is:

```text
User
 │
 ├── creates → Question
 │
 └── creates → Answer

Question
   │
   └── has many → Answers
```

---

# Milestone 2 — AI Draft Coach

The **Draft Coach** helps a user improve a question before submitting it.

The general flow is:

```text
User Writes Question
        ↓
Draft Coach
        ↓
AI Service
        ↓
Analyze Question
        ↓
Return Feedback
        ↓
User Improves Draft
        ↓
Submit Question
```

The goal is to provide useful guidance such as improving clarity, completeness, or technical detail before the question becomes a public forum post.

---

# Milestone 2 — AI Answer Fit

The **Answer Fit** feature evaluates whether an answer appropriately addresses the question.

Conceptually:

```text
Question
   +
Answer
   ↓
AI Service
   ↓
Evaluate Relevance
   ↓
Return Feedback / Evaluation
```

This is different from Draft Coach:

```text
Draft Coach
→ Helps improve a question BEFORE submission

Answer Fit
→ Evaluates an answer AGAINST an existing question
```

---

# Milestone 2 — Frontend Pages

The main frontend functionality introduced in Milestone 2 includes:

```text
Dashboard
   │
   ├── Browse Questions
   ├── Search
   └── Open Question

Post Question
   │
   └── Draft Coach

Question Detail
   │
   ├── Question
   ├── Answers
   └── Answer Fit

My Questions
   │
   └── User's Questions
```

The application also introduces reusable interface components such as:

```text
Layout
Navbar
Sidebar
QuestionCard
MarkdownContent
Footer
ProtectedRoute
```

These components help maintain a consistent application structure as the project grows.

---

# Milestone 2 — Service Architecture

The frontend communicates with the backend through dedicated services:

```text
frontend/src/services/

api.js
authService.js
questionService.js
answerService.js
ragService.js
```

For Milestone 2:

```text
Question Page
      ↓
questionService.js
      ↓
api.js
      ↓
Axios
      ↓
Backend API
```

And:

```text
Answer Page
      ↓
answerService.js
      ↓
api.js
      ↓
Axios
      ↓
Backend API
```

This keeps API communication separate from UI components.

---

# Milestone 2 — Backend Structure

The backend now expands beyond authentication:

```text
backend/src/
├── config/
│
├── controllers/
│   ├── answerController.js
│   ├── authController.js
│   ├── documentController.js
│   └── questionController.js
│
├── middleware/
│
├── models/
│   ├── Answer.js
│   ├── Document.js
│   ├── Question.js
│   ├── QuestionVector.js
│   └── User.js
│
├── routes/
│   ├── answerRoutes.js
│   ├── authRoutes.js
│   ├── documentRoutes.js
│   └── questionRoutes.js
│
├── services/
│   ├── aiService.js
│   ├── answerService.js
│   ├── authService.js
│   ├── questionService.js
│   └── ragService.js
│
└── utils/
```

The same architectural principle from Milestone 1 remains:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model / AI Service
  ↓
Database / AI System
```

---

# Milestone 2 — AI Architecture

AI functionality is separated from normal CRUD logic.

```text
Question / Answer
       │
       ▼
Application Service
       │
       ├───────────────┐
       ▼               ▼
Database Logic      AI Logic
                       │
                       ▼
                 AI / Embeddings
```

This separation makes the AI features easier to extend and maintain.

The project uses vector representations to support semantic search and related-question discovery.

---

# Database Responsibilities

The database provides persistent storage for application data.

Milestone 1 established the user structure.

Milestone 2 extends the data model for:

```text
Users
Questions
Answers
Question Vectors
```

Conceptually:

```text
User
 │
 ├── Questions
 │      │
 │      ├── Vector
 │      └── Answers
 │
 └── Answers
```

The database stores the actual forum information, while vector data supports semantic discovery.

---

# Complete Milestone 2 Flow

The main architecture can now be understood as:

```text
                         USER
                           │
                           ▼
                    React Frontend
                           │
                           ▼
                       React Router
                           │
                           ▼
                         Page
                           │
                           ▼
                   Frontend Service
                           │
                           ▼
                         Axios
                           │
                           ▼
                  Authentication/JWT
                           │
                           ▼
                    Express Backend
                           │
                           ▼
                         Route
                           │
                           ▼
                      Controller
                           │
                           ▼
                       Service
                      /       \
                     /         \
                    ▼           ▼
                 Model       AI Service
                   │             │
                   ▼             ▼
                MySQL       AI / Vectors
```

---

# Milestone 1 → Milestone 2

Milestone 2 depends directly on the foundation created in Milestone 1.

```text
Milestone 1
Authentication
     │
     ├── JWT
     ├── AuthContext
     ├── ProtectedRoute
     └── Axios Interceptor
             │
             ▼
Milestone 2
Forum Functionality
     │
     ├── Questions
     ├── Answers
     ├── Search
     ├── Semantic Search
     ├── Draft Coach
     └── Answer Fit
```

Authentication is therefore not a separate feature anymore; it becomes part of the security foundation for forum operations.

---

# API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Questions

```text
POST /api/questions
GET  /api/questions
GET  /api/questions/search
GET  /api/questions/:questionHash
GET  /api/questions/:questionHash/similar
POST /api/questions/draft-coach
POST /api/questions/:questionHash/answer-fit
```

### Answers

```text
POST /api/answers
```

Additional RAG/document endpoints will be introduced as part of Milestone 3.

---

# Security Foundation

The application uses several layers of security:

```text
Password
   ↓
bcrypt hashing
   ↓
Stored password hash

Login
   ↓
JWT
   ↓
Protected request
   ↓
Authentication Middleware
   ↓
Protected resource
```

Authentication determines **who the user is**.

Authorization determines **what the authenticated user is allowed to do**.

These concepts become increasingly important as users create questions, answers, and documents.

---

# Current Architecture Mental Model

The most important architectural flow is:

```text
USER
 ↓
REACT
 ↓
PAGE / COMPONENT
 ↓
FRONTEND SERVICE
 ↓
AXIOS
 ↓
EXPRESS ROUTE
 ↓
CONTROLLER
 ↓
SERVICE
 ↓
MODEL
 ↓
MYSQL
```

When AI functionality is involved:

```text
USER
 ↓
REACT
 ↓
FRONTEND SERVICE
 ↓
API
 ↓
CONTROLLER
 ↓
SERVICE
 ↓
AI SERVICE
 ↓
AI / EMBEDDING SYSTEM
```

When semantic search is involved:

```text
SEARCH QUESTION
      ↓
EMBEDDING
      ↓
VECTOR
      ↓
SIMILARITY CALCULATION
      ↓
RANK RESULTS
      ↓
RELATED QUESTIONS
```

---

# Future Milestone

### Milestone 3 — RAG Knowledge Base

The final milestone will extend the AI capabilities by introducing a document-based knowledge system using **Retrieval-Augmented Generation (RAG)**.

Planned capabilities include:

* PDF document upload
* Secure document processing
* PDF text extraction
* Text chunking
* Embeddings for document chunks
* Semantic document search
* Grounded AI answers
* Document metadata
* PDF preview
* Document management
* Retrieval-based AI responses

The conceptual flow will become:

```text
PDF Document
     ↓
Extract Text
     ↓
Split Into Chunks
     ↓
Create Embeddings
     ↓
Store Chunks + Vectors
     ↓
User Question
     ↓
Semantic Retrieval
     ↓
Relevant Chunks
     ↓
AI Model
     ↓
Grounded Answer
```

---

# Project Architecture Summary

The project progressively evolves through three layers of functionality:

```text
                 AI-POWERED EVANGADI FORUM
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     Milestone 1      Milestone 2      Milestone 3
   Authentication     Forum + AI          RAG
          │                │                │
          ▼                ▼                ▼
       Users          Questions         Documents
       Login           Answers           Chunks
       JWT             Search            Embeddings
       Security        Semantic Search   Retrieval
                       Draft Coach        Grounded AI
                       Answer Fit
```

Each milestone builds on the previous one rather than creating a separate application.

The final system therefore combines:

```text
Secure Authentication
        +
Forum Questions & Answers
        +
Semantic Search
        +
AI Assistance
        +
RAG Knowledge Retrieval
        ↓
AI-Powered Evangadi Forum
```

---

# Project Status

| Milestone   | Focus                                   | Status      |
| ----------- | --------------------------------------- | ----------- |
| Milestone 1 | Authentication & Application Foundation | Completed   |
| Milestone 2 | Questions, Answers & AI Assistance      | In Progress |
| Milestone 3 | RAG Knowledge Base                      | Planned     |

The project follows a modular architecture so that authentication, forum functionality, AI services, and RAG functionality can evolve independently while remaining part of the same application.
