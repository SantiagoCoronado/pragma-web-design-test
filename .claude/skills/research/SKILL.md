---
name: research
description: Research domain-specific requirements, regulations, and best practices before executing a task. Automatically triggered by the orchestrator when tasks involve compliance, fiscal, legal, or domain-specific work. Stores findings in the vault knowledge base.
model: sonnet
---

Research domain requirements for a task.

$ARGUMENTS

## Instructions

### Step 1: Identify the domain

Read the task description and the project registry (`$OBSIDIAN_VAULT_PATH/Claude/Projects/`). Determine:

- **Project**: Which codebase is this for?
- **Domain**: fiscal, financial, healthcare, legal, security, etc.
- **Country/jurisdiction**: Mexico, US, EU, etc. (from project metadata)
- **Specific area**: e.g., "CFDI 4.0 cancellation flow" not just "fiscal"

### Step 2: Check existing knowledge

Read `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/` for existing research on this domain:
- If recent research exists (< 30 days old), summarize and reuse it
- If stale or missing, proceed to research

### Step 3: Research

Use WebSearch and WebFetch to research:

1. **Regulations**: Current laws, rules, and requirements that apply
2. **Technical standards**: Data formats, protocols, validation rules
3. **Best practices**: Industry patterns, recommended approaches
4. **Common pitfalls**: What goes wrong, what auditors check, edge cases
5. **Recent changes**: Any regulatory updates in the last year

For Mexican fiscal tasks specifically:
- SAT portal (sat.gob.mx) for current CFDI specs
- Complementos and addendas requirements
- RFC validation rules (both persona física and moral)
- Tax calculation rules (ISR, IVA, IEPS rates and exemptions)
- Carta Porte requirements for transport
- Contabilidad Electrónica XML formats
- PAC (Proveedor Autorizado de Certificación) integration requirements

### Step 4: Store findings

Write research to `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/<domain>-<topic>.md`:

```markdown
---
domain: fiscal
topic: cfdi-4.0-cancellation
country: Mexico
researched: 2026-03-31
sources: [sat.gob.mx, ...]
expires: 2026-06-30
---

# CFDI 4.0 Cancellation Flow

## Requirements
- ...

## Technical Implementation
- ...

## Validation Rules
- ...

## Common Pitfalls
- ...

## Sources
- [source title](url) — accessed date
```

### Step 5: Generate task context

Return a concise brief (max 500 words) that the orchestrator can inject into the task execution context:
- Key requirements that MUST be met
- Validation rules to implement
- Edge cases to test
- Regulatory constraints that affect the implementation

This brief becomes part of the task's context so the executing agent has domain awareness without needing to re-research.

## When to trigger

The orchestrator should call `/research` when:
- Task `type` is `fiscal`, `financial`, `compliance`, or `regulatory`
- Task description mentions regulations, compliance, tax, legal, or audit
- Project domains (from registry) include regulated domains AND task touches those areas
- The `domain` field in task frontmatter explicitly requests research
