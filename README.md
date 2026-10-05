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
       Users          Questions & Answers     PDF & TXT Docs
       JWT            Semantic Search         Chunking
       Protected      Related Questions      Embeddings
       Routes         Draft Coach             Retrieval
                      Answer Fit              Grounded AI & Summary
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

* User registration & secure login
* Password hashing with bcrypt
* JWT-based stateless authentication
* Protected API routes with token verification
* Protected frontend routes & session management
* Global authentication context
* User profile management (headline, bio, location, and social links)
* Custom avatar upload with preview & static storage
* Password update & account settings
* Password reset workflow with secure tokens and email templates
* Role-based access control (Admin and Member tiers)
* Automatic handling of expired or unauthorized sessions
* Ownership-based authorization on all resources

### Forum & Community Discussions

* Create, view, update, and delete questions
* View individual discussion threads with full answer listings
* Create, update, and delete answers
* Threaded replies on answers for granular discussions
* Prevent users from answering their own questions
* Author-only question and answer management
* Dedicated "My Questions" personal dashboard
* Markdown-friendly question and answer formatting
* Polished loading, empty, error, and ownership states

### Search & Discovery

* Keyword-based question search
* Real-time debounced keyword search suggestions dropdown
* Semantic question search powered by AI vectors
* Instant toggle between keyword and AI semantic search modes
* Related-question recommendations on discussion pages
* Vector embeddings generation for questions
* Cosine similarity matching
* Meaning-based discovery across diverse phrasing
* Configurable similarity threshold and result limits

### AI Assistance

* AI Draft Coach for questions (with rate limiting protection)
* AI Answer Fit evaluation before submission
* Gemini-powered text generation
* Gemini-powered embeddings
* Resilient AI service error handling, timeout, and retry logic
* Human-in-the-loop AI assistance (reviewable suggestions)

### Knowledge Base / RAG

* Authenticated PDF and plain text (.txt) document upload
* Secure file storage and validation
* In-browser PDF streaming and preview modal
* Document text extraction and intelligent chunking
* Chunk-level vector embeddings
* Semantic document search across extracted excerpts
* Grounded AI question answering based on uploaded context
* AI document summarization with style presets (One page, Under 500w, Bullets, Executive)
* Client-side summary export and download (.txt and .md)
* Document metadata and processing status tracking
* User document catalog management
* Cascading deletion of documents, chunks, and vector embeddings

### Admin & Moderation

* Role-guarded administrative dashboard
* Platform-wide user metrics and management
* Moderation queue with question deletion controls
* Administrative routing guards on frontend and backend

### Modern UI & Experience

* Dark / Light mode toggle with persistent preferences
* Responsive navigation with collapsible sidebar drawer
* Clean typography and interactive animations with Framer Motion and Lucide icons
* Live search suggestions dropdown in navbar
* Rich Markdown toolbar (Bold, Italic, Code, Link) with live preview
* Consistent feedback toasts and state notifications

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

| Area                | Technology                  |
| ------------------- | --------------------------- |
| Frontend            | React 19                    |
| Build Tool          | Vite                        |
| Routing             | React Router 7              |
| HTTP Client         | Axios                       |
| Styling             | CSS Modules                 |
| Markdown Rendering  | React Markdown              |
| UI Icons            | Lucide React                |
| Animation           | Framer Motion               |
| Backend             | Node.js                     |
| API Framework       | Express 5                   |
| Database            | MySQL 8+                    |
| Database Driver     | mysql2 (Promise-based)      |
| Authentication      | JSON Web Tokens (JWT)       |
| Password Security   | bcrypt                      |
| Email Service       | Nodemailer (Gmail SMTP)     |
| File Uploads        | Multer                      |
| Rate Limiting       | express-rate-limit          |
| Validation          | Custom / Native Validation  |
| AI Model            | Google Gemini               |
| Embeddings          | Gemini Embedding API        |
| Document Parsing    | pdf-parse                   |
| Code Quality        | Oxlint                      |
| Architecture        | Layered MVC + Service Layer |

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
      +---- Document Sidebar (PDF & TXT Catalog)
      |
      +---- Upload Document (.pdf, .txt)
      |
      +---- Ask AI (Grounded Q&A)
      |
      +---- Semantic Search (Excerpt Search)
      |
      +---- Summarize (Presets & Export)
      |
      +---- PDF Preview
```

### Ask AI

Allows users to ask questions about the selected document and receive a grounded AI response.

### Semantic Search

Allows users to search the document and inspect relevant excerpts without necessarily generating an AI response.

### Summarize

Allows users to generate structured summaries using Gemini with customizable instructions or built-in presets (*One page*, *Under 500 words*, *Bullet points*, *Executive summary*) and export the result directly as a `.txt` or `.md` file.

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

## Authentication & Account

| Method | Endpoint                             | Purpose                              |
| ------ | ------------------------------------ | ------------------------------------ |
| POST   | `/api/auth/register`                 | Register a new user                  |
| POST   | `/api/auth/login`                    | Authenticate user and issue JWT      |
| GET    | `/api/auth/me`                       | Get current authenticated user       |
| GET    | `/api/auth/profile`                  | Get user profile & biography details |
| PUT    | `/api/auth/profile`                  | Update profile info & social links   |
| POST   | `/api/auth/avatar`                   | Upload user profile picture          |
| PUT    | `/api/auth/account`                  | Update account email/credentials     |
| PUT    | `/api/auth/change-password`          | Change password                      |
| POST   | `/api/auth/forgot-password`          | Initiate password reset workflow     |
| POST   | `/api/auth/reset-password-confirm`   | Complete password reset with token   |

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

## Answers & Discussion

| Method | Endpoint                 | Purpose                            |
| ------ | ------------------------ | ---------------------------------- |
| POST   | `/api/answers`           | Create an answer                   |
| PUT    | `/api/answers/:answerId` | Update owned answer                |
| DELETE | `/api/answers/:answerId` | Delete owned answer                |
| POST   | `/api/replies`           | Post a threaded reply to an answer |
| GET    | `/api/replies/:answerId` | Get all replies for an answer      |

## Knowledge Base / RAG

| Method | Endpoint                                   | Purpose                                        |
| ------ | ------------------------------------------ | ---------------------------------------------- |
| POST   | `/api/rag/documents`                       | Upload and process a PDF or TXT document       |
| GET    | `/api/rag/documents`                       | List user documents                            |
| GET    | `/api/rag/documents/:documentId`           | Get document metadata/status                   |
| GET    | `/api/rag/documents/:documentId/file`      | Stream PDF file                                |
| GET    | `/api/rag/documents/:documentId/search`    | Semantic document search                       |
| POST   | `/api/rag/documents/:documentId/query`     | Ask AI about a document                        |
| POST   | `/api/rag/documents/:documentId/summarize` | AI document summary with custom prompt/preset  |
| DELETE | `/api/rag/documents/:documentId`           | Delete document and vectors                    |

## Administration (Admin Only)

| Method | Endpoint                             | Purpose                              |
| ------ | ------------------------------------ | ------------------------------------ |
| GET    | `/api/admin/dashboard`               | Platform metrics & overview stats    |
| GET    | `/api/admin/users`                   | List all registered users            |
| DELETE | `/api/admin/users/:userId`           | Remove user account                  |
| GET    | `/api/admin/questions`               | Moderation queue of questions        |
| DELETE | `/api/admin/questions/:questionId`   | Delete question as administrator     |

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
│   │   │   ├── env.js
│   │   │   └── initDb.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── answerController.js
│   │   │   ├── authController.js
│   │   │   ├── createQuestionController.js
│   │   │   ├── documentController.js
│   │   │   ├── questionController.js
│   │   │   └── replyController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── adminMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── avatarUploadMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Answer.js
│   │   │   ├── Document.js
│   │   │   ├── Question.js
│   │   │   ├── QuestionVector.js
│   │   │   ├── Reply.js
│   │   │   └── User.js
│   │   │
│   │   ├── rag/
│   │   │   ├── chunking.js
│   │   │   ├── documentProcessing.js
│   │   │   ├── ragService.js
│   │   │   └── retrieval.js
│   │   │
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── answerRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── createQuestionRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── questionRoutes.js
│   │   │   └── replyRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── answerService.js
│   │   │   ├── authService.js
│   │   │   ├── createQuestionService.js
│   │   │   ├── documentService.js
│   │   │   ├── questionService.js
│   │   │   └── replyService.js
│   │   │
│   │   └── utils/
│   │       ├── emailTemplates.js
│   │       ├── hash.js
│   │       ├── jwt.js
│   │       ├── password.js
│   │       ├── questionHash.js
│   │       └── seed.js
│   │
│   ├── uploads/
│   │   ├── avatars/
│   │   └── rag-documents/
│   │
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppFooter/
│   │   │   ├── Layout/
│   │   │   ├── Navbar/
│   │   │   ├── QuestionCard/
│   │   │   ├── Sidebar/
│   │   │   ├── AdminRoute.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SidebarContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Landing/
│   │   │   ├── MyQuestions/
│   │   │   ├── PostQuestion/
│   │   │   ├── Profile/
│   │   │   ├── QuestionDetail/
│   │   │   ├── RagDocuments/
│   │   │   └── Settings/
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── answerService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── questionService.js
│   │   │   ├── ragService.js
│   │   │   └── replyService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   └── avatar.js
│   │   │
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

The application uses MySQL for persistent storage, with automatic schema and column initialization on startup (`backend/src/config/initDb.js`).

The database stores information related to:

* Users (credentials, profile bio, avatar URL, social links, role)
* Questions (content, hash-based URLs, author)
* Question vectors (Gemini-generated embeddings in JSON)
* Answers (content, author, question association)
* Replies (threaded discussions on specific answers)
* Documents (uploaded PDFs, metadata, processing status)
* Document chunks (segmented text content)
* Document chunk vectors (vector embeddings for semantic retrieval)

Conceptually:

```text
User (Profile, Avatar, Role)
 |
 +---- Questions
 |       |
 |       +---- Question Vector (JSON Embedding)
 |       |
 |       +---- Answers
 |               |
 |               +---- Replies (Threaded Comments)
 |
 +---- Documents
         |
         +---- Document Chunks
                  |
                  +---- Document Chunk Vectors (Embeddings)
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
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=evangadi_forum_collab

JWT_SECRET=replace_with_a_long_random_secret

# Password Reset Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
GEMINI_FALLBACK_MODEL=

# Semantic Search
SEMANTIC_SEARCH_DEFAULT_K=10
SEMANTIC_SEARCH_RECOMMEND_THRESHOLD=0.6
RELATED_QUESTION_THRESHOLD=0.72
SEMANTIC_SEARCH_MAX_K=20
SEMANTIC_SEARCH_BACKFILL_LIMIT=10

# RAG Documents
RAG_UPLOAD_DIR=uploads/rag-documents
RAG_MAX_FILE_SIZE_BYTES=10485760
RAG_EVIDENCE_THRESHOLD=0.55
RAG_SEARCH_THRESHOLD=0.60
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
CREATE DATABASE IF NOT EXISTS evangadi_forum_collab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

The database structure and schema are initialized automatically on backend startup via `backend/src/config/initDb.js`. The raw schema definition is also available in:

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

| Command           | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start backend server (`node index.js`)         |
| `npm start`       | Start backend server in production             |
| `npm run nodemon` | Start backend server with hot-reloading        |
| `npm run seed`    | Populate database with sample forum data       |

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

