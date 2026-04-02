---
name: spec
description: Create a lightweight spec for a feature or complex task. Use when complexity score is 9-12 or when a task needs alignment before implementation.
---

Create a lightweight spec for the following task:

$ARGUMENTS

## Instructions

1. **Create the specs directory** if it doesn't exist at the project root.

2. **Auto-number the spec:**
   - Scan `specs/` for existing files matching `NNN-*.md`
   - Find the highest number and increment by 1
   - If no specs exist, start at 001
   - Generate a short kebab-case slug from the task description

3. **Write `specs/NNN-slug.md`** with this structure:

```markdown
# NNN: Title

## Problem

What problem does this solve? Why now? (2-3 sentences)

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

## Technical approach

How will this be built? Key decisions and trade-offs. (1-2 paragraphs)

## Tasks

Each task should be completable in ~30 minutes:

1. Task description — `relevant/file.ext`
2. Task description — `relevant/file.ext`
3. ...

## Open questions

- Question 1
- Question 2
```

4. **Keep the spec under 60 lines.** Specs are alignment tools, not documentation. If you need more detail, the spec is scoped too broadly — suggest splitting.

5. **After writing, suggest next steps:**
   - Review and refine the spec with the user
   - Resolve open questions
   - Begin implementation starting with task 1
