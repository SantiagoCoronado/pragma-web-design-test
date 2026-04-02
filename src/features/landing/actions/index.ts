"use server";

import { nanoid } from "nanoid";
import { getDb } from "@/shared/lib/db";

export async function submitContactAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const company = (formData.get("company") as string)?.trim() || "";
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Missing required fields" };
  }

  const db = getDb();
  const id = nanoid();

  await db.execute({
    sql: `INSERT INTO contact_submissions (id, name, email, company, message) VALUES (?, ?, ?, ?, ?)`,
    args: [id, name, email, company, message],
  });

  return { success: true };
}
