# Claude Code Cheatsheet

Quick reference for setting up and configuring Claude Code. Share this with your team.

---

## Directory structure

```
your-project/
├── CLAUDE.md                    # Team instructions (committed)
├── CLAUDE.local.md              # Personal overrides (gitignored)
└── .claude/
    ├── settings.json            # Permissions + config (committed)
    ├── settings.local.json      # Personal overrides (gitignored)
    ├── commands/                 # Custom slash commands
    ├── rules/                   # Modular instruction files
    ├── skills/                  # Auto-invoked workflows
    └── agents/                  # Specialized subagent personas

~/.claude/                       # Global (all projects)
├── CLAUDE.md                    # Personal global instructions
├── settings.json                # Global settings
├── commands/                    # Personal commands
├── skills/                      # Personal skills
├── agents/                      # Personal agents
└── projects/                    # Session history + auto-memory
```

---

## CLAUDE.md template

Keep it under 200 lines. Focus on what Claude can't infer from the code.

```markdown
# Project: My App

## Commands

npm run dev # Start dev server
npm run test # Run tests
npm run lint # Lint check
npm run build # Production build

## Architecture

- Express REST API, Node 20
- PostgreSQL via Prisma ORM
- Handlers in src/handlers/
- Shared types in src/types/

## Conventions

- Use zod for request validation
- Return shape: { data, error }
- Never expose stack traces to clients
- Use the logger module, not console.log

## Watch out for

- Tests use a real DB, not mocks. Run `npm run db:test:reset` first
- Strict TypeScript: no unused imports
```

---

## settings.json template

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(make *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git branch *)",
      "Read",
      "Write",
      "Edit",
      "MultiEdit",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)",
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  }
}
```

**allow** = runs without asking. **deny** = blocked entirely. Everything else = Claude asks first.

---

## Custom commands template

File: `.claude/commands/review.md` -> becomes `/project:review`

```markdown
---
description: Review current branch diff before merging
---

## Changes

!`git diff --name-only main...HEAD`

## Diff

!`git diff main...HEAD`

Review for:

1. Code quality issues
2. Security vulnerabilities
3. Missing test coverage
4. Performance concerns

Give specific, actionable feedback per file.
```

### With arguments

File: `.claude/commands/fix-issue.md` -> `/project:fix-issue 234`

```markdown
---
description: Investigate and fix a GitHub issue
argument-hint: [issue-number]
---

Look at issue #$ARGUMENTS in this repo.

!`gh issue view $ARGUMENTS`

Find the root cause, fix it, and write a test that would have caught it.
```

---

## Skills template

File: `.claude/skills/security-review/SKILL.md`

Skills are auto-invoked when the task matches the description.

```markdown
---
name: security-review
description: Security audit. Use when reviewing code for vulnerabilities,
  before deployments, or when the user mentions security concerns.
allowed-tools: Read, Grep, Glob
---

Analyze the codebase for:

1. SQL injection and XSS risks
2. Exposed credentials or secrets
3. Insecure configurations
4. Authentication and authorization gaps

Report findings with severity ratings and remediation steps.
Reference @DETAILED_GUIDE.md for standards.
```

**Key:** Skills can bundle supporting files (referenced with `@filename`). Commands are single files.

---

## Agents template

File: `.claude/agents/code-reviewer.md`

Agents are spawned as isolated subagents with their own context window.

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use PROACTIVELY when reviewing PRs,
  checking for bugs, or validating implementations before merging.
model: sonnet
tools: Read, Grep, Glob
---

You are a senior code reviewer focused on correctness and maintainability.

When reviewing code:

- Flag bugs, not style issues
- Suggest specific fixes, not vague improvements
- Check edge cases and error handling
- Note performance concerns only when they matter at scale
```

**model:** Use `haiku` for fast read-only tasks, `sonnet` for balanced work, `opus` for complex reasoning.
**tools:** Restrict to what the agent actually needs. Read-only agents don't need Write/Edit.

---

## Rules template (path-scoped)

File: `.claude/rules/api-conventions.md`

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/handlers/**/*.ts"
---

# API Design Rules

- All handlers return { data, error } shape
- Use zod for request body validation
- Never expose internal error details to clients
- Log errors with request ID for tracing
```

Rules without `paths:` frontmatter load every session. Rules with `paths:` only load when Claude works on matching files.

---

## Hooks template

Hooks in `settings.json` run shell commands on tool events.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "your-validation-script.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write '**/*.{ts,tsx}' --log-level silent 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Purr.aiff 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Events:** `PreToolUse` (validate/block), `PostToolUse` (format/lint), `Stop` (notify).
**Exit code 2** from PreToolUse = block the tool call.

---

## MCP servers

MCP (Model Context Protocol) connects Claude to external tools and services. Configure in `.claude/settings.json` or project-level `.mcp.json`.

### In settings.json (global)

```json
{
  "servers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

### In .mcp.json (project-level, committed)

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```

### Server types

| Type | Use case | Example |
|------|----------|---------|
| `stdio` | Local process, communicates via stdin/stdout | Most npm-based servers |
| `sse` | Remote server, Server-Sent Events | Self-hosted services |
| `http` | Remote server, HTTP streaming | Cloud-hosted APIs |

### Popular MCP servers

```
@modelcontextprotocol/server-github      # GitHub issues, PRs, repos
@modelcontextprotocol/server-postgres    # PostgreSQL queries
@modelcontextprotocol/server-filesystem  # Scoped file access
@modelcontextprotocol/server-brave-search # Web search
@modelcontextprotocol/server-memory      # Persistent key-value memory
@anthropic/mcp-server-fetch              # Fetch web content
```

### Tips

- Put tokens in `env` inside the server config, NOT in shell environment
- Use `.mcp.json` for project-specific servers (DB, APIs). Use `settings.json` for global ones (GitHub, search).
- Test with `claude mcp list` to see active servers
- Use `claude mcp add <name>` for interactive setup

---

## Getting started (5 steps)

1. **Run `/init`** in Claude Code. It generates a starter CLAUDE.md. Edit it down to essentials.
2. **Add `.claude/settings.json`** with allow/deny rules for your stack. At minimum: allow run commands, deny .env reads.
3. **Create 1-2 commands** for workflows you repeat. Code review and issue fixing are good starters.
4. **Split CLAUDE.md into `.claude/rules/`** once it gets crowded. Scope rules by path where it makes sense.
5. **Add `~/.claude/CLAUDE.md`** with personal preferences that apply across all projects.

That covers 95% of use cases. Add skills and agents when you have recurring complex workflows worth packaging.

---

## Best practices

- **CLAUDE.md is highest leverage.** Get that right first. Everything else is optimization.
- **Keep CLAUDE.md under 200 lines.** Longer files eat context and reduce instruction adherence.
- **Don't duplicate linter/formatter rules.** Claude reads your eslintrc and prettier config already.
- **Use `CLAUDE.local.md` for personal quirks.** It's auto-gitignored.
- **Path-scope your rules.** API rules shouldn't load when editing React components.
- **Restrict agent tools.** A security auditor doesn't need Write access.
- **Use cheaper models for simple agents.** Haiku handles read-only exploration well.
- **Treat .claude/ like infrastructure.** Set it up once, refine as you go, it pays dividends daily.

---

## Ecosystem tools

These tools extend Claude Code beyond the CLI. They're installed globally and available in every project.

### Security layer

#### parry-guard — Prompt injection scanner

Scans every tool call, tool output, and user prompt for injection attacks using 6 detection layers: unicode anomalies, known injection phrases, leaked secrets regex, ML classification (DeBERTa v3), bash AST analysis, and cross-language script detection.

**Why it matters:** Files you read, web content you fetch, and tool outputs can contain hidden instructions that hijack Claude's behavior. parry-guard catches these before they execute.

**How it works:** Wired as the FIRST hook in PreToolUse, PostToolUse, and UserPromptSubmit — runs before logging or security guards. Requires `HF_TOKEN` env var for ML layers (set in `~/.zshrc.local`).

```
# No manual usage needed — runs automatically on every tool call
# Check hook output for "[parry]" entries to see it working
```

#### Dippy — Smart command auto-approval

Parses bash commands using a hand-written AST parser to determine if they're safe. Auto-approves harmless commands (ls, cat, git status, grep) while still prompting for destructive ones. Supports 34+ CLI tools.

**Why it matters:** Eliminates permission fatigue. Without Dippy, Claude asks permission for every `ls` and `cat`. With it, safe commands fly through while dangerous ones still get flagged.

**How it works:** Wired as a PreToolUse hook matching only `Bash` commands. Runs AFTER parry-guard and the security guards.

```
# No manual usage — auto-approves safe Bash commands
# Per-project overrides: create .dippy config file in project root
```

---

### Monitoring & history

#### claude-monitor — Usage/cost dashboard

Real-time terminal dashboard showing token consumption, burn rate, cost estimates, and ML-powered predictions for when you'll hit usage limits.

**Why it matters:** Without this, you're flying blind on API spend. See exactly how fast you're burning through tokens and whether you'll hit limits.

```bash
ccm                           # Launch dashboard (alias)
claude-monitor --theme dark   # Same thing, explicit
claude-monitor --plan pro     # Set your plan tier for accurate limits
```

**Tip:** Run in a dedicated tmux pane. It updates in real-time.

#### cchistory — Claude's shell command history

Claude Code doesn't add its commands to your normal shell history. cchistory extracts every shell command Claude executed across all projects.

**Why it matters:** "What did Claude run earlier?" — now you can answer that. Audit commands, replay them, or learn from Claude's approach.

```bash
cch                           # Current project's command history
cchistory --global            # All projects
cchistory --list-projects     # Show available projects
cchistory ~/code/my-app       # Query specific project
cch | grep "docker"           # Filter for specific commands
cch | tail -20                # Last 20 commands
```

#### recall — Full-text session search + resume

Search your entire Claude Code conversation history with a fuzzy-finding TUI. Find that one session where you solved a tricky bug, then resume it instantly with full context.

**Why it matters:** Claude sessions are disposable by default. recall makes them a searchable knowledge base. Find past solutions, resume abandoned work, or pick up where you left off.

```bash
rcl                           # Launch interactive TUI (alias)
recall                        # Same thing
```

**Controls:** `↑/↓` navigate, `Enter` resume session, `Ctrl+E` expand preview, type to search.

---

### Session & agent management

#### Claude Squad — Multi-agent tmux orchestrator

Terminal UI for running multiple Claude Code agents simultaneously. Each agent gets its own tmux session and git worktree, so they can work on different branches in parallel without conflicts.

**Why it matters:** Agent teams are great but invisible. Claude Squad gives you a dashboard to see all running agents, their status, and switch between them. Git worktrees mean no merge conflicts between parallel agents.

```bash
csq                           # Launch Claude Squad TUI (alias)
claude-squad                  # Same thing
```

**Requires:** tmux, gh (GitHub CLI)

#### claude-tmux — Tmux popup session manager

Lightweight popup inside tmux showing all active Claude Code sessions with live status indicators (● processing, ○ idle, ◐ waiting for input).

**Why it matters:** Quick session switching without leaving tmux. See at a glance which sessions need your attention.

```
prefix + C-c                  # Open claude-tmux popup (C-a, then Ctrl+c)
```

**Controls:** `j/k` navigate, `Enter` switch to session, `n` new session, `K` kill, `r` rename, `/` filter.

---

### Code quality & security

#### Trail of Bits Security Skills — Professional vulnerability detection

30+ security-focused skills from Trail of Bits (one of the world's top security firms). Covers code auditing, supply chain risk, smart contract security, malware analysis, and more.

**Why it matters:** The built-in code-reviewer agent does basic security checks. Trail of Bits skills bring professional-grade vulnerability detection patterns used in real security audits.

```
/plugin menu                  # Browse available skills
```

**Domains:** Code auditing (CodeQL/Semgrep), supply chain risk, smart contracts, YARA rules, reverse engineering, mobile security, Kubernetes debugging.

#### rules-doctor — Dead rules detector

Scans your `.claude/rules/` files and validates that glob patterns in `paths:` frontmatter actually match existing files. Catches "dead rules" that load but do nothing.

**Why it matters:** Path-scoped rules silently stop working when you rename directories or refactor file structure. rules-doctor catches this drift.

```bash
rules-doctor check --root ~          # Check all rules
rules-doctor check --verbose         # Show matched files
rules-doctor check --root . --ci     # CI mode (exits 1 if dead rules)
```

**Also runs automatically** via the `/sync` command.

---

### Workflow plugins

#### Compound Engineering — Structured development workflow

24 specialized agents, 13 slash commands, 11 skills. Built around the principle "each unit of work makes the next easier" — structured planning, execution, and review with knowledge capture.

**Why it matters:** Provides a complete development methodology with dedicated commands for each phase of work. The `/ce:compound` command captures learnings so future sessions benefit from past work.

```
/ce:ideate                    # Surface improvements and ideas
/ce:brainstorm                # Explore requirements
/ce:plan                      # Create detailed implementation strategy
/ce:work                      # Execute with task tracking
/ce:review                    # Multi-agent code review
/ce:compound                  # Document learnings for future sessions
```

#### Context Engineering Kit — Minimal-token context optimization

12+ modular plugins for advanced context engineering. Each loads independently with no redundancy, designed for minimal token footprint.

**Why it matters:** Better context = better Claude output. The Reflexion plugin adds auto-reflection hooks that critique and improve responses. SDD (Spec-Driven Development) transforms specs into structured plans before writing code.

**Core plugins:**
- **Reflexion** — Auto-reflection with critique/insight memory
- **SDD** — Spec-driven development (spec → plan → code)
- **Code Review** — Security, bug-hunting, QA specialist agents
- **TDD** — Test-driven development with anti-pattern detection
- **Kaizen** — Root cause analysis methodology
- **Git** — Commit, PR, and worktree management

#### Claude Scientific Skills (K-Dense) — Research & analysis

170+ skills covering research, science, engineering, analysis, finance, and writing. One of the most comprehensive skill sets available for Claude Code.

**Why it matters:** Turns Claude into a research-grade assistant. Whether you're doing literature review, data analysis, financial modeling, or technical writing, there's likely a skill for it.

---

### Debugging & observability

#### claudia-statusline — Burn rate status line

Replaces the default status line with a Rust-powered display showing git status, context usage %, model, session duration, line changes, API costs, and **burn rate**.

**Why it matters:** The original status line showed user/dir/branch/model. claudia-statusline adds cost tracking and burn rate so you know exactly how fast you're spending.

```
# Display example:
# ~/myproject [main +2 ~1] • 45% [====------] Sonnet • 1h 23m • $3.50 ($2.54/h)
```

**Configuration:** `~/.config/claudia-statusline/config.toml` for themes and layouts. 11 themes available (Monokai, Solarized, Gruvbox, Nord, Dracula, Tokyo Night, Catppuccin, etc.).

#### claude-esp — Hidden output viewer

TUI that streams Claude Code's hidden output (thinking, tool calls, subagent activity) to a separate terminal in real-time.

**Why it matters:** Claude's internal reasoning is invisible by default. claude-esp lets you watch it think — invaluable for debugging agent behavior or understanding why it made a decision.

```bash
esp                           # Launch in separate tmux pane (alias)
claude-esp                    # Same thing
claude-esp -n                 # Skip history, new output only
claude-esp -a                 # List active sessions
claude-esp -s <ID>            # Monitor specific session
```

**Controls:** `t` toggle thinking, `a` auto-scroll, `tab` tree/stream view, `s` solo a session, `q` quit.

#### cclogviewer — Conversation visualizer

Converts JSONL conversation files into interactive HTML documents with expandable tool calls, syntax-highlighted code blocks, and token usage tracking.

**Why it matters:** Raw JSON logs are unreadable. cclogviewer turns them into browsable documents you can share or review offline.

```bash
cclogviewer -input session.jsonl -output conversation.html -open
```

---

### Database

#### read-only-postgres — Safe PostgreSQL queries

Skill that executes SELECT queries against configured PostgreSQL databases. Blocks all write operations (INSERT, UPDATE, DELETE, DROP) at both connection level (readonly=True) and query validation level.

**Why it matters:** Let Claude explore your database without risk of data mutation. PII masking, query timeouts, and row limits provide additional safety.

**Setup:** Create `~/.config/claude/read-only-postgres-connections.json` with your DB credentials (chmod 600). Skill is in `claude/skills/read-only-postgres/`.

```json
{
  "databases": [{
    "name": "app-db-dev",
    "description": "Primary app database (users, orders, events)",
    "host": "localhost", "port": 5432,
    "database": "app_dev", "user": "readonly", "password": "...",
    "pii_masking": { "users": ["email", "phone"] }
  }]
}
```

**Safety:** Read-only connection, query validation (SELECT/SHOW/EXPLAIN only), 30s timeout, 10k row limit, credential sanitization in errors, PII masking.

---

### Quick reference: aliases & keybindings

```
# Shell aliases (add to path after: source ~/.zshrc)
ccm             → claude-monitor --theme dark    # Usage dashboard
cch             → cchistory                      # Claude's shell history
csq             → claude-squad                   # Multi-agent manager
rcl             → recall                         # Session search/resume
esp             → claude-esp                     # Hidden output viewer

# Tmux keybindings
prefix + C-c    → claude-tmux popup              # Session manager popup

# Standalone tools (no alias needed)
cclogviewer     -input file.jsonl -output out.html -open
statusline      (runs automatically via settings.json)
rules-doctor    check --root ~ --verbose

# Hook pipeline (runs automatically, in order):
# 1. parry-guard  → catch injection attacks
# 2. log-hook.py  → log the tool call
# 3. pre_tool_use → block rm -rf, .env access
# 4. dippy         → auto-approve safe Bash commands (Bash only)
```

### Hook execution order

Understanding the hook pipeline helps debug issues:

```
PreToolUse (every tool call):
  ┌─ parry-guard ──→ block injection       (all tools)
  ├─ log-hook.py ──→ log to JSON           (all tools)
  ├─ pre_tool_use ─→ block rm -rf, .env    (all tools)
  └─ dippy ────────→ auto-approve safe cmd (Bash only)

PostToolUse (every tool result):
  ┌─ parry-guard ──→ scan output for injection
  ├─ log-hook.py ──→ log result
  └─ post_tool_use → log to JSON

UserPromptSubmit (every user message):
  ┌─ parry-guard ──→ scan for injection
  └─ user_prompt  ─→ validate + log
```
