# PRAGMA Web — TODO

## Pending — Vercel Configuration

- [ ] Set `NEXT_PUBLIC_APP_URL` on Vercel → redeploy (fixes sitemap/robots.txt domain)
- [ ] Set `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL` env vars on Vercel (enables email notifications)

## Next Up — Tier 2 Remaining

- [ ] Quote templates (save/reuse common quote structures)
- [ ] Landing page polish (next/image optimization, smooth scroll, skeleton loaders)

## Future — Tier 3

- [ ] Blog / content section (MDX, bilingual, RSS)
- [ ] Client portal with login
- [ ] Multi-user admin with roles
- [ ] Invoicing (convert accepted quotes to invoices)
- [ ] Distributed rate limiting (Upstash Redis)
- [ ] Error monitoring (Sentry)

## Completed

### Landing Page
- [x] Contact form server action (DB storage)
- [x] Scroll-triggered Framer Motion animations
- [x] AnimateIn scroll-driven triggers
- [x] Testimonials hydration fix (useLocale)
- [x] Case Studies — realistic PRAGMA projects

### Quote System
- [x] Quote page UI/UX polish
- [x] Dev database seeding + dev-only test route
- [x] "Copy Shareable Link" button
- [x] Toast/notification system
- [x] Inline form validation
- [x] Quote preview in new tab
- [x] Keyboard UX (Enter adds row)
- [x] "Send to Client" email (Resend, auto-updates status to sent)
- [x] Search, filter by status/type, pagination

### Admin
- [x] Contact submissions dashboard (/admin/contacts)
- [x] Email notifications for contact form (Resend)

### SEO & Meta
- [x] Per-page metadata (title, description, OG tags)
- [x] sitemap.xml + robots.txt
- [x] JSON-LD structured data

### PDF & Branding
- [x] PRAGMA logo, theme colors, professional footer
- [x] Currency format verification
- [x] Filename includes client name + title

### Responsive & Polish
- [x] Mobile audit (375px, 768px, 1024px)
- [x] Card layout on mobile for line items
- [x] Navbar mobile menu
- [x] shared/hooks (useMediaQuery, useScrollPosition)
- [x] Clean build (zero errors/warnings)

### Security
- [x] bcrypt password hashing + set-password script
- [x] Rate limiting (login + PDF endpoints)
- [x] CSRF protection review

### Testing
- [x] Unit tests (quote calculations, formatCurrency)
- [x] Integration tests (server actions)
- [x] E2E test (create → view → PDF)

### Observability
- [x] Vercel Analytics + Speed Insights

### Deployment
- [x] Vercel project + repo connected
- [x] Turso production database
- [x] Environment variables configured
- [x] README with env docs
- [x] Production routes verified
- [x] npm audit clean
