import { getDb, initDb } from "@/shared/lib/db";
import { nanoid } from "nanoid";
import type { Quote, LineItem, Deliverable } from "../types";
import type { QuoteFormData } from "./schemas";

async function ensureDb() {
  await initDb();
  return getDb();
}

function rowToQuote(row: Record<string, unknown>): Quote {
  return {
    id: row.id as string,
    clientName: row.client_name as string,
    clientEmail: row.client_email as string,
    clientCompany: (row.client_company as string) || "",
    title: row.title as string,
    description: (row.description as string) || "",
    quoteType: (row.quote_type as Quote["quoteType"]) || "line-items",
    lineItems: JSON.parse((row.line_items as string) || "[]") as LineItem[],
    currency: row.currency as Quote["currency"],
    discount: (row.discount as number) || 0,
    notes: (row.notes as string) || "",
    status: row.status as Quote["status"],
    validUntil: (row.valid_until as string) || "",
    locale: row.locale as Quote["locale"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    problem: (row.problem as string) || undefined,
    opportunity: (row.opportunity as string) || undefined,
    deliverables: row.deliverables
      ? (JSON.parse(row.deliverables as string) as Deliverable[])
      : undefined,
    timeline: (row.timeline as string) || undefined,
    fixedPrice: row.fixed_price != null ? (row.fixed_price as number) : undefined,
    listPrice: row.list_price != null ? (row.list_price as number) : undefined,
    preferentialNote: (row.preferential_note as string) || undefined,
    paymentTerms: (row.payment_terms as string) || undefined,
    nextSteps: row.next_steps
      ? (JSON.parse(row.next_steps as string) as string[])
      : undefined,
    scopeNote: (row.scope_note as string) || undefined,
  };
}

export async function getAllQuotes(): Promise<Quote[]> {
  const db = await ensureDb();
  const result = await db.execute(
    "SELECT * FROM quotes ORDER BY created_at DESC"
  );
  return result.rows.map((row) => rowToQuote(row as Record<string, unknown>));
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const db = await ensureDb();
  const result = await db.execute({
    sql: "SELECT * FROM quotes WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToQuote(result.rows[0] as Record<string, unknown>);
}

export async function createQuote(data: QuoteFormData): Promise<Quote> {
  const db = await ensureDb();
  const id = nanoid(10);
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO quotes (
            id, client_name, client_email, client_company, title, description,
            quote_type, line_items, currency, discount, notes, status, valid_until, locale,
            problem, opportunity, deliverables, timeline,
            fixed_price, list_price, preferential_note, payment_terms, next_steps, scope_note,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.clientName,
      data.clientEmail,
      data.clientCompany,
      data.title,
      data.description,
      data.quoteType || "line-items",
      JSON.stringify(data.lineItems),
      data.currency,
      data.discount,
      data.notes,
      data.status,
      data.validUntil,
      data.locale,
      data.problem || null,
      data.opportunity || null,
      data.deliverables ? JSON.stringify(data.deliverables) : null,
      data.timeline || null,
      data.fixedPrice ?? null,
      data.listPrice ?? null,
      data.preferentialNote || null,
      data.paymentTerms || null,
      data.nextSteps ? JSON.stringify(data.nextSteps) : null,
      data.scopeNote || null,
      now,
      now,
    ],
  });

  return (await getQuoteById(id))!;
}

export async function updateQuote(
  id: string,
  data: Partial<QuoteFormData>
): Promise<Quote | null> {
  const db = await ensureDb();
  const existing = await getQuoteById(id);
  if (!existing) return null;

  const updated = { ...existing, ...data };
  const now = new Date().toISOString();

  await db.execute({
    sql: `UPDATE quotes SET
            client_name = ?, client_email = ?, client_company = ?,
            title = ?, description = ?, quote_type = ?, line_items = ?,
            currency = ?, discount = ?, notes = ?,
            status = ?, valid_until = ?, locale = ?,
            problem = ?, opportunity = ?, deliverables = ?, timeline = ?,
            fixed_price = ?, list_price = ?, preferential_note = ?,
            payment_terms = ?, next_steps = ?, scope_note = ?,
            updated_at = ?
          WHERE id = ?`,
    args: [
      updated.clientName,
      updated.clientEmail,
      updated.clientCompany,
      updated.title,
      updated.description,
      updated.quoteType || "line-items",
      JSON.stringify(updated.lineItems),
      updated.currency,
      updated.discount,
      updated.notes,
      updated.status,
      updated.validUntil,
      updated.locale,
      updated.problem || null,
      updated.opportunity || null,
      updated.deliverables ? JSON.stringify(updated.deliverables) : null,
      updated.timeline || null,
      updated.fixedPrice ?? null,
      updated.listPrice ?? null,
      updated.preferentialNote || null,
      updated.paymentTerms || null,
      updated.nextSteps ? JSON.stringify(updated.nextSteps) : null,
      updated.scopeNote || null,
      now,
      id,
    ],
  });

  return getQuoteById(id);
}

export async function updateQuoteStatus(
  id: string,
  status: Quote["status"]
): Promise<void> {
  const db = await ensureDb();
  await db.execute({
    sql: "UPDATE quotes SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, id],
  });
}

export async function deleteQuote(id: string): Promise<void> {
  const db = await ensureDb();
  await db.execute({
    sql: "DELETE FROM quotes WHERE id = ?",
    args: [id],
  });
}
