# Evangadi Forum Collaboration Project

This repository is a collaborative full-stack project built for the Evangadi Forum platform. The goal is to create a forum experience where users can register, sign in, ask questions, answer questions, and explore AI-enhanced knowledge features.

It is designed as a team project with clear separation between the backend API and the frontend application, making it easier to work in parallel during development.

## Overview

Evangadi Forum includes:

- User authentication and protected routes
- Question posting and listing
- Answer submission and display
- Semantic search and similar-question detection
- AI-assisted features using embeddings and retrieval-augmented generation (RAG)
- Knowledge base document upload and retrieval workflow

## Project Structure

```text
Evangadi_Forum_Collab/
├── backend/
│   ├── db/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── uploads/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
├── README.md
├── CONTRIBUTING.md
└── .git/
```

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Context API
- Framer Motion
- CSS styling

### Backend

- Node.js
- Express.js
- MySQL
- JWT authentication
- bcrypt password hashing
- REST API architecture

### AI / Knowledge Base

- Embeddings
- Semantic similarity search
- Retrieval-Augmented Generation (RAG)
- Document upload and processing flow

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ installed
- npm or another package manager
- MySQL database running locally
- A valid environment configuration file

## Environment Setup

1. Copy the sample environment file:

```bash
copy .env.example .env
```

2. Update the values in the `.env` file with your own local database credentials and secrets.

3. Keep all sensitive values private. Never commit real credentials, API keys, JWT secrets, or database passwords to the repository.

The sample variables include:

- Server port
- Database host, port, username, password, and database name
- JWT secret
- Gemini API key and model configuration

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs using the Express server entry point in `backend/index.js`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal to view the application.

## Collaboration Workflow

This project is intended for team-based collaboration. To keep work organized and consistent:

1. Create a feature branch for each task.
2. Keep commits focused and descriptive.
3. Pull the latest changes before starting work.
4. Open a pull request for review before merging.
5. Ensure the code is tested and checked for obvious issues before review.
6. Keep documentation updated when project behavior changes.

## Contribution Guidelines

For full team contribution rules, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Project Milestones

### Milestone 1: Authentication

- User registration
- User login
- JWT authentication
- Protected route handling
- Auth UI and context management

### Milestone 2: Questions and Answers

- Post questions
- List questions
- View question details
- Submit answers
- Similar question matching
- AI-assisted drafting and evaluation

### Milestone 3: Knowledge Base / RAG

- Document upload
- Text extraction and chunking
- Embeddings generation
- Semantic retrieval
- AI-grounded responses
- Document metadata and deletion support

## Team and Project Goals

This repository is meant to support a collaborative development workflow among multiple contributors. The team can work on backend APIs, frontend screens, AI features, and documentation simultaneously while keeping the project structure organized and reviewable.

## License

This project uses the ISC license as defined in the backend package configuration.

## Notes

- Keep the project environment-specific settings in local files such as `.env`.
- Do not push secrets or private data to GitHub.
- If you are adding a new feature, update documentation when necessary so the rest of the team can follow the workflow.
