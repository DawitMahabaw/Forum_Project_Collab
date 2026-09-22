# AI-Powered Evangadi Forum

A full-stack, AI-powered discussion platform where learners can ask technical questions, share answers, discover related discussions through semantic search, receive AI-assisted writing feedback, and interact with a private document-based knowledge base using Retrieval-Augmented Generation (RAG).

The project combines a modern React frontend, an Express/Node.js backend, MySQL persistence, Google Gemini AI services, semantic search, vector embeddings, and a document-based RAG pipeline.

---

## Project Overview

The AI-Powered Evangadi Forum is designed to make technical discussions easier to create, discover, and understand.

Traditional forum search often depends on exact keywords. This project extends the traditional forum experience with AI capabilities that understand the meaning behind questions and documents.

The application provides three major areas of functionality:

```text
                    AI-POWERED EVANGADI FORUM
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
   Authentication       Forum & AI           Knowledge Base
   & Foundation         Assistance                / RAG
          |                   |                   |
          v                   v                   v
       Users          Questions & Answers     PDF Documents
       JWT            Semantic Search         Chunking
       Protected      Related Questions      Embeddings
       Routes         Draft Coach             Retrieval
                      Answer Fit              Grounded AI
```

---

## Completed Project Scope

All three project milestones have been completed.

| Milestone   | Area                                    | Status    |
| ----------- | --------------------------------------- | --------- |
| Milestone 1 | Authentication & Application Foundation | Completed |
| Milestone 2 | Questions, Answers & AI Assistance      | Completed |
| Milestone 3 | Knowledge Base & RAG                    | Completed |

---

## Core Features

### Authentication & User Management

* User registration
* User login
* Password hashing with bcrypt
* JWT-based authentication
* Protected API routes
* Protected frontend routes
* Current-user authentication
* Global authentication state
* Automatic handling of unauthorized API responses
* Ownership-based authorization

### Forum

* Create questions
* View questions
* Update questions
* Delete questions
* View individual discussions
* Create answers
* Update answers
* Delete answers
* Prevent users from answering their own questions
* Author-only question management
* Author-only answer management
* Markdown-friendly question and answer content
* Loading, empty, error, and ownership states

### Search & Discovery

* Keyword-based question search
* Semantic question search
* Related-question recommendations
* Question embeddings
* Cosine similarity
* Meaning-based question discovery
* Search result ranking
* Configurable similarity thresholds

### AI Assistance

* AI Draft Coach for questions
* AI Answer Fit evaluation
* Gemini-powered text generation
* Gemini-powered embeddings
* AI service error handling
* AI request timeout and retry handling
* AI output treated as assistance rather than authoritative information

### Knowledge Base / RAG

* Authenticated document upload
* PDF document support
* Secure document storage
* PDF text extraction
* Text chunking
* Chunk embeddings
* Semantic document search
* Relevant document excerpt retrieval
* Grounded AI question answering
* Document metadata
* Document status tracking
* PDF file streaming
* PDF preview
* User document listing
* Document deletion
* Associated vector cleanup

---

# Architecture

The application follows a layered full-stack architecture.

```text
                         React + Vite
                              |
                              | Axios
                              | Bearer JWT
                              v
                       Express REST API
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
       Routes            Controllers          Middleware
                              |
                              v
                          Services
                       /     |      \
                      /      |       \
                     v       v        v
                  Forum      AI       RAG
                    |        |         |
                    v        v         v
                  Models   Gemini   Retrieval
                    |        |         |
                    v        v         v
                  MySQL   Embeddings  Documents
```

### Backend responsibility

The backend is responsible for:

* API routing
* Authentication
* Authorization
* Validation
* Business logic
* Database access
* Question and answer management
* AI generation
* Embedding generation
* Semantic search
* Document processing
* RAG retrieval
* Error handling
* Secure file handling

### Frontend responsibility

The frontend is responsible for:

* Application routing
* Authentication state
* User interface
* Forms
* Forum views
* Search interfaces
* AI interaction interfaces
* Document management
* PDF preview
* Loading and error states
* Reusable UI components

---

# Technology Stack

| Area                | Technology              |
| ------------------- | ----------------------- |
| Frontend            | React 19                |
| Build Tool          | Vite                    |
| Routing             | React Router            |
| HTTP Client         | Axios                   |
| Styling             | CSS Modules             |
| UI Icons            | Lucide                  |
| Animation           | Framer Motion           |
| Backend             | Node.js                 |
| API Framework       | Express 5               |
| Database            | MySQL 8+                |
| Database Driver     | mysql2                  |
| Authentication      | JSON Web Tokens         |
| Password Security   | bcrypt                  |
| AI                  | Google Gemini           |
| Embeddings          | Gemini Embedding API    |
| Code Quality        | Oxlint                  |
| Document Processing | PDF processing pipeline |
| Architecture        | MVC + Service Layer     |

---

# Milestone 1 — Authentication & Application Foundation

The first milestone established the secure foundation of the application.

## Authentication Flow

```text
User
 |
 v
Register / Login
 |
 v
Express API
 |
 v
Validate Credentials
 |
 +---- Register ---> Hash Password ---> Save User
 |
 +---- Login ------> Verify Password
                         |
                         v
                    Generate JWT
                         |
                         v
                    Return Token
                         |
                         v
                 Frontend Auth State
```

## Authentication Components

The application uses:

* bcrypt for password hashing
* JWT for authentication
* Authentication middleware for protected API routes
* Axios configuration for authenticated requests
* Global authentication context
* Protected frontend routes

JWT allows the API to remain stateless while the client sends the token with protected requests.

```text
Frontend
   |
   | Authorization: Bearer <JWT>
   v
Express API
   |
   v
Authentication Middleware
   |
   +---- Invalid ---> 401 Unauthorized
   |
   +---- Valid -----> Controller
```

---

# Milestone 2 — Questions, Answers & AI Assistance

The second milestone transformed the authentication foundation into a complete AI-assisted discussion platform.

## Question Lifecycle

```text
User creates question
        |
        v
Frontend form
        |
        v
POST /api/questions
        |
        v
Controller
        |
        v
Question Service
        |
        +---- Save question
        |
        +---- Generate embedding
                    |
                    v
              Store vector
```

If the AI embedding service is temporarily unavailable, the question can still be stored and its vector can be generated later.

---

# Semantic Search

Traditional keyword search looks for matching words.

Semantic search looks for similar meaning.

For example:

```text
Search:
"Why does my React component render again?"

Possible related questions:

"Why is my React component re-rendering?"

"My React component keeps rendering multiple times."

"How can I prevent unnecessary React renders?"
```

The wording is different, but the meaning is related.

## Semantic Search Flow

```text
User Search Query
       |
       v
Generate Query Embedding
       |
       v
Compare With Question Vectors
       |
       v
Calculate Cosine Similarity
       |
       v
Apply Similarity Threshold
       |
       v
Rank Results
       |
       v
Return Related Questions
```

This allows the forum to discover discussions that may be relevant even when users do not use the same keywords.

---

# AI Draft Coach

The Draft Coach helps users improve a question before publishing it.

```text
Question Draft
      |
      v
Draft Coach
      |
      v
Gemini
      |
      v
Suggestions
      |
      v
User reviews suggestions
      |
      v
User decides what to publish
```

The AI does not automatically publish or modify the user's question.

The user remains responsible for the final content.

---

# AI Answer Fit

Answer Fit provides AI feedback on a proposed answer before submission.

```text
Question
   +
Answer Draft
   |
   v
Answer Fit
   |
   v
Gemini
   |
   v
Relevance / Quality Feedback
   |
   v
User reviews feedback
   |
   v
Submit Answer
```

Draft Coach and Answer Fit serve different purposes:

| Feature     | Purpose                               |
| ----------- | ------------------------------------- |
| Draft Coach | Improve a question before publishing  |
| Answer Fit  | Evaluate an answer against a question |

---

# Milestone 3 — Knowledge Base & RAG

The third milestone adds a document-based AI knowledge system.

RAG stands for:

**Retrieval-Augmented Generation**

Instead of asking the AI to answer only from its general knowledge, the application first retrieves relevant information from documents provided by the user.

```text
User Document
      |
      v
Extract Text
      |
      v
Split Into Chunks
      |
      v
Generate Embeddings
      |
      v
Store Chunks + Vectors
      |
      v
User Asks Question
      |
      v
Generate Query Embedding
      |
      v
Retrieve Relevant Chunks
      |
      v
Build AI Context
      |
      v
Gemini
      |
      v
Grounded Answer
```

---

# Document Processing

When a user uploads a PDF:

```text
PDF Upload
    |
    v
Authentication
    |
    v
Upload Validation
    |
    v
Secure File Storage
    |
    v
PDF Text Extraction
    |
    v
Text Chunking
    |
    v
Generate Embeddings
    |
    v
Store Document + Chunks + Vectors
    |
    v
Ready for Retrieval
```

Breaking a document into smaller chunks makes retrieval more precise than creating a single embedding for an entire document.

---

# RAG Semantic Search

A document search works similarly to question semantic search, but the searchable information comes from document chunks.

```text
User Query
    |
    v
Query Embedding
    |
    v
Compare With Chunk Embeddings
    |
    v
Cosine Similarity
    |
    v
Rank Relevant Chunks
    |
    v
Return Relevant Excerpts
```

---

# Grounded AI Answers

The RAG question-answering workflow adds one important step: retrieval happens before generation.

```text
User Question
      |
      v
Semantic Retrieval
      |
      v
Relevant Document Chunks
      |
      v
AI Context
      |
      v
Gemini
      |
      v
Document-Grounded Answer
```

The retrieved document content gives the model context from the user's knowledge base.

This makes RAG different from simply sending a question directly to an AI model.

---

# Knowledge Base Interface

The frontend provides a dedicated knowledge-base experience.

```text
Knowledge Base
      |
      +---- Document Sidebar
      |
      +---- Upload PDF
      |
      +---- Ask AI
      |
      +---- Semantic Search
      |
      +---- PDF Preview
```

### Ask AI

Allows users to ask questions about the selected document and receive a grounded AI response.

### Semantic Search

Allows users to search the document and inspect relevant excerpts without necessarily generating an AI response.

### PDF Preview

Allows users to view the original document alongside the knowledge-base functionality.

---

# RAG Document Management

Users can:

* Upload documents
* View document metadata
* View processing status
* List their documents
* Search document content
* Ask questions about documents
* Preview PDF files
* Delete documents

Deleting a document also requires removing its associated chunks and vectors so that deleted information cannot continue appearing in retrieval results.

---

# API Overview

All protected endpoints require:

```http
Authorization: Bearer <token>
```

## Health

| Method | Endpoint | Purpose                |
| ------ | -------- | ---------------------- |
| GET    | `/`      | Check API availability |

## Authentication

| Method | Endpoint             | Purpose              |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/register` | Register a user      |
| POST   | `/api/auth/login`    | Authenticate a user  |
| GET    | `/api/auth/me`       | Get the current user |

## Questions

| Method | Endpoint                                  | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/questions`                          | List questions           |
| POST   | `/api/questions`                          | Create a question        |
| GET    | `/api/questions/search`                   | Semantic question search |
| GET    | `/api/questions/:questionHash`            | Get a discussion         |
| GET    | `/api/questions/:questionHash/similar`    | Find related questions   |
| PUT    | `/api/questions/:questionHash`            | Update owned question    |
| DELETE | `/api/questions/:questionHash`            | Delete owned question    |
| POST   | `/api/questions/draft-coach`              | AI question feedback     |
| POST   | `/api/questions/:questionHash/answer-fit` | AI answer feedback       |

## Answers

| Method | Endpoint                 | Purpose             |
| ------ | ------------------------ | ------------------- |
| POST   | `/api/answers`           | Create an answer    |
| PUT    | `/api/answers/:answerId` | Update owned answer |
| DELETE | `/api/answers/:answerId` | Delete owned answer |

## Knowledge Base / RAG

| Method | Endpoint                                | Purpose                      |
| ------ | --------------------------------------- | ---------------------------- |
| POST   | `/api/rag/documents`                    | Upload and process a PDF     |
| GET    | `/api/rag/documents`                    | List user documents          |
| GET    | `/api/rag/documents/:documentId`        | Get document metadata/status |
| GET    | `/api/rag/documents/:documentId/file`   | Stream PDF file              |
| GET    | `/api/rag/documents/:documentId/search` | Semantic document search     |
| POST   | `/api/rag/documents/:documentId/query`  | Ask AI about a document      |
| DELETE | `/api/rag/documents/:documentId`        | Delete document and vectors  |

---

# Repository Structure

```text
.
├── backend/
│   ├── db/
│   │   └── schema.sql
│   │
│   ├── src/
│   │   ├── ai/
│   │   │   ├── embeddingService.js
│   │   │   ├── gemini.js
│   │   │   ├── generateText.js
│   │   │   └── vectorMath.js
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── answerController.js
│   │   │   ├── authController.js
│   │   │   ├── documentController.js
│   │   │   └── questionController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Answer.js
│   │   │   ├── Document.js
│   │   │   ├── Question.js
│   │   │   ├── QuestionVector.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── answerRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   └── questionRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── answerService.js
│   │   │   ├── authService.js
│   │   │   ├── questionService.js
│   │   │   └── ragService.js
│   │   │
│   │   └── utils/
│   │       ├── gemini.js
│   │       ├── generateText.js
│   │       ├── hash.js
│   │       ├── jwt.js
│   │       ├── password.js
│   │       └── vectorMath.js
│   │
│   ├── uploads/
│   │   └── rag-documents/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

# Backend Architecture

The backend follows a layered MVC-style architecture.

```text
Request
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   v
Model
   |
   v
MySQL
```

### Routes

Define API endpoints and connect them to controllers.

### Controllers

Handle HTTP requests and responses.

Controllers should remain focused on the HTTP layer rather than containing large amounts of business logic.

### Services

Contain application and business logic.

Examples include:

* authentication
* questions
* answers
* AI operations
* RAG operations

### Models

Handle database operations and persistence.

### Middleware

Handles cross-cutting concerns such as:

* authentication
* authorization
* uploads
* error handling

### AI Layer

The AI-related code handles:

* Gemini communication
* text generation
* embedding generation
* vector operations

---

# Database

The application uses MySQL for persistent storage.

The database stores information related to:

* Users
* Questions
* Answers
* Question vectors
* Documents
* Document chunks
* Document embeddings

Conceptually:

```text
User
 |
 +---- Questions
 |       |
 |       +---- Question Vector
 |       |
 |       +---- Answers
 |
 +---- Documents
         |
         +---- Document Chunks
                  |
                  +---- Embeddings
```

---

# Security

Security is considered throughout the application.

### Authentication

Passwords are hashed before storage.

JWTs are used to authenticate protected API requests.

### Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this action?

For example, a user can modify or delete only content they own.

### File Security

Uploaded documents are handled through authenticated routes and upload validation.

### Environment Variables

Secrets are kept outside source code.

Never commit:

```text
.env
API keys
JWT secrets
Database passwords
Private credentials
Production database dumps
```

### AI Safety

AI output is treated as assistance.

Users should verify AI-generated suggestions and answers before relying on or publishing them.

---

# Environment Configuration

Create the backend environment file from the example configuration.

Example:

```dotenv
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=evangadi_forum_collab

JWT_SECRET=replace_with_a_long_random_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
GEMINI_FALLBACK_MODEL=

SEMANTIC_SEARCH_DEFAULT_K=10
SEMANTIC_SEARCH_RECOMMEND_THRESHOLD=0.6
SEMANTIC_SEARCH_MAX_K=20
SEMANTIC_SEARCH_BACKFILL_LIMIT=10
```

The frontend should contain:

```dotenv
VITE_API_BASE_URL=http://localhost:4000
```

Frontend environment variables beginning with `VITE_` are exposed to the browser, so secrets must never be placed there.

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm
* MySQL 8+
* Git
* Google Gemini API key

---

## Clone the Repository

```bash
git clone <repository-url>
cd Evangadi_Forum_Collab
```

---

## Configure MySQL

Create the application database:

```sql
CREATE DATABASE evangadi_forum_collab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Use the provided database schema:

```text
backend/db/schema.sql
```

---

## Configure Environment Variables

From the repository root:

```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Update the values according to your local environment.

---

## Install Backend Dependencies

```bash
cd backend
npm ci
```

---

## Install Frontend Dependencies

```bash
cd ../frontend
npm ci
```

---

## Start the Backend

From the `backend` directory:

```bash
node index.js
```

The API normally runs on:

```text
http://localhost:4000
```

---

## Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite normally provides:

```text
http://localhost:5173
```

---

# Available Scripts

## Frontend

Run from `frontend/`:

| Command           | Purpose                  |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Create production build  |
| `npm run lint`    | Run Oxlint               |
| `npm run preview` | Preview production build |

## Backend

Run from `backend/`:

```bash
node index.js
```

For local development with nodemon:

```bash
npx nodemon index.js
```

---

# Typical User Flow

A complete user journey can look like this:

```text
Landing Page
     |
     v
Register / Login
     |
     v
Authenticated Dashboard
     |
     +-------------------------+
     |                         |
     v                         v
Search Questions          Ask Question
     |                         |
     v                         v
Semantic Results          Draft Coach
     |                         |
     +------------+------------+
                  |
                  v
            Question Detail
                  |
          +-------+-------+
          |               |
          v               v
    Read Answers      Write Answer
                          |
                          v
                      Answer Fit
                          |
                          v
                    Publish Answer
```

The knowledge-base flow extends the application:

```text
Dashboard
    |
    v
Knowledge Base
    |
    +---- Upload PDF
    |
    +---- Select Document
              |
              +---- Ask AI
              |
              +---- Semantic Search
              |
              +---- PDF Preview
```

---

# Forum Search vs Knowledge Base Search

The project contains two related but different semantic search systems.

### Forum Semantic Search

Searches questions created by forum users.

```text
Query
  |
  v
Question Embeddings
  |
  v
Similar Questions
```

### Knowledge Base Semantic Search

Searches chunks extracted from uploaded documents.

```text
Query
  |
  v
Document Chunk Embeddings
  |
  v
Relevant Document Content
```

The same embedding and similarity concepts can support both systems, but they operate on different data.

---

# RAG vs Normal AI Generation

A normal AI request looks like:

```text
User Question
      |
      v
Gemini
      |
      v
AI Response
```

RAG adds retrieval:

```text
User Question
      |
      v
Retrieve Relevant Document Content
      |
      v
Build Context
      |
      v
Gemini
      |
      v
Grounded Response
```

This allows the application to use information from its own document collection during generation.

---

# Error Handling

The application is designed to provide controlled responses when something goes wrong.

Examples include:

* Invalid authentication
* Unauthorized access
* Invalid question data
* Missing resources
* Database errors
* AI provider failures
* Embedding failures
* Invalid uploads
* Document processing failures

The API follows a consistent response pattern.

Successful responses use:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "A user-facing error message"
}
```

Provider and internal implementation details should not be exposed to clients.

---

# Quality Checks

Before submitting changes, run the frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

Then manually verify the affected application flow.

For authentication changes, verify:

```text
Register
   ↓
Login
   ↓
Protected Request
   ↓
Authenticated Response
```

For forum changes, verify:

```text
Create Question
   ↓
Search
   ↓
Open Question
   ↓
Create Answer
   ↓
Ownership Rules
```

For AI changes, verify both successful responses and provider failure states.

For RAG changes, verify:

```text
Upload PDF
   ↓
Process Document
   ↓
Search Document
   ↓
Ask AI
   ↓
Preview Document
   ↓
Delete Document
```

---

# Project Principles

The project follows several architectural principles:

### Separation of Concerns

Each layer has a focused responsibility.

### Reusable Components

Common frontend UI is implemented through reusable components.

### Service-Based Business Logic

Business logic is kept outside route definitions and controllers where practical.

### Secure Authentication

Protected resources require authentication and ownership checks.

### AI as Assistance

AI helps users discover, write, and understand information without replacing user responsibility.

### Meaning-Based Discovery

Embeddings and vector similarity allow users to discover relevant content beyond exact keyword matches.

### Grounded AI

RAG allows AI responses to incorporate retrieved information from user-provided documents.

---

# Milestone Completion Summary

```text
┌─────────────────────────────────────────────────────────┐
│              AI-POWERED EVANGADI FORUM                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Milestone 1                                          │
│  Authentication & Application Foundation              │
│  ✓ Registration                                        │
│  ✓ Login                                               │
│  ✓ JWT Authentication                                  │
│  ✓ Protected Routes                                    │
│  ✓ Auth Context                                        │
│                                                         │
│  Milestone 2                                          │
│  Questions, Answers & AI Assistance                  │
│  ✓ Question Management                                 │
│  ✓ Answer Management                                   │
│  ✓ Keyword Search                                      │
│  ✓ Semantic Search                                     │
│  ✓ Related Questions                                   │
│  ✓ Draft Coach                                         │
│  ✓ Answer Fit                                          │
│                                                         │
│  Milestone 3                                          │
│  Knowledge Base & RAG                                 │
│  ✓ PDF Upload                                          │
│  ✓ Text Extraction                                     │
│  ✓ Chunking                                             │
│  ✓ Embeddings                                          │
│  ✓ Semantic Document Search                            │
│  ✓ RAG Retrieval                                       │
│  ✓ Grounded AI Answers                                 │
│  ✓ PDF Preview                                         │
│  ✓ Document Management                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# Contributing

Contributions should follow the project's architecture, coding standards, Git workflow, and security practices.

Before contributing, read:

```text
CONTRIBUTING.md
```

The contributing guide contains information about:

* Project architecture
* Development workflow
* Branches
* Commits
* Pull requests
* Code quality
* Security
* Milestone organization

---

# Final Project Architecture

The complete system can be understood through this high-level model:

```text
                         USER
                          |
                          v
                    React Frontend
                          |
             +------------+-------------+
             |                          |
             v                          v
        Forum Features             Knowledge Base
             |                          |
             v                          v
       Express REST API          Document API
             |                          |
      +------+-------+                  |
      |              |                  |
      v              v                  v
   MySQL          Gemini AI       PDF Processing
      |              |                  |
      |              v                  v
      |        Embeddings          Text Chunks
      |              |                  |
      |              v                  v
      |       Vector Similarity     Chunk Embeddings
      |              |                  |
      +--------------+------------------+
                     |
                     v
              Relevant Context
                     |
                     v
                  Gemini
                     |
                     v
             Grounded AI Answer
```

---

# Project Status

**All three milestones are completed.**

The project now provides a complete AI-powered forum experience combining:

* Secure authentication
* Full question and answer workflows
* Keyword and semantic discovery
* AI-assisted question writing
* AI-assisted answer evaluation
* Document-based knowledge retrieval
* Semantic document search
* Retrieval-Augmented Generation
* Grounded AI responses
* PDF document management
* A React-based user interface
* A layered Express/MySQL backend

The result is a full-stack forum application that combines traditional community discussion with modern AI-powered search, writing assistance, and document-grounded knowledge retrieval.

---

# License

No license is currently declared for this repository.

If the project is intended for public distribution or reuse, add an appropriate open-source license before redistribution.
