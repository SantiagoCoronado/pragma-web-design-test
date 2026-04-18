/**
 * Dev database seed script.
 * Run from project root: node scripts/seed-db.mjs
 * Or via npm script: npm run db:seed
 */

import { createClient } from "@libsql/client";

const DB_URL = process.env.DATABASE_URL ?? "file:local.db";
const AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN ?? undefined;

const db = createClient({ url: DB_URL, authToken: AUTH_TOKEN });

// Simple ID generator (no deps)
const nanoid = (n = 10) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((b) => "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"[b % 64])
    .join("");

await db.execute(`
  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT DEFAULT '',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    line_items TEXT NOT NULL DEFAULT '[]',
    currency TEXT DEFAULT 'MXN',
    discount REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    valid_until TEXT DEFAULT '',
    locale TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

const SAMPLES = [
  {
    clientName: "Carlos Ramírez",
    clientEmail: "carlos@startupai.mx",
    clientCompany: "StartupAI MX",
    title: "AI Chatbot & Automation Platform",
    description:
      "Full development of a customer-facing AI chatbot integrated with WhatsApp and web, plus backend automation for lead qualification.",
    lineItems: [
      { id: nanoid(6), description: "AI Chatbot Development", quantity: 1, unitPrice: 45000 },
      { id: nanoid(6), description: "WhatsApp Business API Integration", quantity: 1, unitPrice: 12000 },
      { id: nanoid(6), description: "Lead Qualification Automation", quantity: 1, unitPrice: 18000 },
      { id: nanoid(6), description: "Training & Documentation", quantity: 1, unitPrice: 5000 },
      { id: nanoid(6), description: "Monthly Support (3 months)", quantity: 3, unitPrice: 4500 },
    ],
    currency: "MXN",
    discount: 10,
    notes: "Pago: 50% al inicio, 50% al entregable final.\nTiempo estimado: 6 semanas.",
    status: "sent",
    validUntil: "2026-04-30",
    locale: "es",
  },
  {
    clientName: "Sarah Johnson",
    clientEmail: "sarah@databridge.io",
    clientCompany: "DataBridge Analytics",
    title: "Custom BI Dashboard & Data Pipeline",
    description:
      "ETL pipeline from 3 sources, custom dashboards in React, and weekly automated reports.",
    lineItems: [
      { id: nanoid(6), description: "ETL Pipeline (3 data sources)", quantity: 1, unitPrice: 8500 },
      { id: nanoid(6), description: "Custom BI Dashboard", quantity: 1, unitPrice: 6000 },
      { id: nanoid(6), description: "Automated Weekly Reports", quantity: 1, unitPrice: 2500 },
      { id: nanoid(6), description: "Data Model Design", quantity: 1, unitPrice: 3000 },
    ],
    currency: "USD",
    discount: 0,
    notes: "Payment: Net 30 after project kickoff.\nEstimated timeline: 5 weeks.",
    status: "accepted",
    validUntil: "2026-05-15",
    locale: "en",
  },
  {
    clientName: "Miguel Torres",
    clientEmail: "miguel@comercialmx.com",
    clientCompany: "Comercial MX",
    title: "E-Commerce Platform with AI Recommendations",
    description:
      "Modern e-commerce site built on Next.js with AI-powered product recommendations and inventory management.",
    lineItems: [
      { id: nanoid(6), description: "E-Commerce Website (Next.js)", quantity: 1, unitPrice: 60000 },
      { id: nanoid(6), description: "AI Recommendation Engine", quantity: 1, unitPrice: 25000 },
      { id: nanoid(6), description: "Admin Panel & Inventory System", quantity: 1, unitPrice: 15000 },
      { id: nanoid(6), description: "Payment Gateway Integration", quantity: 1, unitPrice: 8000 },
      { id: nanoid(6), description: "SEO & Performance Optimization", quantity: 1, unitPrice: 7000 },
    ],
    currency: "MXN",
    discount: 5,
    notes: "Pago en 3 parcialidades: 30% inicio, 40% mitad del proyecto, 30% al cierre.",
    status: "draft",
    validUntil: "2026-05-01",
    locale: "es",
  },
];

const quoteIdAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const quoteId = (n = 10) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((b) => quoteIdAlphabet[b % quoteIdAlphabet.length])
    .join("");

const ids = [];
for (const q of SAMPLES) {
  const id = quoteId(10);
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO quotes (id, client_name, client_email, client_company, title, description, line_items, currency, discount, notes, status, valid_until, locale, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      q.clientName,
      q.clientEmail,
      q.clientCompany,
      q.title,
      q.description,
      JSON.stringify(q.lineItems),
      q.currency,
      q.discount,
      q.notes,
      q.status,
      q.validUntil,
      q.locale,
      now,
      now,
    ],
  });
  ids.push({ id, title: q.title, status: q.status, locale: q.locale });
  console.log(`  ✓ [${q.status.padEnd(8)}] ${q.title}`);
}

console.log("\nDone! View quotes at:");
for (const q of ids) {
  console.log(`  http://localhost:3000/${q.locale}/quote/${q.id}  (${q.title})`);
}

db.close();
