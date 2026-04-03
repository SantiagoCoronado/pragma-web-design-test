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
| `node scripts/hash-password.mjs <pw>` | Generate bcrypt hash for ADMIN_PASSWORD_HASH |

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

### E2E tests (optional)

| Variable | Description |
|---|---|
| `E2E_ADMIN_PASSWORD` | Plain-text admin password used by Playwright to log in during E2E tests. Only needed locally for running `npm run test:e2e`. |
| `PLAYWRIGHT_BASE_URL` | Override the base URL for E2E tests. Defaults to `http://localhost:3000`. |

---

## Deployment

### Prerequisites

- [Vercel account](https://vercel.com) (free tier is fine)
- [Turso account](https://turso.tech) (free tier: 500MB, plenty for this)
- [Turso CLI](https://docs.turso.tech/cli/installation): `brew install tursodatabase/tap/turso`

---

### Step 1 — Provision the Turso production database

Run these commands once. Copy the output values — you'll need them for Vercel.

```bash
# Log in
turso auth login

# Create the production database
turso db create pragma-web-prod

# Get the database URL (copy the value under "URL")
turso db show pragma-web-prod

# Create an auth token (copy the full token string)
turso db tokens create pragma-web-prod
```

The schema is applied automatically on first run — no migration step needed.

---

### Step 2 — Generate the admin password hash

```bash
node scripts/hash-password.mjs <your-chosen-password>
# Outputs something like: $2b$12$...
# Copy this — you'll paste it as ADMIN_PASSWORD_HASH in Vercel
```

---

### Step 3 — Deploy to Vercel

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# From the project root — follow the prompts
# Link to your GitHub repo when asked, select the SantiagoCoronado/pragma-web repo
vercel

# Or deploy directly to production
vercel --prod
```

Alternatively: go to [vercel.com/new](https://vercel.com/new), import from GitHub, and follow the UI.

---

### Step 4 — Set environment variables on Vercel

Run each command and paste the value when prompted:

```bash
vercel env add DATABASE_URL production
# paste: libsql://pragma-web-prod.turso.io  (from Step 1)

vercel env add DATABASE_AUTH_TOKEN production
# paste: your Turso auth token  (from Step 1)

vercel env add ADMIN_PASSWORD_HASH production
# paste: $2b$12$...  (from Step 2)

vercel env add NEXT_PUBLIC_APP_URL production
# paste: https://pragma.agency  (your actual domain)
```

Then trigger a fresh deployment to pick up the new vars:

```bash
vercel --prod
```

---

### Step 5 — Connect your domain (optional)

In the Vercel dashboard → your project → Settings → Domains, add `pragma.agency` and follow the DNS instructions.

---

### Step 6 — Production smoke test checklist

After deploying, verify manually:

- [ ] `https://pragma.agency/en` — landing page loads, all sections visible
- [ ] `https://pragma.agency/es` — Spanish version loads
- [ ] `https://pragma.agency/sitemap.xml` — returns XML with `/en` and `/es`
- [ ] `https://pragma.agency/robots.txt` — disallows `/en/admin/`, `/en/quote/`
- [ ] `https://pragma.agency/en/admin` — login form appears
- [ ] Admin login works with your password
- [ ] Create a new quote, save as draft
- [ ] Copy shareable link → open in a new incognito tab → quote renders
- [ ] Download PDF → file opens, looks correct
- [ ] `https://pragma.agency/en/admin` shows noindex in page source

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

Both types generate a branded PDF with the PRAGMA logo and footer.

### Auth

Single-admin password auth using bcrypt. Session stored in an `httpOnly` cookie (`SameSite: Lax`, 24h). Rate-limited to 5 login attempts per IP per 15 minutes. CSRF handled by Next.js Server Actions (Origin header validation).
