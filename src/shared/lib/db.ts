import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.DATABASE_URL || "file:local.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

    client = createClient({ url, authToken });
  }
  return client;
}

export async function initDb() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_company TEXT DEFAULT '',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      quote_type TEXT DEFAULT 'line-items',
      line_items TEXT NOT NULL DEFAULT '[]',
      currency TEXT DEFAULT 'MXN',
      discount REAL DEFAULT 0,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      valid_until TEXT DEFAULT '',
      locale TEXT DEFAULT 'en',
      problem TEXT,
      opportunity TEXT,
      deliverables TEXT,
      timeline TEXT,
      fixed_price REAL,
      list_price REAL,
      preferential_note TEXT,
      payment_terms TEXT,
      next_steps TEXT,
      scope_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migrations for existing installations (ignore errors if columns already exist)
  const migrations = [
    "ALTER TABLE quotes ADD COLUMN quote_type TEXT DEFAULT 'line-items'",
    "ALTER TABLE quotes ADD COLUMN problem TEXT",
    "ALTER TABLE quotes ADD COLUMN opportunity TEXT",
    "ALTER TABLE quotes ADD COLUMN deliverables TEXT",
    "ALTER TABLE quotes ADD COLUMN timeline TEXT",
    "ALTER TABLE quotes ADD COLUMN fixed_price REAL",
    "ALTER TABLE quotes ADD COLUMN list_price REAL",
    "ALTER TABLE quotes ADD COLUMN preferential_note TEXT",
    "ALTER TABLE quotes ADD COLUMN payment_terms TEXT",
    "ALTER TABLE quotes ADD COLUMN next_steps TEXT",
    "ALTER TABLE quotes ADD COLUMN scope_note TEXT",
  ];

  for (const sql of migrations) {
    try {
      await db.execute(sql);
    } catch {
      // Column already exists - ignore
    }
  }
}
