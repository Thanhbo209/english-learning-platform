@AGENTS.md

# Claude Code Instructions

## Project Rules

Read and follow `AGENTS.md` before making any changes.

`AGENTS.md` contains the project's authoritative engineering rules
for both frontend and backend.

## Skills

Relevant implementation knowledge is available under:

`.claude/skills/`

Before implementing a task, inspect and use the relevant skills.

Examples:

- Next.js → `.claude/skills/nextjs/`
- TypeScript → `.claude/skills/typescript/`
- FastAPI → `.claude/skills/fastapi/`
- Supabase → `.claude/skills/supabase/`
- Testing → `.claude/skills/testing/`

Do not duplicate skill documentation inside this file.

## Approval

Always ask for approval before making consequential changes that are
outside the explicitly approved task.

When requirements or architectural decisions are ambiguous:

1. Explain the options.
2. Recommend an approach.
3. Ask for approval.
4. Wait for approval.

Do not expand the scope independently.

## Completion

After completing an approved task, provide a brief completion report
following the requirements in `AGENTS.md`.
