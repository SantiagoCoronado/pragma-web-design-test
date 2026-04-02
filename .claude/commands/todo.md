---
description: "Manage TODO.md: list, add, done, move, clean"
argument-hint: "[add <text> | done <text> | move <text> <now|next|later> | clean]"
---
Manage the project's TODO.md file. Parse `$ARGUMENTS` to determine the subcommand.

## Find TODO.md

!`git rev-parse --show-toplevel 2>/dev/null`

Look for TODO.md at the git root. If it doesn't exist, create one with this template:

```markdown
---
project: {{infer from directory name}}
type: todo
tags: [todo]
---

# TODO

## Now

## Next

## Later

## Done
```

## Parse arguments

Arguments: `$ARGUMENTS`

**No arguments (list):** Read TODO.md and display it with item counts per section. Format:

```
## Now (3)
- [ ] Item one
- [ ] Item two
- [ ] Item three

## Next (2)
...
```

Skip the YAML frontmatter. Only show sections that have items.

**`add <text>`:** Append `- [ ] <text> (added: YYYY-MM-DD)` to the end of the **Now** section (before the next `## ` heading). Use today's date.

**`done <text>`:** Find the item whose text best matches `<text>` (case-insensitive substring match). Mark it `[x]`, append `done: YYYY-MM-DD` to the parenthetical, and move it to the **Done** section. If no match found, say so.

**`move <text> <now|next|later>`:** Find the matching item and relocate it to the target section. Preserve its checkbox state and metadata.

**`clean`:** Find all `[x]` items in Now/Next/Later sections and move them to Done. Report how many were moved.

## Rules
- Always preserve the YAML frontmatter unchanged
- Keep items in the order they appear within each section
- When moving items, append to the end of the target section
- After any mutation, show the affected item to confirm the change
- Use the Edit tool for mutations, not file rewrites
