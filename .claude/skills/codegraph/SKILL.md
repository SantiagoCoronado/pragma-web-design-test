---
name: codegraph
description: Generate a knowledge graph of a codebase — modules, dependencies, APIs, data flows, domain concepts. Stores the graph in the Obsidian vault for reuse by other agents. Run this on a new project before starting task work.
model: opus
---

Generate a codebase knowledge graph.

$ARGUMENTS

## Instructions

### Step 1: Identify the project

If no arguments given, use the current working directory. Otherwise, use the provided path to identify the project. Extract the project name from the path for use in naming the knowledge graph file and linking to the project registry.

### Step 2: Explore the codebase

Use the Explore agent to map:

1. **Module structure**: Top-level directories, packages, key entry points
2. **Dependencies**: External packages, internal imports between modules
3. **APIs**: HTTP endpoints, gRPC services, CLI commands, public interfaces
4. **Data models**: Database schemas, ORM models, key data structures
5. **Domain concepts**: Business entities, workflows, domain-specific terminology
6. **Services**: Service layer organization, what each service does
7. **Configuration**: Environment vars, config files, feature flags

### Step 3: Build the knowledge graph

Write the graph to `$OBSIDIAN_VAULT_PATH/Claude/Knowledge/<project-name>.md`:

```markdown
---
project: <name>
generated: <date>
modules: <count>
models: <count>
services: <count>
endpoints: <count>
---

# <Project> Knowledge Graph

## Module Map
- module_name/ — purpose (key files)
  - submodule/ — purpose

## Dependencies
### External
- package → what it's used for

### Internal (cross-module imports)
- moduleA → moduleB (why)

## Data Models
### Schema: <name>
- ModelName — purpose, key fields, relationships

## Services
- ServiceName — responsibility, key methods, domain

## API Surface
- METHOD /path — handler → service → models touched

## Domain Concepts
- Term — definition in this codebase's context

## Data Flow
- Describe key data flows (e.g., "Order creation: handler → validation → service → model → DB → event")

## Compliance / Regulatory
- List any regulatory requirements the code must satisfy
- Note which modules handle compliance logic
```

### Step 4: Link to project registry

Update the project file in `$OBSIDIAN_VAULT_PATH/Claude/Projects/<project>.md` with a link to the knowledge graph and update the `modules` count in frontmatter.

### Step 5: Summary

Report what was mapped: module count, model count, service count, key domain concepts found, any compliance areas identified. Suggest which areas need deeper exploration.
