#!/usr/bin/env node
/**
 * One-shot migration: rename a quote's primary-key id.
 *
 * Usage:
 *   dotenv -e .env.local -- node scripts/rename-quote-id.mjs --old <oldId> --new <newId>
 *   dotenv -e .env.turso -- node scripts/rename-quote-id.mjs --old <oldId> --new <newId>
 *
 * quotes.id is PRIMARY KEY with no incoming FKs, so a plain UPDATE is safe.
 */
import { createClient } from "@libsql/client";

const args = process.argv.slice(2);
let oldId = null;
let newId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--old" && args[i + 1]) {
    oldId = args[i + 1];
    i++;
  } else if (args[i] === "--new" && args[i + 1]) {
    newId = args[i + 1];
    i++;
  }
}

if (!oldId || !newId) {
  console.error(
    "Usage: node scripts/rename-quote-id.mjs --old <oldId> --new <newId>"
  );
  process.exit(1);
}

const db = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const existing = await db.execute({
  sql: "SELECT id FROM quotes WHERE id = ?",
  args: [oldId],
});

if (existing.rows.length === 0) {
  console.error(`No row found with id = "${oldId}" (DB: ${process.env.DATABASE_URL})`);
  process.exit(1);
}

const collision = await db.execute({
  sql: "SELECT id FROM quotes WHERE id = ?",
  args: [newId],
});

if (collision.rows.length > 0) {
  console.error(`A row with id = "${newId}" already exists — aborting.`);
  process.exit(1);
}

await db.execute({
  sql: "UPDATE quotes SET id = ? WHERE id = ?",
  args: [newId, oldId],
});

console.log(`✓ Renamed quote id: "${oldId}" → "${newId}" (${process.env.DATABASE_URL})`);
