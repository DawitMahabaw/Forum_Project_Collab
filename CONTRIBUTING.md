# Contributing to Evangadi Forum Collaboration Project

Thank you for contributing to this team project. This repository is intended for collaborative development, so clear communication and consistent workflow are important.

## How to Contribute

1. Fork or clone the repository if you are working separately.
2. Create a new branch for your task.
3. Make focused changes related to the assigned work.
4. Run the relevant checks locally before submitting your work.
5. Open a pull request with a clear description of the change.
6. Review feedback and update your branch as needed.

## Branch Naming

Use clear, descriptive branch names such as:

- `feature/authentication`
- `fix/login-validation`
- `docs/readme-update`
- `feature/question-answer-flow`

## Commit Guidelines

Use concise commit messages that describe the work performed. Examples:

- `Add JWT auth middleware`
- `Create question detail page`
- `Update README for collaboration workflow`
- `Fix MySQL connection config`

## Code Standards

- Keep changes scoped to the task.
- Avoid unrelated refactoring in the same change.
- Follow the existing project structure and naming conventions.
- Ensure the code remains readable and maintainable.
- Update documentation when behavior or setup changes.

## Environment and Setup

Before contributing:

- Install backend dependencies with `npm install` inside `backend/`
- Install frontend dependencies with `npm install` inside `frontend/`
- Configure your local environment using `.env.example` as a template
- Keep secrets local and never commit real credentials

## Pull Request Checklist

Before opening a pull request, confirm that:

- The branch is up to date with the main/default branch
- The feature or fix works locally
- No sensitive files are included in the commit
- The relevant documentation is updated if needed
- The PR has a clear summary and testing notes

## Review Expectations

All team members should:

- Be respectful and constructive in reviews
- Focus on correctness, clarity, and maintainability
- Ask questions when requirements are unclear
- Confirm that changes do not break the app flow

## Questions?

If you are unsure about a task, ask the project lead or team members before making large changes. Clear communication helps keep the project organized and prevents duplicated work.
