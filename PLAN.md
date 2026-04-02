# PRAGMA - Tech/AI Solutions Agency Website

## Context
Build a bilingual (EN/ES) website for PRAGMA, a Tech/AI Solutions Agency that also builds websites and provides UI/UX consulting. The core differentiator is a built-in quote system where the agency creates quotes that clients view via shareable links and can download as PDFs. The architecture must be a solid, extensible skeleton that can accommodate unforeseen future features. UX inspired by [quartux.com/en](https://quartux.com/en).

---

## Step 0: Project Setup & Dotfiles

Clone dotfiles from `https://github.com/Mourey/dotfiles/tree/main/claude` into the project, **excluding** anything nvim-related:

**Include:**
- `settings.json` (remove `"preferredEditor": "nvim"` and tmux references)
- `CHEATSHEET.md`
- `rules/` (all: agent-defaults, quality-gates, security, conventions, etc.)
- `commands/` (all)
- `hooks/` (all Python hooks + utils/)
- `skills/` (all)
- `agents/` (all)
- `scripts/` (all)
- `docs/` (all)
- `output-styles/` (all)
- `mcp-servers/` (all)

**Exclude:**
- `root-claude.md` (Obsidian-specific orchestrator, not relevant)
- Any nvim settings reference in `settings.json`

Place these under `.claude/` in the project root so they're available for development workflows.

---

## Step 1: Foundation & Dependencies

### Initialize project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Dependencies (security-vetted)

Only well-established, widely-audited packages:

| Package | Weekly Downloads | Purpose | Why safe |
|---------|-----------------|---------|----------|
| `next-intl` | 800K+ | i18n for App Router | Maintained by Vercel ecosystem contributor, tiny surface |
| `nanoid` | 40M+ | Short unique IDs for quote URLs | Tiny, no deps, audited |
| `@react-pdf/renderer` | 500K+ | PDF generation | No native deps, pure JS, no Chromium |
| `zod` | 15M+ | Input validation | Zero deps, type-safe |
| `lucide-react` | 5M+ | Icons | Tree-shakeable, no runtime deps |
| `framer-motion` | 5M+ | Animations (Quartux-style scroll effects) | Industry standard, Meta/Vercel backed |

**NO** packages with: native bindings, post-install scripts, small maintainer base, or excessive transitive dependencies.

**Database**: Use **Turso** (`@libsql/client`, 200K+ downloads, backed by ChiselStrike/Turso Inc.) — free tier, SQLite-compatible, no native deps, works on serverless. For local dev, Turso provides a local embedded mode. This avoids `better-sqlite3` which has native C bindings (potential attack surface).

```bash
npm install next-intl nanoid @react-pdf/renderer zod lucide-react framer-motion @libsql/client
```

**Post-install**: Run `npm audit` and verify no post-install scripts ran unexpectedly.

---

## Step 2: Architecture (Extensible Skeleton)

### Design Principles
- **Modular by default**: Each feature is a self-contained module (components + actions + types)
- **Convention over configuration**: New pages auto-inherit i18n, auth, and layout
- **Feature folders**: Group related code by domain, not by technical layer
- **Server-first**: Default to Server Components, use `'use client'` only when needed
- **Type-safe boundaries**: Zod schemas at every data entry point

### File Structure
```
pragma-web/
├── .claude/                          # Dotfiles from repo (dev tooling)
│   ├── settings.json
│   ├── rules/, commands/, hooks/, skills/, agents/, etc.
├── public/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx            # Root layout: fonts, theme, next-intl provider
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── quote/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Public quote viewer
│   │   │   └── admin/
│   │   │       ├── layout.tsx        # Auth gate
│   │   │       ├── page.tsx          # Dashboard
│   │   │       └── quotes/
│   │   │           ├── new/page.tsx
│   │   │           └── [id]/edit/page.tsx
│   │   ├── api/
│   │   │   └── quote/[id]/pdf/
│   │   │       └── route.ts          # PDF generation endpoint
│   │   └── layout.tsx                # Outermost layout (minimal)
│   │
│   ├── features/                     # ← EXTENSIBLE: each feature is self-contained
│   │   ├── landing/
│   │   │   ├── components/           # Hero, Services, About, CaseStudies, Contact
│   │   │   └── data/                 # Static content (services list, case studies)
│   │   ├── quotes/
│   │   │   ├── components/           # QuoteViewer, QuoteForm, QuotePdf, QuoteTable
│   │   │   ├── actions/              # Server Actions (CRUD)
│   │   │   ├── lib/                  # Data access, validation schemas
│   │   │   └── types/                # Quote, LineItem interfaces
│   │   └── auth/
│   │       ├── components/           # LoginForm
│   │       └── lib/                  # Auth helpers, session management
│   │
│   ├── shared/                       # Cross-feature utilities
│   │   ├── components/ui/            # Button, Card, Input, Badge, GlowEffect
│   │   ├── components/layout/        # Navbar, Footer, LanguageToggle
│   │   ├── hooks/                    # useMediaQuery, useScrollPosition, etc.
│   │   ├── lib/                      # db.ts, constants, helpers
│   │   └── types/                    # Shared TypeScript types
│   │
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── messages/
│       ├── en.json
│       └── es.json
│
├── middleware.ts                      # next-intl locale routing
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

**Why `features/` pattern**: Adding a new feature (e.g., blog, client portal, invoicing) means creating a new folder under `features/` with its own components, actions, and types — no touching existing code. This is the extensibility the user asked for.

---

## Step 3: Visual Design (Quartux-Inspired Dark & Techy)

### UX Patterns from Quartux
- **Full-viewport sections** that create cinematic scroll progression
- **Progressive disclosure**: Problem → Solution → Proof → CTA narrative flow
- **Metrics/social proof** early in the page (projects delivered, clients, etc.)
- **Persistent dark navbar** that stays accessible while scrolling
- **Smooth scroll animations** using Framer Motion (intersection observer triggers)
- **Accent color pops** against dark backgrounds for CTAs and highlights

### Tailwind Theme
```
Colors:
  bg:        #0a0a0f (near-black)
  surface:   #12121a (cards)
  border:    #1e1e2e (subtle borders)
  accent:    #00f0ff (cyan neon — primary)
  accent-2:  #7c3aed (purple — secondary)
  accent-3:  #00ff88 (green — success)
  text:      #e4e4e7 (primary text)
  muted:     #71717a (secondary text)

Fonts:
  display:   Space Grotesk (headings)
  sans:      Inter (body)
  mono:      JetBrains Mono (tech accents)

Effects:
  Glow on hover: box-shadow with neon colors
  Dot-grid background on hero
  Backdrop blur on cards
  Scroll-triggered fade/slide animations
```

---

## Step 4: Landing Page Sections

### Section Flow (Quartux-inspired narrative)
1. **Hero** — Full viewport, animated gradient mesh, headline + subtitle + CTA
2. **Services** — 6-card grid with icons and glow hover:
   - AI Consulting & Strategy
   - Custom AI Solutions
   - Process Automation
   - Data Analytics & BI
   - **Web Development**
   - **UI/UX Consulting**
3. **About / Why PRAGMA** — Split layout, key differentiators, stats bar (projects, clients, years)
4. **Case Studies** — Cards with project image, description, tech badges
5. **Testimonials** — Client quotes with company/role attribution
6. **Contact** — Form (name, email, company, message) + direct contact info

---

## Step 5: Quote System

### Data Model
```typescript
Quote {
  id: string (nanoid)
  clientName, clientEmail, clientCompany
  title, description
  lineItems: { id, description, quantity, unitPrice }[]
  currency: 'USD' | 'EUR' | 'MXN' | 'COP'
  discount?: number (percentage)
  notes?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  validUntil?: string (ISO date)
  locale: 'en' | 'es'
  createdAt, updatedAt
}
```

### Database: Turso (LibSQL)
- Single `quotes` table, `line_items` stored as JSON column
- `@libsql/client` for both local dev (embedded) and production (hosted)
- Free tier: 9GB storage, 25M row reads/month — more than enough
- **Migration path**: Turso is SQLite-compatible, so migrating to self-hosted SQLite, PostgreSQL, or any other DB is straightforward

### Admin Auth (MVP)
- `ADMIN_PASSWORD` env var → cookie-based session
- Admin layout checks cookie, redirects to login if absent
- Sufficient for 1-2 admin users; upgrade to NextAuth later if needed

### PDF Generation
- `@react-pdf/renderer` with React-like components (no Chromium)
- API route at `/api/quote/[id]/pdf` generates and streams PDF
- Branded with PRAGMA logo, colors, footer

### Quote UI Design — Client-Facing View (`/[locale]/quote/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│  ▪ PRAGMA logo                          [EN | ES]  (toggle) │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Status Badge ──────────────────────────────────────┐    │
│  │  ● Sent / Draft / Accepted / Rejected               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  QUOTE TITLE (large, Space Grotesk, cyan accent underline)  │
│  Quote #V1StGXR8_Z  ·  April 1, 2026  ·  Valid until: ...  │
│                                                             │
│  ┌─ Client Details Card ───────────────────────────────┐    │
│  │  bg-pragma-surface, rounded-xl, subtle border       │    │
│  │                                                     │    │
│  │  Prepared for:                                      │    │
│  │  ██ Client Name        Company Name                 │    │
│  │  ██ client@email.com                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Line Items Table ──────────────────────────────────┐    │
│  │  bg-pragma-surface/50, backdrop-blur                │    │
│  │                                                     │    │
│  │  DESCRIPTION          QTY    UNIT PRICE    TOTAL    │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  AI Chatbot Dev        1     $5,000.00    $5,000    │    │
│  │  Training & Docs       1     $1,500.00    $1,500    │    │
│  │  Monthly Support       3     $  800.00    $2,400    │    │
│  │                                                     │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │                           Subtotal:      $8,900.00  │    │
│  │                           Discount (10%): -$890.00  │    │
│  │                     ┌─────────────────────────────┐ │    │
│  │                     │  TOTAL:  $8,010.00 MXN      │ │    │
│  │                     │  (cyan glow border, bold)    │ │    │
│  │                     └─────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Notes / Terms Card ────────────────────────────────┐    │
│  │  italic muted text, bg-pragma-surface               │    │
│  │  "Payment terms: 50% upfront, 50% on delivery..."  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │ ⬇ Download   │  │  ✓ Accept Quote (green glow)     │    │
│  │    PDF       │  │    (updates status to accepted)   │    │
│  │ (secondary)  │  └──────────────────────────────────┘    │
│  └──────────────┘                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PRAGMA · ai@pragma.agency · +52 ...                        │
│  Powered by PRAGMA                                          │
└─────────────────────────────────────────────────────────────┘
```

**Design details:**
- **Background**: `bg-pragma-bg` with subtle dot-grid pattern
- **Cards**: `bg-pragma-surface/50 backdrop-blur-sm border border-pragma-border rounded-xl p-6`
- **Table rows**: Alternate subtle opacity for readability, no harsh lines
- **Total row**: Highlighted with `border border-pragma-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]`
- **Status badge**: Color-coded pill — gray (draft), blue (sent), green (accepted), red (rejected)
- **CTA buttons**: Primary "Accept Quote" with green glow, secondary "Download PDF" with outline style
- **Currency formatting**: Locale-aware (MXN uses `$`, USD uses `$`, EUR uses `€`, COP uses `$`)
- **Responsive**: Stacks vertically on mobile, table becomes card-list below 640px
- **Animation**: Sections fade-in on load with staggered timing (Framer Motion)

### Quote UI Design — Admin Creation Form

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Panel  ·  New Quote                    [Save Draft]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Client Info ───────────────────────────────────────┐    │
│  │  [Name________]  [Email_________]  [Company______]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Quote Details ─────────────────────────────────────┐    │
│  │  [Title________________]  [Currency: MXN ▼]         │    │
│  │  [Description (textarea)_______________]            │    │
│  │  [Valid until: 📅 _____]  [Locale: EN ▼]            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Line Items ────────────────────────────────────────┐    │
│  │  Description          Qty    Price     Total    [x] │    │
│  │  [_______________]    [__]   [______]  $0.00    [x] │    │
│  │  [_______________]    [__]   [______]  $0.00    [x] │    │
│  │                                                     │    │
│  │  [+ Add Line Item]                                  │    │
│  │                                                     │    │
│  │  Discount: [___]%                                   │    │
│  │                            Subtotal:   $0.00        │    │
│  │                            Discount:  -$0.00        │    │
│  │                            TOTAL:      $0.00        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Notes ─────────────────────────────────────────────┐    │
│  │  [Terms & conditions textarea_______________]       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Preview]  [Save as Draft]  [Save & Get Shareable Link]   │
└─────────────────────────────────────────────────────────────┘
```

**Admin UX details:**
- **Live totals**: Quantity × Price auto-calculates per row, subtotal/discount/total update in real-time
- **Dynamic rows**: "Add Line Item" appends a new row, [x] removes it
- **Preview**: Opens the client-facing view in a modal/new tab before saving
- **Save & Get Link**: Saves quote, copies shareable URL to clipboard, shows toast confirmation
- **Form validation**: Zod schemas, inline error messages below fields
- **Keyboard friendly**: Tab between fields, Enter to add new row

---

## Step 6: Backend & Hosting Strategy

**Priority**: Easy, affordable, portable.

| Option | Cost | Portability | Effort |
|--------|------|-------------|--------|
| **Vercel + Turso (Recommended)** | Free tier for both | Turso DB exportable as SQLite file; Next.js runs anywhere | Minimal |
| Railway | $5/mo | Docker-based, runs anywhere | Low |
| Fly.io | $0-5/mo | Docker-based, global edge | Low |
| Self-hosted VPS | $5-10/mo | Full control | Medium |

**Recommendation**: Start with **Vercel (free) + Turso (free)**. If you outgrow it or want to migrate:
- Export Turso DB as a SQLite file
- Deploy the Next.js app as a Docker container to any provider
- Swap `@libsql/client` connection string — no code changes needed

---

## Implementation Order

### Phase 1: Setup (Foundation)
1. Initialize Next.js project
2. Copy dotfiles from GitHub repo (excluding nvim)
3. Install vetted dependencies
4. Configure Tailwind theme (colors, fonts, animations)
5. Set up next-intl (routing, middleware, EN/ES messages)
6. Build root layout, Navbar with LanguageToggle, Footer
7. Run `npm audit` to verify dependency security

### Phase 2: Landing Page
1. Hero section with gradient background + Framer Motion animations
2. Services grid (6 cards including Web Dev & UI/UX)
3. About section with stats bar
4. Case Studies cards (placeholder data)
5. Contact form with Server Action
6. Responsive testing + both locale testing

### Phase 3: Quote Backend
1. Turso database setup + schema initialization
2. Zod validation schemas for quote data
3. Data access layer (CRUD in `features/quotes/lib/`)
4. Server Actions (`features/quotes/actions/`)
5. Admin auth (cookie-based, `features/auth/`)

### Phase 4: Quote Frontend
1. Admin login page
2. Admin dashboard with quote table
3. Quote creation form (dynamic line items, auto-totals, currency selector)
4. Quote edit page
5. Public quote viewer (`/[locale]/quote/[id]`)
6. "Copy Link" clipboard + status badges

### Phase 5: PDF & Polish
1. QuotePdfDocument component with PRAGMA branding
2. PDF API route
3. SEO metadata, sitemap, `noindex` on quote pages
4. Scroll animations (Framer Motion intersection triggers)
5. Final responsive testing
6. Deploy to Vercel + connect Turso

---

## Verification
1. `npm audit` — zero critical/high vulnerabilities
2. `npm run dev` — landing page renders at `/en` and `/es`
3. Language toggle switches all text correctly
4. Login at `/en/admin` with env password
5. Create a quote with 3+ line items, discount, and notes
6. Copy shareable link → open in incognito → quote displays correctly
7. "Download PDF" → branded PDF with correct data
8. Mobile responsive at 375px, 768px, 1024px viewports
9. `npm run build` — no errors, no warnings
10. Deploy to Vercel — all routes work in production
