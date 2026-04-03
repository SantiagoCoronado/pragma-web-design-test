import { getDb, initDb } from "@/shared/lib/db";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  read: boolean;
  createdAt: string;
}

async function ensureDb() {
  await initDb();
  return getDb();
}

function rowToContact(row: Record<string, unknown>): ContactSubmission {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    company: (row.company as string) || "",
    message: row.message as string,
    read: Boolean(row.read),
    createdAt: row.created_at as string,
  };
}

export async function getAllContacts(): Promise<ContactSubmission[]> {
  const db = await ensureDb();
  const result = await db.execute(
    "SELECT * FROM contact_submissions ORDER BY created_at DESC"
  );
  return result.rows.map((row) =>
    rowToContact(row as Record<string, unknown>)
  );
}

export async function markContactRead(
  id: string,
  read: boolean
): Promise<void> {
  const db = await ensureDb();
  await db.execute({
    sql: "UPDATE contact_submissions SET read = ? WHERE id = ?",
    args: [read ? 1 : 0, id],
  });
}

export async function deleteContact(id: string): Promise<void> {
  const db = await ensureDb();
  await db.execute({
    sql: "DELETE FROM contact_submissions WHERE id = ?",
    args: [id],
  });
}
