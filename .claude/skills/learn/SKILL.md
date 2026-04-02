---
name: learn
description: Reflect on completed work and capture reusable patterns as new skills, updated best practices, or new rules. Run this after completing a task to make the next agent smarter. This is how the swarm self-improves.
---

Reflect on the work just completed and capture learnings.

$ARGUMENTS

## Instructions

### Step 1: Analyze what was done

Look at the recent git commits, changes, and task session log. Identify:

1. **Patterns**: Did you use an approach that could be templated? (e.g., "adding a new GORM model with migration" is a repeatable pattern)
2. **Best practices discovered**: Did you learn something about the tech stack that future agents should know?
3. **Pitfalls hit**: Did you make a mistake that could be prevented?
4. **Missing tooling**: Did you wish a skill/command existed that doesn't?

### Step 2: Decide what to capture

For each finding, decide the right artifact:

| Finding | Artifact | Location |
|---------|----------|----------|
| Reusable multi-step workflow | New skill | `~/.claude/skills/<name>/SKILL.md` |
| Technology pattern or rule | Best practice update | `Claude/Knowledge/best-practices/<tech>.md` |
| Project-specific gotcha | Project rule | Append to project CLAUDE.md |
| Domain insight | Knowledge base entry | `Claude/Knowledge/<domain>-<topic>.md` |
| Dangerous pattern to avoid | Rule | `~/.claude/rules/<name>.md` |
| Quick reference command | Command | `~/.claude/commands/<name>.md` |

### Step 3: Create or update artifacts

**Creating a new skill:**
```markdown
---
name: <kebab-case-name>
description: <one line — what triggers this skill and what it does>
---

<Skill instructions — what the agent should do step by step>
```

Write to `~/.claude/skills/<name>/SKILL.md`. The skill is immediately available to all future agents.

**Updating best practices:**
Read the existing file, append new entries under the appropriate section. Don't duplicate. Add a `## Project-Specific` or `## Discovered` section for learnings from actual work (vs. generic advice).

**Creating a rule:**
```markdown
# <Rule Name>

<When this rule applies and what to do>
```

Write to `~/.claude/rules/<name>.md`.

### Step 4: Log what was learned

Append to the task's session log:
```
## Learnings Captured
- Created skill: <name> — <why>
- Updated best practice: <tech> — <what was added>
- Added rule: <name> — <what it prevents>
```

### Step 5: Verify artifacts

For any new skill created:
- Confirm the SKILL.md is valid (has frontmatter with name + description)
- The description is specific enough to trigger correctly
- The instructions are clear enough for a cold-start agent to follow

## When to run

The orchestrator calls `/learn` after every completed task, but only captures artifacts when there's something worth capturing. Most tasks won't produce new skills — that's fine. The system improves gradually.

## Philosophy

Every agent stands on the shoulders of all previous agents. What you learn today makes tomorrow's agents faster and more accurate. The best practices file for Go should be better after 100 Go tasks than after 1. Skills should accumulate for common workflows. The knowledge base should grow richer over time.

**This is the flywheel**: more tasks → more knowledge → better agents → faster tasks → more tasks.
