# Contributing to AI-Powered Evangadi Forum

Thank you for contributing to the AI-Powered Evangadi Forum.

This guide defines the main development, security, Git, testing, and collaboration standards for the project.

For complete setup and application documentation, see the [README](README.md).

---

## Project Scope

The project contains four major functional pillars:

```text
AI-POWERED EVANGADI FORUM
        |
        +-- Authentication & User Management
        |     +-- Registration & Login (JWT)
        |     +-- Protected Routes & Context
        |     +-- Profile & Custom Avatar Upload
        |     +-- Password Reset & Email Notifications
        |
        +-- Forum & Discussions
        |     +-- Questions (CRUD & Author Ownership)
        |     +-- Answers (CRUD & Self-Answer Restrictions)
        |     +-- Threaded Replies on Answers
        |     +-- Semantic Question Search & Recommendations
        |     +-- AI Draft Coach & Answer Fit Evaluation
        |
        +-- Knowledge Base / RAG
        |     +-- Authenticated PDF & Plain Text (.txt) Upload & Storage
        |     +-- Text Extraction & Document Chunking
        |     +-- Chunk Embeddings & Vector Storage
        |     +-- Semantic Retrieval & In-Browser PDF Preview
        |     +-- Grounded AI Question Answering
        |     +-- AI Document Summarization & Export (.txt/.md)
        |     +-- Document Deletion with Vector Cleanup
        |
        +-- Administration & Moderation
              +-- Platform Metrics Dashboard
              +-- User Account Management
              +-- Question Moderation Queue
```

Contributions should preserve the existing architecture and behavior of these areas.

---

## Architecture

### Frontend

```text
frontend/src/
├── components/    Reusable UI, Layout, Protected/Admin route guards
├── context/       Shared state (AuthContext, ThemeContext, SidebarContext)
├── pages/         Route screens (Landing, Auth, Dashboard, PostQuestion, QuestionDetail, MyQuestions, RagDocuments, Profile, Admin, Settings)
├── routes/        Frontend router configuration (AppRoutes)
├── services/      API communication layer (Axios wrappers)
└── utils/         Client helpers and formatting
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
├── ai/            Gemini integration, embedding generation, vector math
├── config/        Database pool, env configuration, schema initialization
├── controllers/   HTTP request & response handling
├── middleware/    JWT auth, admin authorization, avatar/doc upload, rate limiting, errors
├── models/        Direct MySQL queries & persistence
├── rag/           Document extraction, chunking, retrieval & RAG service
├── routes/        Express API route definitions
├── services/      Core business logic & workflows
└── utils/         Password hashing, tokens, email templates, seeds
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

Use the authenticated server-side user and verify ownership against the database. Administrative operations must verify the authenticated user's role (`role === 'admin'`) via server middleware.

---

## Database

Database structure is maintained in:

```text
backend/db/schema.sql
```

with automatic initialization and dynamic column migrations handled by `backend/src/config/initDb.js`.

When changing the database:

* preserve relationships and foreign keys;
* consider indexes;
* consider deletion behavior (e.g. `ON DELETE CASCADE`);
* update affected models and services;
* test existing functionality.

Always use parameterized SQL.

Never build SQL by directly concatenating user input.

---

## AI and Semantic Search

AI functionality is organized under:

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

Changing the embedding model or dimensions requires regenerating stored question and document vectors to maintain cosine similarity accuracy.

AI-generated content should be treated as assistance, not automatically trusted as fact.

---

## RAG / Knowledge Base

The RAG pipeline is organized under `backend/src/rag/`:

```text
PDF / TXT Document
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Storage
 ↓
User Query / Summary Prompt
 ↓
Semantic Retrieval / Context
 ↓
Relevant Chunks / Document Excerpt
 ↓
Gemini AI
 ↓
Grounded Answer / Document Summary
```

Changes to one stage can affect the complete pipeline.

Document uploads must consider:

* authentication;
* authorization;
* file validation (PDF and TXT mime-types);
* file size limits;
* safe filenames and storage paths;
* processing failures and status tracking;
* cleanup on failure or deletion.

When deleting a document, remove its associated derived data when applicable:

```text
Document
 ├── Stored File (uploads/rag-documents/)
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

## Git and GitHub Workflow

To keep the codebase stable and avoid conflicts, all contributors must follow these fundamental Git rules:

### Fundamental Rules

1. **NEVER push directly to `main`**:
   * The `main` branch represents stable, deployable code. Direct pushes (`git push origin main`) are strictly prohibited.
   * All changes must be developed on a dedicated branch and merged only via a reviewed Pull Request (PR).

2. **ALWAYS pull the latest changes before starting work**:
   * Before creating a new branch or resuming work, always pull the latest updates from `origin/main` to avoid starting from an outdated commit:
     ```bash
     git checkout main
     git pull origin main
     ```
   * While working on your branch, periodically merge or pull the latest `main` into your feature branch to catch conflicts early:
     ```bash
     git pull origin main
     ```

3. **Use consistent branch naming conventions**:
   * Create descriptive branch names using prefixes:
     * `feature/<feature-name>` (e.g., `feature/user-avatar-upload`, `feature/rag-search-ui`)
     * `fix/<bug-name>` (e.g., `fix/jwt-expiration-handling`)
     * `refactor/<module-name>` (e.g., `refactor/answer-controller`)
     * `docs/<topic>` (e.g., `docs/update-readme`)

4. **Never commit sensitive files or untracked clutter**:
   * Before adding files, always check `git status`.
   * Never blindly run `git add .` without reviewing the staged files. Ensure `.env`, uploaded files in `uploads/`, build directories (`dist/`), and `node_modules/` remain untracked.

---

### Step-by-Step GitHub Workflow

```text
1. Sync Main & Branch Out
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name

2. Develop & Test Locally
   Run lint and build checks

3. Stage & Commit
   git status
   git diff
   git add <specific-files>
   git commit -m "Descriptive commit message"

4. Sync With Main Before Push
   git pull origin main
   (Resolve any conflicts locally)

5. Push Feature Branch
   git push origin feature/your-feature-name

6. Open a Pull Request (PR)
   Open PR on GitHub targeting main
   Request code review & address feedback
```

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
npm run dev
```

Manually test affected functionality, especially:

* authentication and session persistence;
* user profile updates and avatar upload;
* password reset and email workflows;
* protected and admin-only routes;
* questions, answers, and threaded replies;
* semantic search and related recommendations;
* Draft Coach and Answer Fit evaluations;
* document upload, chunking, and embedding generation;
* RAG semantic search, grounded AI queries, and document summarization;
* PDF streaming preview modal and summary export;
* document deletion with cascading vector cleanup;
* dark/light theme switching and responsive sidebar drawer;
* error, empty, and loading states.

There is currently no automated backend test runner, so targeted manual testing is important.

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
[ ] Did not commit directly to main (worked on a feature branch)
[ ] Pulled latest changes from main and resolved any merge conflicts
[ ] Architecture is respected
[ ] Authentication and authorization are correct (role & ownership checked)
[ ] Database changes are intentional and use parameterized queries
[ ] AI/RAG behavior is tested when applicable
[ ] Loading and error states are handled
[ ] No secrets (.env) or private data are committed
[ ] No unrelated files or build output are included
[ ] Lint passes (npm run lint)
[ ] Build passes (npm run build)
[ ] Manual testing is complete across affected flows
[ ] Documentation is updated when necessary
[ ] Commit messages are clear and descriptive
```

The goal is simple:

> **Make the project better without making it harder to understand, maintain, secure, or extend.**

