# AGENTS.md

## Project Overview

This repository is an English learning platform designed for small English classes.

The project is currently in the **foundation/setup phase**.

The current priority is to establish a clean, maintainable, production-oriented engineering foundation before implementing product features.

### Current Stack

#### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- ESLint

#### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2
- Alembic

#### Database

- Supabase
  - PostgreSQL
  - Authentication
  - Storage
  - Realtime

#### Testing

- Vitest
- Testing Library
- Playwright
- pytest

#### Infrastructure

- Docker
- Docker Compose

---

# 1. General Engineering Rules

## Core Principles

- Prefer simple solutions over clever solutions.
- Do not over-engineer.
- Do not introduce infrastructure without a concrete requirement.
- Keep business logic explicit and testable.
- Favor composition over inheritance.
- Keep modules focused on one responsibility.
- Avoid premature abstractions.
- Do not create abstractions simply because they "might be useful later".
- Do not duplicate business logic.
- Do not silently change existing behavior.
- Before modifying existing code, understand its purpose and dependencies.
- Prefer readable code over highly optimized code unless performance is an actual problem.
- Do not add dependencies unless the dependency provides clear value.

## Before Implementing

Before making significant changes:

1. Inspect the existing project structure.
2. Check existing conventions.
3. Reuse existing utilities and components where appropriate.
4. Identify the smallest change that solves the problem.
5. Consider whether the change affects API contracts, database schema, authentication, or existing tests.

Do not rewrite working code merely to match personal preferences.

---

# 2. Repository Structure

Use a clear separation between frontend and backend.

```text
/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   └── tests/
│
├── docker-compose.yml
├── AGENTS.md
├── README.md
└── .gitignore
```

Do not mix frontend and backend implementation.

---

# 3. Next.js Rules

## General

Use the **Next.js App Router**.

Prefer Server Components by default.

Use Client Components only when the component actually requires:

- React state
- browser APIs
- event handlers
- effects
- client-side libraries

Do not add `"use client"` unnecessarily.

## Routing

Keep route organization predictable.

Use route groups when they improve organization without affecting URLs.

Example:

```text
app/
├── (marketing)/
├── (auth)/
└── (dashboard)/
```

Do not create deeply nested routes without a real domain reason.

## Create and Edit Forms

Use a modal (shadcn/ui `Dialog`) for create and edit forms, triggered from the list or detail page that owns the data.

Do not give create/edit actions their own route (e.g. `/things/new`) unless the form is genuinely long or multi-step.

The form component itself stays route-agnostic: it takes an `onSuccess` callback instead of calling `router.push`/`router.refresh` directly, so the same form works standalone or inside a dialog. The dialog wrapper owns the open state and navigation/refresh after success.

## Server vs Client

Default:

```text
Server Component
```

Use:

```text
"use client"
```

only when necessary.

Do not turn entire pages into Client Components just because one child component needs interactivity.

Instead:

```text
Server Page
    ↓
Interactive Client Component
```

Keep the client boundary as small as possible.

## Data Fetching

Do not scatter API calls directly across UI components.

Centralize API communication in:

```text
frontend/lib/
```

or appropriate feature-specific API modules.

Use TanStack Query for client-side server state when needed.

Do not use global React state for server state.

## Loading and Error States

Every asynchronous UI should consider:

- loading
- success
- empty
- error

Use Next.js `loading.tsx` and `error.tsx` where appropriate.

## Metadata

Use Next.js metadata APIs.

Do not manually manipulate `<head>` unless necessary.

---

# 4. TypeScript Rules

Enable strict TypeScript.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## No `any`

Avoid `any`.

Do not use:

```ts
const data: any = ...
```

Prefer:

```ts
const data: SomeType = ...
```

If external data is unknown:

```ts
const data: unknown = ...
```

Then validate or narrow it.

## Types

Prefer meaningful domain types.

Bad:

```ts
type Data = {
  id: string;
  value: string;
};
```

Better:

```ts
type VocabularyItem = {
  id: string;
  word: string;
};
```

## Interfaces vs Types

Use either consistently.

Prefer `type` for:

- unions
- aliases
- component props
- API response shapes

Use `interface` when declaration merging or object-oriented extension is genuinely useful.

Do not argue about this stylistically in code reviews.

## Enums

Prefer string unions when an enum does not provide meaningful runtime behavior.

```ts
type UserRole = "teacher" | "student";
```

instead of:

```ts
enum UserRole {
  TEACHER = "teacher",
  STUDENT = "student",
}
```

## Nullability

Do not hide nullable values with unsafe assertions.

Avoid:

```ts
user!.name;
```

Prefer explicit handling:

```ts
if (!user) {
  return;
}
```

## Type Assertions

Minimize:

```ts
as SomeType
```

A type assertion should not be used to silence TypeScript.

If data is coming from an external boundary, validate it.

---

# 5. React Rules

## Components

Components should have one clear responsibility.

Avoid giant components.

If a component becomes difficult to understand, extract meaningful subcomponents.

Do not extract every three lines into a component.

## Props

Keep props explicit.

Avoid passing large objects when only a few fields are required.

Prefer:

```tsx
<UserCard name={user.name} avatar={user.avatar} />
```

over unnecessarily passing the entire user object.

## State

Use local state for local UI state.

Examples:

- modal open/close
- selected tab
- input value
- temporary UI state

Use server-state tools for server data.

Do not create a global store unless there is a demonstrated need.

---

# 6. Styling Rules

Use Tailwind CSS.

Use shadcn/ui for reusable UI primitives.

Do not introduce another component library without a strong reason.

Avoid excessive custom CSS.

Prefer design-system consistency over one-off styling.

Do not hardcode arbitrary colors throughout components.

Use semantic design tokens where available.

Keep responsive behavior intentional.

Test important layouts at:

- mobile
- tablet
- desktop

---

# 7. Forms and Validation

Use:

- React Hook Form
- Zod

for complex forms.

Frontend validation improves UX.

However:

> Frontend validation is never a security boundary.

The backend must validate all external input independently.

Do not assume a request is valid because Zod accepted it.

---

# 8. API Rules

The frontend must communicate with the backend through defined API boundaries.

Do not access PostgreSQL directly from the browser.

Do not put database logic inside Next.js UI components.

Keep API routes and backend services separated from presentation.

API responses should have predictable structures.

Example:

```json
{
  "data": {},
  "error": null
}
```

or another consistent project-wide convention.

Do not invent a new response structure for every endpoint.

---

# 9. FastAPI Rules

Keep route handlers thin.

Bad:

```python
@router.post("/...")
async def create(...):
    # validation
    # database queries
    # business logic
    # calculations
    # response formatting
```

Prefer:

```text
Route
  ↓
Service
  ↓
Repository / Database
```

when the domain complexity actually requires these layers.

Do not create services and repositories for trivial endpoints just to satisfy a pattern.

## Pydantic

Use Pydantic schemas at API boundaries.

Do not return raw SQLAlchemy models directly from API endpoints.

Separate:

```text
Request schema
Response schema
Database model
```

when their responsibilities differ.

## Dependency Injection

Use FastAPI dependencies for:

- database sessions
- authentication
- authorization
- shared request context

Do not create global mutable state for request-specific data.

---

# 10. Python Rules

Use modern Python.

Prefer:

```python
def get_user(user_id: UUID) -> User:
    ...
```

over untyped functions.

Use type hints consistently.

Avoid:

```python
from typing import Any
```

unless genuinely necessary.

Use `ruff` for linting and formatting.

Keep functions focused.

Avoid deeply nested conditionals.

Prefer early returns where they improve readability.

Do not catch exceptions without handling them meaningfully.

Bad:

```python
try:
    ...
except Exception:
    pass
```

Never silently swallow errors.

---

# 11. SQLAlchemy Rules

Use SQLAlchemy 2.x style.

Do not put raw SQL inside random service functions.

Keep database access organized.

Use transactions deliberately.

Do not commit from multiple layers of the same operation.

Prefer:

```text
Service
  ↓
Repository / Session
  ↓
Commit
```

with a clear transaction boundary.

Do not expose database models directly as API contracts.

---

# 12. PostgreSQL Rules

PostgreSQL is the source of truth for relational application data.

Use appropriate:

- primary keys
- foreign keys
- unique constraints
- indexes
- NOT NULL constraints

Do not rely entirely on application-level validation for data integrity.

If a constraint must always be true, enforce it in the database where appropriate.

Examples:

```text
email uniqueness
foreign key relationships
required fields
unique classroom codes
```

Do not add indexes without a query/use-case justification.

---

# 13. Alembic Rules

All schema changes must go through Alembic migrations.

Never manually modify production schema.

Migration files should be:

- deterministic
- reviewable
- reversible where practical

Before creating a migration, inspect the existing schema.

Do not repeatedly generate migrations until Alembic happens to produce the desired result.

---

# 14. Authentication and Security

Security-sensitive logic belongs on the backend.

Never trust:

- user IDs from the client
- roles from the client
- submitted scores
- permissions from the client
- frontend validation

Authorization must be checked server-side.

Never expose:

- database credentials
- API secrets
- private keys
- service-role keys

to the browser.

Only variables explicitly intended for browser use may use:

```text
NEXT_PUBLIC_
```

Do not log passwords, tokens, API keys, or sensitive personal information.

---

# 15. Testing Rules

Testing should protect behavior, not implementation details.

## Backend

Use pytest.

Prioritize:

- API behavior
- business logic
- validation
- authorization
- database behavior

## Frontend

Use Vitest and Testing Library.

Test:

- user-visible behavior
- important interactions
- validation
- error states

Avoid testing implementation details.

## E2E

Use Playwright for critical user journeys.

Do not create an E2E test for every component.

A small number of high-value E2E tests are preferable.

---

# 16. Error Handling

Errors should be explicit and useful.

Frontend:

- show meaningful user-facing errors
- do not expose internal stack traces

Backend:

- log unexpected errors
- return safe API responses
- use appropriate HTTP status codes

Do not use HTTP 200 for every failure.

---

# 17. Logging

Logs should help diagnose problems.

Include useful context such as:

```text
request ID
endpoint
operation
error type
```

Do not log secrets.

Do not log full authentication tokens.

Do not dump entire request bodies unless there is a specific debugging reason.

---

# 18. Environment Configuration

Use:

```text
.env
.env.example
```

`.env` must never be committed.

`.env.example` must contain variable names without real secrets.

When adding a new environment variable:

1. Add it to `.env.example`.
2. Document it in the README.
3. Add it to the appropriate configuration layer.

---

# 19. Dependencies

Before adding a dependency, ask:

1. Do we actually need it?
2. Can the existing stack solve the problem?
3. Is the dependency actively maintained?
4. Does it significantly increase complexity?

Do not install libraries for trivial functionality.

---

# 20. Git Rules

Use small, focused commits.

Prefer:

```text
feat: add health endpoint
fix: handle invalid database connection
refactor: extract API client
test: add classroom API tests
```

Avoid:

```text
update stuff
changes
final
fix
```

Do not commit:

- `.env`
- secrets
- build artifacts
- local databases
- dependency caches

---

# 21. Definition of Done

A change is not complete merely because the code compiles.

Before considering work complete:

1. Code follows existing architecture.
2. TypeScript passes.
3. ESLint passes.
4. Ruff passes.
5. Tests pass.
6. Database migrations work if schema changes were made.
7. No secrets are committed.
8. API contracts are consistent.
9. Error handling is considered.
10. The implementation is no more complex than necessary.

When something fails, fix the underlying problem rather than suppressing the error.

---

# 22. Agent Behavior

When working on this repository:

- Inspect before modifying.
- Ask for clarification when requirements genuinely conflict.
- Do not invent product requirements.
- Do not implement unspecified features.
- Do not replace existing architecture without justification.
- Do not silently add dependencies.
- Do not over-engineer for hypothetical scale.
- Explain important architectural tradeoffs.
- Prefer incremental changes.
- Verify changes with tests and tooling.

The goal is not to generate the most code.

The goal is to build a codebase that remains easy to understand and extend.

# 23. Approval Before Changes

The agent must **always ask for user approval before making changes** that go beyond the explicitly approved task.

## Approval is required before:

- Creating new product features not explicitly requested.
- Changing the project architecture.
- Adding new dependencies.
- Adding new infrastructure or services.
- Changing database schema or creating migrations.
- Changing authentication or authorization behavior.
- Introducing a new design pattern or abstraction.
- Refactoring existing code that is outside the current task.
- Removing or replacing existing functionality.
- Changing configuration that affects development, deployment, or security.
- Making large-scale file or directory restructuring.
- Implementing a follow-up phase that was not explicitly approved.

## Approval is NOT required for:

- Changes explicitly requested in the current task.
- Necessary implementation details required to complete the approved task.
- Fixing an obvious error directly caused by the current change.
- Formatting/linting changes required by the project's existing tooling, provided they do not alter behavior.
- Running tests, type checking, linting, migrations, or other verification commands.

## When Requirements Are Ambiguous

Do not guess.

If multiple reasonable implementations exist and the choice materially affects architecture, dependencies, data models, UX, or maintainability:

1. Stop before making the consequential change.
2. Explain the available options briefly.
3. Recommend one option with a reason.
4. Ask for approval.
5. Wait for the user's response.

Example:

> I found two reasonable approaches:
>
> **A.** Use Supabase Realtime — simpler and appropriate for small classes.
>
> **B.** Build a dedicated WebSocket layer — more control but unnecessary complexity at this stage.
>
> I recommend A.
>
> **Approve A?**

Do not proceed until the user approves.

## Scope Expansion

If completing the current task reveals additional work that is useful but not necessary, do not automatically implement it.

Instead report:

> I found an additional issue that is outside the current scope: `<issue>`.
>
> I recommend `<solution>`.
>
> Should I implement it?

Wait for approval.

## Architectural Decisions

Before making a consequential architectural decision, present:

```text
Decision:
Why it matters:
Options:
Recommendation:
Tradeoffs:
Approval required: Yes
```

Do not silently make architectural decisions on behalf of the user.

## Principle

**The agent executes approved decisions; it does not expand the project's scope on its own.**

When uncertain whether a change requires approval, assume that it does.
