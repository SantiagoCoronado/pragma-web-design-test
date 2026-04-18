# PRAGMA Web

Landing page + quote system for PRAGMA — AI & Technology Solutions.

Built with Next.js 16, Turso (libSQL), react-pdf, next-intl (EN/ES), Tailwind CSS v4.

---

## Local development

```bash
npm install
cp .env.sample .env.local   # fill in values (see Environment variables below)
npm run dev
```

Seed the dev database with sample quotes:

```bash
# Option 1 — HTTP endpoint (server must be running)
curl http://localhost:3000/api/dev/seed

# Option 2 — script
npm run db:seed
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit + integration tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright E2E (starts dev server automatically) |
| `npm run db:seed` | Seed dev DB with sample quotes |
| `npm run create-quote -- --id <id> --file <spec>` | Insert a quote row from a spec file |
| `node scripts/hash-password.mjs <pw>` | Generate bcrypt hash for ADMIN_PASSWORD_HASH |

---

## Creating a new quote

Two flavors: **standard quotes** (line-items / blueprint) are created through the admin UI at `/en/admin`. **Bespoke AI-generated quotes** (custom React layouts) go through the `/generate-quote` workflow below.

### Bespoke quote workflow

1. **Write a spec file** (e.g. `specs/acme-quote.md`) with YAML frontmatter:

    ```yaml
    ---
    client_name: "Acme Corp"
    client_email: "contact@acme.com"
    client_company: "Acme Corporation"
    title: "Your Project Title"
    currency: "USD"          # USD | EUR | MXN | COP
    locale: "en"             # en | es
    valid_until: "2026-05-16"
    ---

    # Overview
    ...your bespoke content as markdown...
    ```

2. **Generate the quote** from a Claude Code session in this repo:

    ```
    /generate-quote specs/acme-quote.md
    ```

    This mints a 10-char ID, creates `src/generated-quotes/Quote_[id]/QuoteContent.tsx` + `QuotePDF.tsx`, registers them in `src/generated-quotes/registry.ts`, and inserts the DB row via `npm run create-quote`.

    Quote IDs are lowercase-only (`[a-z0-9]{10}`) so shared URLs survive chat apps that lowercase paths. The DB lookup also uses `COLLATE NOCASE` as a safety net for any legacy mixed-case IDs.

3. **Verify locally**:

    ```bash
    npm run dev
    # open http://localhost:3000/en/quote/[id]
    ```

4. **Commit & deploy**:

    ```bash
    git add src/generated-quotes/ specs/
    git commit -m "feat: add quote [id] for [client]"
    git push
    ```

    Vercel auto-deploys from `main`. The DB row was written directly to Turso prod in step 2, so once the deploy completes the client URL is live.

See `.claude/commands/generate-quote.md` for the full spec, component conventions, and design-system guidelines.

---

## Environment variables

Copy `.env.sample` to `.env.local` and fill in every value before running locally or deploying.

### Database — Turso

| Variable | Description |
|---|---|
| `DATABASE_URL` | Turso database URL — format: `libsql://your-db-name.turso.io` |
| `DATABASE_AUTH_TOKEN` | Turso auth token — generate with `turso db tokens create <db-name>` |

### Admin auth

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password. **Never store the plain password.** Generate with: `node scripts/hash-password.mjs <your-password>` |

### App URL

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Full public URL of the site, no trailing slash — e.g. `https://pragma.agency`. Used for shareable quote links, sitemap, and OG metadata. |

### Email (Resend)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key — enables "Send to Client" emails and contact-form notifications. |
| `FROM_EMAIL` | Verified sender address, e.g. `quotes@pragma.agency`. |
| `ADMIN_EMAIL` | Address that receives contact-form submissions. |

### E2E tests (optional)

| Variable | Description |
|---|---|
| `E2E_ADMIN_PASSWORD` | Plain-text admin password used by Playwright to log in during E2E tests. Only needed locally for running `npm run test:e2e`. |
| `PLAYWRIGHT_BASE_URL` | Override the base URL for E2E tests. Defaults to `http://localhost:3000`. |

---

## Deployment

The project is already linked to Vercel and auto-deploys from `main`. Day-to-day flow:

```bash
git push origin main        # triggers production deploy
# or, for an out-of-band deploy:
vercel --prod
```

Environment variables are managed with the Vercel CLI:

```bash
vercel env ls
vercel env add <NAME> production
vercel env pull .env.local --yes    # sync local .env.local from Vercel
```

Admin password hash can be regenerated any time:

```bash
node scripts/hash-password.mjs <new-password>
# then: vercel env add ADMIN_PASSWORD_HASH production
```

### Smoke test checklist (after a deploy)

- [ ] `/en` and `/es` landing pages load
- [ ] `/sitemap.xml` and `/robots.txt` return the expected domain
- [ ] `/en/admin` login works
- [ ] Create a quote, copy shareable link, open in incognito — renders correctly
- [ ] Download PDF — file opens, branded correctly
- [ ] "Send to Client" delivers email (requires `RESEND_API_KEY`)

---

## Architecture

```
src/
├── app/
│   ├── [locale]/          # EN + ES routes (landing, admin, quote viewer)
│   ├── api/
│   │   ├── quote/[id]/pdf/    # PDF generation endpoint
│   │   └── dev/seed/          # Dev-only DB seeder (disabled in production)
│   ├── sitemap.ts
│   └── robots.ts
├── features/
│   ├── quotes/            # Quote form, viewer, PDF, server actions, DB queries
│   ├── landing/           # Hero, Services, About, Case Studies, Testimonials, Contact
│   └── auth/              # Login form, server action, session management
├── generated-quotes/      # Bespoke AI-generated quote components + registry
└── shared/
    ├── components/
    │   ├── layout/        # Navbar, Footer, LanguageToggle
    │   ├── ui/            # Button, Card, Badge, Input, Toaster, AnimateIn, ...
    │   └── seo/           # JsonLd
    ├── hooks/             # useMediaQuery, useScrollPosition
    └── lib/               # db.ts, rate-limit.ts
```

### Quote types

| Type | Description |
|---|---|
| `line-items` | Itemized quote with qty × price table, subtotal, discount, total |
| `blueprint` | Narrative proposal — problem, opportunity, deliverables, timeline, fixed price |
| `ai-generated` | Bespoke per-client React component rendered from a spec file (see "Creating a new quote") |

All three generate a branded PDF with the PRAGMA logo and footer.

### Auth

Single-admin password auth using bcrypt. Session stored in an `httpOnly` cookie (`SameSite: Lax`, 24h). Rate-limited to 5 login attempts per IP per 15 minutes. CSRF handled by Next.js Server Actions (Origin header validation).
