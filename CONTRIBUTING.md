# Contributing to TyON

Welcome! 🎉 We're glad you're interested in contributing to TyON.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Conventions](#coding-conventions)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows a simple rule: **be respectful and constructive**. Harassment and abusive behavior will not be tolerated.

## How Can I Contribute?

### 🐛 Reporting Bugs

1. Search [existing issues](https://github.com/submindd/TyON1.0/issues) first
2. Use the **Bug Report** template
3. Include: reproduction steps, expected vs actual behavior, environment details

### ✨ Suggesting Features

1. Search [existing issues](https://github.com/submindd/TyON1.0/issues) first
2. Use the **Feature Request** template
3. Include: problem statement, proposed solution, alternatives considered

### 💻 Code Contributions

1. Pick an unassigned issue or create a new one
2. Comment "I'd like to work on this" to claim it
3. Fork the repo and create a feature branch
4. Follow [Development Setup](#development-setup) to get running locally
5. Submit a PR using the PR template

## Development Setup

See the [README Installation section](https://github.com/submindd/TyON1.0#-installation) for full setup instructions.

**Quick reference:**

```bash
# Backend
cd backend
cp .env.example .env  # add your API keys
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

See the [Project Structure](https://github.com/submindd/TyON1.0#-project-structure) section in the README.

**Key entry points:**

| Layer | File | Purpose |
|:------|:-----|:--------|
| API routes | `backend/api/routes.py` | All REST endpoints |
| Orchestrator | `backend/services/report_service.py` | Pipeline + cache + DB |
| Scraping | `backend/services/scrape_service.py` | Firecrawl + seed fallback |
| LLM | `backend/services/llm_service.py` | DeepSeek analysis + strategy |
| Frontend pages | `frontend/app/` | App Router pages |
| API client | `frontend/lib/api.ts` | Backend communication |
| Types | `frontend/types/report.ts` | TypeScript interfaces |

## Coding Conventions

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use **type annotations** on all function signatures
- Use `async/await` for all I/O operations
- Use Pydantic models for all request/response schemas
- Use `logging` module (not `print`) for all logging
- Maximum line length: 120 characters

### TypeScript / React (Frontend)

- Use **TypeScript strict mode** — no `any` types
- Use named exports (avoid default exports)
- Follow the existing component pattern in `components/`
- Use Tailwind utility classes (no custom CSS unless necessary)
- Use TanStack Query for all server state

### General

- Write **self-documenting code** — variable and function names should explain their purpose
- Comment **why**, not **what** — the code explains what it does, comments explain why
- Keep PRs **focused** — one PR = one logical change
- Add **docstrings** to Python functions, **JSDoc** to exported TypeScript functions

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat` `fix` `docs` `style` `refactor` `perf` `test` `chore`

**Scopes:** `backend` `frontend` `api` `scrape` `llm` `cache` `db` `ui` `i18n` `docs`

**Examples:**
```
feat(backend): add Firecrawl search with seed data fallback
fix(llm): handle DeepSeek JSON parse errors with retry
docs(readme): add architecture diagram and API examples
perf(cache): increase Redis connection pool to 10
```

## Pull Request Process

1. Create a feature branch from `master`: `feat/my-feature` or `fix/my-fix`
2. Make your changes, following coding conventions
3. Test locally (both backend and frontend)
4. Update documentation if needed
5. Submit a PR using the PR template
6. Ensure all checklist items are checked
7. A maintainer will review within 48 hours

---

**Questions?** Open a [Discussion](https://github.com/submindd/TyON1.0/discussions) or reach out via Issues.
