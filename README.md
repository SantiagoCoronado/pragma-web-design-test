# PRAGMA — Design Sandbox

A lightweight clone of the PRAGMA landing page used to A/B two design directions side-by-side.
Both themes — **Deep Space** (black + cyan) and **Signal Green** (near-black + phosphor green) —
live at the same time and can be switched with the toggle in the navbar. The choice persists in
`localStorage`.

No admin, no quote viewer, no database. Just the landing page.

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000/en
```

Use the `SPACE` / `SIGNAL` toggle in the navbar to switch themes. Refresh — the choice sticks.

## Vercel — important

This repo was cloned from the production `pragma-web` project. **Never** link it to the same
Vercel project, or its Turso DB will show up in envs. Always create a new project:

```bash
rm -rf .vercel                 # wipe any stale link
npx vercel link                # when asked "Link to existing project?" answer NO
                               # project name: pragma-design-tests
npx vercel                     # preview deploy — returns a shareable URL
```

Santiago runs these steps locally. The agent never deploys on its own.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
