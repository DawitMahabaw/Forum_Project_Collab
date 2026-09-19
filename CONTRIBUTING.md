# Contributing to AI-Powered Evangadi Forum

Thank you for contributing to the AI-Powered Evangadi Forum.

This guide defines the main development, security, Git, testing, and collaboration standards for the project.

For complete setup and application documentation, see the [README](README.md).

---

## Project Scope

The project contains three major areas:

```text
AI-POWERED EVANGADI FORUM
        |
        +-- Authentication
        |     +-- Registration
        |     +-- Login
        |     +-- JWT
        |     +-- Protected Routes
        |
        +-- Forum
        |     +-- Questions
        |     +-- Answers
        |     +-- Search
        |     +-- Semantic Search
        |     +-- AI Assistance
        |
        +-- Knowledge Base / RAG
              +-- PDF Upload
              +-- Text Extraction
              +-- Chunking
              +-- Embeddings
              +-- Retrieval
              +-- Grounded AI Answers
              +-- Document Management
```

Contributions should preserve the existing architecture and behavior of these areas.

---

## Architecture

### Frontend

```text
frontend/src/
├── components/    Reusable UI
├── context/       Shared state
├── pages/         Route-level screens
├── routes/        Frontend routes
├── services/      API communication
└── utils/         Client helpers
```

Use the existing `services/api.js` for API communication instead of creating Axios requests directly inside components.

Use CSS Modules for component and page-specific styling.

Handle important UI states:

```text
Loading → Success
        → Empty
        → Error
```

### Backend

```text
backend/src/
├── ai/            Gemini, embeddings, vector utilities
├── config/        Database and environment configuration
├── controllers/   HTTP request handling
├── middleware/    Auth, uploads, errors
├── models/        Database access
├── routes/        API routes
├── services/      Business logic
└── utils/         Shared utilities
```

The normal backend flow is:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model / AI / RAG
  ↓
Database / External Service
```

Keep responsibilities separated. Avoid putting large amounts of business logic inside routes or controllers.

---

## Authentication and Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> Is this user allowed to perform this action?

Protected operations must verify authorization on the server.

Do not trust client-provided ownership values such as:

```text
userId
authorId
ownerId
```

Use the authenticated server-side user and verify ownership against the database.

---

## Database

Database structure is maintained in:

```text
backend/db/schema.sql
```

When changing the database:

* preserve relationships and foreign keys;
* consider indexes;
* consider deletion behavior;
* update affected models and services;
* test existing functionality.

Always use parameterized SQL.

Never build SQL by directly concatenating user input.

---

## AI and Semantic Search

AI functionality is primarily organized under:

```text
backend/src/ai/
```

The semantic-search flow is:

```text
Text
 ↓
Embedding
 ↓
Vector
 ↓
Similarity Calculation
 ↓
Ranked Results
```

When changing embeddings, vector formats, similarity calculations, or preprocessing, consider existing stored vectors.

Changing the embedding model or dimensions may require regenerating existing vectors.

AI-generated content should be treated as assistance, not automatically trusted as fact.

---

## RAG / Knowledge Base

The RAG pipeline is:

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Storage
 ↓
User Query
 ↓
Semantic Retrieval
 ↓
Relevant Chunks
 ↓
AI Context
 ↓
Grounded Answer
```

Changes to one stage can affect the complete pipeline.

Document uploads must consider:

* authentication;
* authorization;
* file validation;
* file size;
* safe filenames;
* processing failures;
* cleanup.

When deleting a document, remove its associated derived data when applicable:

```text
Document
 ├── Stored File
 ├── Database Record
 ├── Chunks
 └── Embeddings
```

Test the complete RAG flow after significant changes.

---

## Security

Never commit:

```text
.env
API keys
JWT secrets
Passwords
Database credentials
Private documents
Production data
```

Use `.env.example` for required environment variables.

Never place server secrets in frontend variables such as:

```text
VITE_*
```

Validate uploaded files and never expose internal server errors, SQL statements, filesystem paths, or secrets to clients.

---

## Testing and Quality

Before opening a pull request, run the relevant checks.

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
node index.js
```

Manually test affected functionality, especially:

* authentication;
* protected routes;
* questions and answers;
* semantic search;
* Draft Coach;
* Answer Fit;
* document upload;
* RAG search;
* RAG AI queries;
* PDF preview;
* document deletion;
* error and loading states.

There is currently no automated backend test runner, so targeted manual testing is important.

---

## Git and Commits

Keep commits small and focused.

Use clear, descriptive commit messages.

Good:

```text
Add question ownership validation
Implement semantic document retrieval
Add PDF upload validation
Handle unavailable embedding service
Improve question search empty state
```

Avoid:

```text
updates
changes
work
done
final
```

Do not combine unrelated changes into one commit.

Always review:

```bash
git status
git diff
```

before committing.

---

## Pull Requests

A pull request should briefly explain:

```text
Summary
- What changed
- Why it changed

Validation
- Commands run
- Manual testing performed

Important Changes
- API
- Database
- Authentication
- AI
- RAG
- Environment
```

Include screenshots for meaningful UI changes when useful.

Clearly mention breaking or contract changes.

---

## Documentation

Update the README when changes affect:

* setup;
* environment variables;
* APIs;
* architecture;
* user-visible features;
* AI behavior;
* RAG behavior;
* database requirements.

Documentation should always describe the **current working application**, not planned features.

---

## Code Style

Use the existing project conventions.

```text
React Components → PascalCase
Functions/Variables → camelCase
```

Use descriptive filenames:

```text
QuestionCard.jsx
questionService.js
authMiddleware.js
ragService.js
```

Comments should explain **why** something is done, especially around security, AI, vectors, RAG, and unusual implementation decisions.

---

## Final Review Checklist

Before submitting a contribution:

```text
[ ] Architecture is respected
[ ] Authentication and authorization are correct
[ ] Database changes are intentional
[ ] AI/RAG behavior is tested when applicable
[ ] Loading and error states are handled
[ ] No secrets or private data are committed
[ ] No unrelated files are included
[ ] Lint passes
[ ] Build passes
[ ] Manual testing is complete
[ ] Documentation is updated when necessary
[ ] Commit messages are clear
```

The goal is simple:

> **Make the project better without making it harder to understand, maintain, secure, or extend.**
