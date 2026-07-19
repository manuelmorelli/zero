# ZERO

Documento: 00_AI_DEVELOPMENT_RULES

Versione: 1.0

Stato:
APPROVATO

Ultimo aggiornamento:
19/07/2026

---

# AI Development Rules

## Purpose

This document defines the mandatory development rules that every AI must follow while working on the Zero project.

This document is the single source of truth for development practices.

Every AI must follow these rules before generating, modifying or deleting code.

---

# Project Philosophy

Zero is built around quality, maintainability and scalability.

Speed is important, but code quality always comes first.

Every implementation must be production-ready.

---

# General Principles

- Never modify unrelated files.
- Never introduce breaking changes without necessity.
- Preserve the existing architecture.
- Prefer simple solutions.
- Avoid unnecessary complexity.
- Prefer reusable code.
- Keep files clean and readable.
- Write code that another developer can immediately understand.
- Never duplicate business logic.
- Separate UI from business logic.
- Every component should have a single responsibility.

---

# Tech Stack

Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Better Auth

Validation

- Zod
- React Hook Form

Storage

- Cloudflare R2

Payments

- Stripe

Email

- Resend

---

# Project Structure

app/

Application routing.

components/

Reusable UI components.

components/landing/

Landing Page components.

components/ui/

Shared UI components.

components/layout/

Layout components.

components/common/

Reusable generic components.

components/journey/

Journey-related components.

docs/

Official project documentation.

hooks/

Reusable React hooks.

lib/

Utilities and helper functions.

prisma/

Database schema and migrations.

public/

Images, icons and static assets.

types/

Shared TypeScript types.

prompts/

Reusable prompts for AI development.

---

# Component Rules

Components must:

- be reusable
- be independent
- receive data through props
- avoid unnecessary state
- avoid duplicated styling

Never create huge components.

Split complex interfaces into multiple smaller components.

---

# Styling Rules

Use Tailwind CSS.

Avoid inline styles.

Prefer utility classes.

Keep spacing consistent.

Use semantic colors.

Mobile First.

---

# Naming Conventions

Components

PascalCase

Example

Hero.tsx

JourneyCard.tsx

Files

PascalCase for React components.

camelCase for utilities.

Folders

lowercase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

---

# Code Quality

Always:

- remove unused imports
- remove dead code
- avoid duplicated logic
- avoid magic numbers
- keep functions small

---

# Git Rules

Every completed feature must be committed.

Commit messages should be meaningful.

Examples:

feat: landing hero

feat: navbar

fix: responsive hero

docs: update project context

refactor: journey cards

---

# Documentation Rules

Whenever one of the following changes:

- architecture
- product decisions
- folder structure
- design system
- business rules
- database
- authentication
- APIs

the AI must remind the developer to update the official documentation.

Documentation is as important as code.

---

# AI Behaviour

Before writing code the AI should:

1. Understand the task.

2. Check whether reusable components already exist.

3. Follow the existing architecture.

4. Modify only what is necessary.

5. Produce production-ready code.

---

# Final Rule

The objective is not to generate code.

The objective is to build a maintainable product that can continue evolving for many years.

Every AI working on Zero must treat this document as mandatory.