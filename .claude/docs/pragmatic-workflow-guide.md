# Pragmatic Workflow: Usage Guide

## Overview

The pragmatic workflow gives Claude Code a structured decision-making process for every task. Instead of diving straight into code, it assesses complexity first and routes to the right approach — fast for simple things, thorough for complex ones.

### Components

| Component                    | Type            | Purpose                                                               |
| ---------------------------- | --------------- | --------------------------------------------------------------------- |
| `output-styles/pragmatic.md` | Output style    | Defines the full workflow, working style, and anti-patterns           |
| `agents/the-chief.md`        | Agent (Haiku)   | Read-only complexity assessor — scores tasks and recommends approach  |
| `skills/spec/SKILL.md`       | Skill (`/spec`) | Creates lightweight specs for complex features                        |
| `rules/conventions.md`       | Rule            | Code ownership principles (always active, regardless of output style) |

### Flow

```
Task arrives
    │
    ▼
┌─────────┐     Score 3 dimensions:
│  Assess │     Scope (1-4) + Risk (1-4) + Clarity (1-4)
└────┬────┘
     │
     ▼
┌─────────┐     3-5:  Direct fix (just do it)
│  Route  │     6-8:  Plan mode (explore → plan → align → implement)
│         │     9-12: Spec-driven (/spec → sign-off → implement)
└────┬────┘
     │
     ▼
┌─────────┐     Write code, ~30 min scoped tasks,
│ Execute │     subagents for independent subtasks
└────┬────┘
     │
     ▼
┌─────────┐     Tests + lint + typecheck pass,
│ Verify  │     atomic commits, no deferred failures
└─────────┘
```

---

## 1. Selecting the Output Style

The pragmatic output style is **opt-in**. Select it per-session or set it as default.

**Per-session:** In Claude Code, use `/config` to select "pragmatic" as your output style.

**As default:** Add to `~/.claude/settings.json`:

```json
{
  "preferences": {
    "outputStyle": "pragmatic"
  }
}
```

When no output style is selected, the code ownership rules in `conventions.md` still apply (they're rules, not style-dependent).

---

## 2. Complexity Assessment

### Manual (implicit)

When the pragmatic output style is active, Claude automatically scores every task before starting:

```
You: Add a --dry-run flag to the deploy script

Claude:
  Scope: 1/4 (one file)
  Risk: 2/4 (deploy script, but dry-run is safe)
  Clarity: 1/4 (well-defined)
  Total: 4/12 → Direct fix
```

### Delegated (explicit)

For tasks where you want an independent assessment before committing to an approach, delegate to the-chief:

```
You: I need to migrate our auth system from session-based to JWT.
     Can you assess this before we start?

Claude: [delegates to the-chief agent]

the-chief:
  ## Assessment: Migrate auth from sessions to JWT

  | Dimension | Score | Rationale |
  |-----------|-------|-----------|
  | Scope     | 4/4   | Auth middleware, all route handlers, session store, tests |
  | Risk      | 4/4   | Breaking auth = locked out users, security implications |
  | Clarity   | 2/4   | Goal is clear, implementation details need research |
  | **Total** | **10/12** | |

  **Route:** Spec-driven

  **Key files:**
  - `src/auth/middleware.ts` — current session validation
  - `src/auth/session-store.ts` — to be replaced
  - `tests/auth/` — 47 tests to update

  **Recommended approach:**
  1. Write a spec with /spec covering token format, refresh strategy, migration plan
  2. Use researcher agent to map all session-dependent code paths
  3. Implement in phases: new JWT layer → dual-mode → remove sessions

  **Agents to involve:** researcher (map blast radius), code-reviewer (validate security)
```

The-chief is Haiku-powered (cheap and fast) and read-only — it can't modify anything, just advise.

---

## 3. Writing Specs with `/spec`

For tasks scoring 9-12 (or whenever you want alignment before writing code), use the `/spec` skill.

### Basic usage

```
You: /spec Migrate authentication from session-based to JWT tokens
```

This creates `specs/001-migrate-auth-to-jwt.md` at the project root:

```markdown
# 001: Migrate Authentication to JWT

## Problem

Our session-based auth stores tokens server-side, creating scaling issues
and complicating our move to a stateless API. JWT tokens allow stateless
auth that works across services.

## Acceptance criteria

- [ ] All endpoints accept JWT bearer tokens
- [ ] Refresh token rotation with 7-day expiry
- [ ] Existing sessions migrated transparently (no forced logout)
- [ ] Session store removed after migration period

## Technical approach

Add a new JWT middleware alongside the existing session middleware.
Run both in parallel for 2 weeks (dual-mode), then remove sessions.
Use RS256 signing with key rotation support.

## Tasks

1. Define JWT payload schema and signing config — `src/auth/jwt.ts`
2. Create JWT middleware with dual-mode support — `src/auth/middleware.ts`
3. Add token refresh endpoint — `src/api/routes/auth.ts`
4. Migrate login/logout to issue JWTs — `src/api/routes/auth.ts`
5. Update all auth tests for JWT — `tests/auth/`
6. Add migration script for active sessions — `scripts/migrate-sessions.ts`
7. Remove session store and dual-mode code — `src/auth/session-store.ts`

## Open questions

- Do we need to support API keys alongside JWT for service-to-service calls?
- What's the refresh token storage strategy (httpOnly cookie vs response body)?
```

### Auto-numbering

Specs auto-increment. If `specs/` has `001-initial-setup.md` and `002-add-caching.md`, the next spec will be `003-*.md`.

### After writing a spec

1. Review it — edit the acceptance criteria and tasks until they match your intent
2. Resolve open questions
3. Start implementation from task 1 (each task is scoped to ~30 min)

---

## 4. The Scoring System

### Dimensions

| Dimension   | 1                | 2                         | 3                  | 4                                   |
| ----------- | ---------------- | ------------------------- | ------------------ | ----------------------------------- |
| **Scope**   | One function     | One module / a few files  | Multiple modules   | Cross-cutting / system-wide         |
| **Risk**    | Cosmetic / local | Breaks a feature          | Breaks a service   | Data loss / security / breaking API |
| **Clarity** | Exact spec given | Clear goal, some unknowns | Vague requirements | "Make it better" / needs research   |

### Routes

| Score    | Route       | What happens                                                           |
| -------- | ----------- | ---------------------------------------------------------------------- |
| **3-5**  | Direct fix  | Just do it. No ceremony.                                               |
| **6-8**  | Plan mode   | Explore the codebase, draft a plan, get your sign-off, then implement. |
| **9-12** | Spec-driven | Write a spec with `/spec`, get sign-off, then implement task-by-task.  |

### Examples

| Task                                | Scope | Risk | Clarity | Total | Route  |
| ----------------------------------- | ----- | ---- | ------- | ----- | ------ |
| Fix typo in README                  | 1     | 1    | 1       | 3     | Direct |
| Add --dry-run flag to deploy script | 1     | 2    | 1       | 4     | Direct |
| Refactor API error handling         | 2     | 2    | 2       | 6     | Plan   |
| Add rate limiting to all endpoints  | 3     | 3    | 2       | 8     | Plan   |
| Migrate auth system to JWT          | 4     | 4    | 2       | 10    | Spec   |
| "Improve the codebase"              | 4     | 3    | 4       | 11    | Spec   |

---

## 5. Code Ownership

These rules apply **always** — regardless of output style selection:

- **You touch it, you own it.** If Claude modifies a function, it's responsible for its tests, lint compliance, and docs.
- **No deferred failures.** Test failures aren't dismissed as "pre-existing". They're investigated or explicitly flagged.
- **No TODO-as-implementation.** Either implement it now or note it as a known gap with rationale — never `// TODO: implement this` and move on.

---

## 6. Tips

### Override the routing

The complexity score is a recommendation, not a mandate. You can always override:

```
You: I know this scores low, but I want a spec for it anyway.
You: Skip the plan, just make the change.
You: This is complex but I already know exactly what I want — direct fix.
```

### Combine with existing agents

The workflow integrates with the agents you already have:

| Agent           | When the workflow uses it                      |
| --------------- | ---------------------------------------------- |
| `the-chief`     | Explicit complexity assessment before starting |
| `researcher`    | Exploration phase of plan mode (6-8)           |
| `debugger`      | When a verify step reveals a bug               |
| `code-reviewer` | Post-implementation quality check              |

### Keep specs lightweight

Specs are alignment tools, not documentation. If a spec exceeds 60 lines, the task is scoped too broadly — split it into multiple specs. The goal is to get on the same page quickly, not to write an RFC.
