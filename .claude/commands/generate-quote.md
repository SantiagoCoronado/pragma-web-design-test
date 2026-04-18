# /generate-quote

Generate a bespoke AI-customized quote from a specification file.

## Usage

```
/generate-quote path/to/spec.md
```

## What This Does

Transforms a Markdown specification file into a complete, production-ready quote:
1. Parses the spec's frontmatter and content
2. Generates a 10-character lowercase ID (`[a-z0-9]{10}`) — URLs are case-sensitive in some chat apps, so IDs stay lowercase
3. Creates two React components: `QuoteContent.tsx` (web) and `QuotePDF.tsx` (PDF export)
4. Updates `src/generated-quotes/registry.ts` to register the new components
5. Inserts a quote row into the database
6. Outputs the client-facing and admin URLs

## Spec File Format

Create a `.md` file with YAML frontmatter:

```yaml
---
client_name: "Acme Corp"
client_email: "contact@acme.com"
client_company: "Acme Corporation"
title: "AI-Powered Texas BBQ Ordering System"
currency: "USD"
locale: "en"
valid_until: "2026-05-16"
---

# Quote Content (Markdown)

Your custom content here. This becomes the bespoke quote layout.
```

### Required Frontmatter Fields
- `client_name` (string)
- `client_email` (string)
- `title` (string)
- `client_company` (string, optional)
- `currency` (USD, EUR, MXN, COP; default: MXN)
- `locale` (en, es; default: en)
- `valid_until` (ISO date; default: empty)

### Content Section
Everything after the frontmatter is parsed as markdown and becomes the basis for component design. The generated components will have bespoke layouts—not generic renderers—based on the content structure.

## Component Generation Strategy

### QuoteContent.tsx
- **Client Component** (`"use client"`)
- Named export: `export const QuoteContent = ({ quote }: { quote: Quote }) => ...`
- Tailwind 4 styling with Pragma design tokens:
  - Colors: `bg-pragma-bg`, `text-pragma-accent`, `border-pragma-border`
  - Typography: `font-display` (Space Grotesk), `font-body`
  - Spacing: Generous whitespace, Pragma-proportioned padding/margins
- Layout is **bespoke to the content**: pricing tables, deliverable cards, visual timelines, feature comparisons—custom to the quote's unique structure
- **Never** include header, nav, locale switcher, or action buttons (those come from `AiQuoteShell`)
- Render `quote.rawContent` and any other quote fields as appropriate for the design

### QuotePDF.tsx
- **Server-side only** (never imported into client bundle)
- Named export: `export const QuotePDF = ({ quote }: { quote: Quote }) => ...`
- Uses `@react-pdf/renderer` primitives:
  - `Document`, `Page`, `View`, `Text`, `StyleSheet`
- Hex colors directly (no CSS variables in PDF; use exact RGB values like `#00f0ff` for cyan)
- Mirrors the web layout structure as PDF primitives
- Font names compatible with react-pdf (e.g., `"Helvetica"`, `"Times-Roman"`)

## Implementation Steps

1. **Parse the spec file**
   - Read the `.md` file path from the command
   - Extract frontmatter (title, client name, email, company, currency, locale, valid_until)
   - Extract body content (raw markdown)

2. **Generate ID**
   - Create a 10-character ID using the lowercase alphabet `[a-z0-9]` — must match `/^[a-z0-9]{10}$/` (e.g., `xk9mp2qr4s`)
   - Use `quoteId()` from `src/shared/lib/ids.ts` when generating from code; for hand-picked IDs, keep them lowercase + digits only

3. **Create directory structure**
   - `mkdir -p src/generated-quotes/Quote_[id]/`

4. **Generate QuoteContent.tsx**
   - Analyze the markdown content to determine the best layout strategy
   - Decide: Is this a pricing table? A timeline? A feature list? A custom proposal?
   - Design a bespoke React component that renders `quote` and displays the content visually
   - Use Pragma's design system: dark theme, Space Grotesk headings, cyan accent (#00f0ff)
   - Export as named `QuoteContent`

5. **Generate QuotePDF.tsx**
   - Create a parallel PDF version using `@react-pdf/renderer`
   - Match the web layout's visual hierarchy
   - Use readable font sizes and hex colors
   - Ensure printability and professionalism
   - Export as named `QuotePDF`

6. **Update registry.ts**
   - Read `src/generated-quotes/registry.ts`
   - Add two new import statements at the top:
     ```ts
     import { QuoteContent as QuoteContent_[id] } from "./Quote_[id]/QuoteContent";
     import { QuotePDF as QuotePDF_[id] } from "./Quote_[id]/QuotePDF";
     ```
   - Add entry to `quoteRegistry`:
     ```ts
     '[id]': { QuoteContent: QuoteContent_[id], QuotePDF: QuotePDF_[id] }
     ```
   - Never remove existing entries

7. **Insert database row**
   - Run: `npm run create-quote -- --id [id] --file [spec_path]`
   - Passes the spec file's frontmatter and content to the DB
   - Prints success with client and admin URLs

8. **Output summary**
   ```
   ✓ Generated [client_name] quote
   ID: [id]
   Client URL: http://localhost:3000/[locale]/quote/[id]
   Admin URL: http://localhost:3000/[locale]/admin/quotes/[id]
   
   Files created:
     - src/generated-quotes/Quote_[id]/QuoteContent.tsx
     - src/generated-quotes/Quote_[id]/QuotePDF.tsx
   
   Registry updated:
     - src/generated-quotes/registry.ts
   
   Database row inserted with type: ai-generated
   
   Next steps:
     git add src/generated-quotes/
     git commit -m "feat: add AI-generated quote [id]"
     git push
     vercel deploy  (or wait for auto-deploy)
   ```

## Design Guidelines

### Pragma Design System
- **Dark theme**: `#0a0e27` background, white/cyan text
- **Accent color**: Cyan `#00f0ff`
- **Typography**: Space Grotesk for headings, system font for body
- **Spacing**: 1rem, 1.5rem, 2rem, 3rem increments
- **Borders**: Subtle, low contrast (`border-opacity-20`)

### Component Patterns
- **Section cards**: Contained with subtle borders, rounded corners
- **Typography hierarchy**: h1 → h2 → h3, clear visual levels
- **Call-to-action**: Cyan background, hover effects with Framer Motion
- **Lists**: Checkmarks, icons, or simple bullets
- **Tables**: Alternating row colors, sticky headers for PDFs

### Do's and Don'ts
✓ Read the markdown content carefully—the layout should reflect the quote's unique structure  
✓ Use Pragma's brand colors and typography  
✓ Make generous use of whitespace  
✓ Ensure the PDF version is printable and professional  
✗ Don't include header/nav/footer (those come from AiQuoteShell)  
✗ Don't use dynamic imports or client-only features in the PDF component  
✗ Don't hardcode client names or dynamic data as static styles (use the `quote` prop)  

## Example: Texas Ribs BBQ Ordering System

**Spec file:**
```yaml
---
client_name: "Texas Ribs Inc"
client_email: "owner@texasribs.com"
client_company: "Texas Ribs"
title: "AI-Powered BBQ Ordering System"
currency: "USD"
locale: "en"
valid_until: "2026-05-16"
---

# Overview

We propose an AI-powered ordering system that learns customer preferences and predicts demand.

## Deliverables

1. **Menu Recommendation Engine**
   - Train on historical orders
   - Personalized suggestions per customer

2. **Demand Forecasting**
   - Predict ribs/brisket demand by day
   - Auto-trigger prep schedules

3. **Mobile App**
   - iOS/Android ordering interface
   - Real-time status updates
```

**Generated component** would show:
- Hero with title + company name
- 3 deliverable cards with icons
- Pricing section
- Timeline
- Terms & valid_until

---

## Troubleshooting

**"Registry not found"** → The quote exists in the DB but hasn't been registered. Run `git add src/generated-quotes/ && git commit && git push` then redeploy.

**"Component not rendering"** → Check that `QuoteContent` is marked `"use client"` and exports correctly.

**"PDF empty"** → Verify `QuotePDF` uses `@react-pdf/renderer` primitives, not HTML/React elements.

---

Use this skill to generate unlimited bespoke quotes without writing new DB migrations or UI components. Each quote is a hand-crafted React component, committed to the codebase and deployed to production.
