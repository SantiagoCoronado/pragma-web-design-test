# PRAGMA Web — TODO

## High Priority — Landing Page Polish

- [x] Contact form server action (stores submissions in contact_submissions DB table)
- [x] Scroll-triggered Framer Motion animations (intersection observer on each section)
- [x] Upgrade AnimateIn to use scroll-driven triggers instead of mount-only fade-in
- [x] Testimonials section — fixed hydration-risk locale detection (useLocale() instead of DOM check)
- [ ] Case Studies — replace placeholder data with real projects when available

## High Priority — Quote Page Review & Dev Access

- [x] Review and polish the quote page UI/UX (layout, styling, interactions)
- [x] Seed dev database with sample quotes so the quote page is viewable during development
- [x] Add a dev-only route or script to quickly create/view test quotes without full auth flow

## High Priority — Quote System UX

- [x] "Copy Shareable Link" button after saving a quote (clipboard API)
- [x] Toast/notification system for user feedback (save success, copy confirmation, errors)
- [x] Inline form validation errors displayed below each field
- [x] Quote form "Preview" opens client-facing view in new tab before saving
- [x] Keyboard UX: Enter on last line item description adds a new row

## Medium Priority — SEO & Meta

- [ ] Per-page SEO metadata (title, description, OG tags) for landing sections
- [ ] Generate `sitemap.xml` (Next.js metadata API)
- [ ] Generate `robots.txt` (allow landing, disallow admin & quote pages)
- [ ] Structured data (JSON-LD) for organization and services

## Medium Priority — PDF & Branding

- [x] PDF branding: PRAGMA logo, theme colors, professional footer
- [ ] Verify PDF renders correctly with all currency formats
- [x] PDF filename includes client name and quote title

## Medium Priority — Responsive & Polish

- [ ] Mobile responsive audit at 375px, 768px, 1024px
- [ ] Quote line items table — card layout on mobile (< 640px)
- [ ] Navbar mobile menu polish
- [ ] Add `shared/hooks/` (useMediaQuery, useScrollPosition)
- [ ] Verify `npm run build` completes with zero errors/warnings

## Low Priority — Security Hardening

- [ ] Hash admin password (bcrypt or scrypt) instead of plain-text comparison
- [ ] Rate limiting on login endpoint
- [ ] Rate limiting on PDF generation endpoint
- [ ] CSRF protection review

## Low Priority — Testing

- [ ] Unit tests for quote calculation utilities (formatCurrency, calculateTotal)
- [ ] Integration tests for quote server actions
- [ ] E2E test: create quote -> view public link -> download PDF

## Deployment

- [ ] Set up Vercel project and connect repo
- [ ] Provision Turso production database
- [ ] Configure environment variables on Vercel (DATABASE_URL, DATABASE_AUTH_TOKEN, ADMIN_PASSWORD)
- [ ] Document required env vars in README or .env.example
- [ ] Verify all routes work in production
- [ ] Run `npm audit` — resolve any critical/high vulnerabilities

## Future Features (Out of Scope for MVP)

- [ ] Blog / content section
- [ ] Client portal with login
- [ ] Invoicing (convert accepted quotes to invoices)
- [ ] Email notifications when quote status changes
- [ ] Analytics dashboard for quote conversion rates
- [ ] NextAuth upgrade for multi-user admin
