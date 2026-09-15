# Contributing to AI-Powered Evangadi Forum

Thank you for contributing to the **AI-Powered Evangadi Forum** project.

This project is developed in milestones so that each stage builds on the previous one.

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

---

## Development Milestones

### Milestone 1 — Authentication & Application Foundation

**Status: Completed**

Milestone 1 established:

* User registration and login
* Password hashing with bcrypt
* JWT authentication
* Protected routes
* AuthContext
* Axios API configuration
* Backend MVC architecture
* MySQL user database
* Public landing page

Milestone 1 provides the authentication foundation required by the rest of the application.

---

### Milestone 2 — Questions, Answers & AI Assistance

**Status: In Progress**

Milestone 2 builds the main forum functionality on top of Milestone 1 authentication.

Contributors work on:

* Creating questions
* Retrieving questions
* Searching questions
* Question details
* Posting answers
* User's own questions
* Similar questions
* Question embeddings
* Semantic search
* AI Draft Coach
* AI Answer Fit

The main relationship is:

```text
Authenticated User
       ↓
Questions & Answers
       ↓
Embeddings
       ↓
Semantic Search
       ↓
AI Assistance
```

Milestone 2 continues using the same layered backend architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model / AI Service
  ↓
MySQL / AI Provider
```

---

### Milestone 3 — RAG Knowledge Base

**Status: Planned**

Milestone 3 will introduce document-based knowledge retrieval using RAG.

Planned areas include:

* PDF uploads
* Document processing
* Text chunking
* Embeddings
* Semantic document search
* Grounded AI answers
* Document management

---

# Project Structure

The project is divided into separate frontend and backend applications.

```text
EvangadiForum/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── db/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── utils/
│
└── README.md
```

Keep related functionality in the appropriate folder and avoid placing business logic directly inside routes or React components.

---

# Backend Guidelines

Follow the layered architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Database
```

AI-related operations should remain separated from normal database logic.

For example:

```text
Question Service
      ↓
AI / Embedding Service
      ↓
AI Provider
```

Controllers should remain focused on handling HTTP requests and responses.

Services should contain application and business logic.

Models should handle database operations.

---

# Frontend Guidelines

Keep frontend responsibilities separated:

```text
Page / Component
       ↓
Frontend Service
       ↓
api.js
       ↓
Axios
       ↓
Backend API
```

Use reusable components instead of duplicating the same UI across multiple pages.

Use CSS Modules for component/page-specific styling.

Keep authentication state inside `AuthContext` rather than duplicating authentication logic throughout components.

---

# Authentication

Protected functionality must use the authentication system established in Milestone 1.

```text
Login
  ↓
JWT
  ↓
Axios
  ↓
Authentication Middleware
  ↓
Protected API
```

Do not bypass authentication when implementing protected question, answer, or AI functionality.

---

# Git Guidelines

Make **small, focused commits**.

Each commit should represent one meaningful change.

Good examples:

```text
Add question model
Add question creation endpoint
Add question service
Add semantic search service
Add answer creation endpoint
Add Draft Coach integration
Update dashboard question list
```

Avoid vague commit messages such as:

```text
update stuff
changes
fix things
work
```

Do not use `feat:` or other conventional prefixes in commit messages.

Keep each commit easy to understand and review.

---

# Pull Requests

Before opening a pull request:

* Test the affected functionality.
* Make sure the application still runs.
* Check for console/server errors.
* Review your changed files.
* Keep the PR focused on the assigned task.
* Do not commit `.env` files or secrets.
* Do not commit `node_modules`.

When possible, explain:

```text
What changed
Why it changed
How it was tested
```

---

# Working on Milestone 2

When implementing a Milestone 2 task, follow the complete flow:

```text
User Action
    ↓
React Page / Component
    ↓
Frontend Service
    ↓
Axios + JWT
    ↓
Express Route
    ↓
Controller
    ↓
Service
    ↓
Model / AI Service
    ↓
MySQL / AI Provider
    ↓
Response
    ↓
React UI
```

For semantic search:

```text
Search Query
    ↓
Embedding
    ↓
Vector
    ↓
Similarity Calculation
    ↓
Rank Results
    ↓
Similar Questions
```

For AI assistance:

```text
User Content
    ↓
Backend
    ↓
AI Service
    ↓
AI Provider
    ↓
Feedback / Evaluation
    ↓
Frontend
```

---

# General Contribution Principles

Keep the project:

* **Modular** — each file should have a clear responsibility.
* **Readable** — prefer simple and understandable code.
* **Secure** — protect authentication and sensitive information.
* **Consistent** — follow the existing project structure and naming conventions.
* **Testable** — verify changes before committing.
* **Collaborative** — avoid unnecessary changes to other contributors' work.

> **Build small, understand the flow, commit clearly, and keep the architecture clean.**
