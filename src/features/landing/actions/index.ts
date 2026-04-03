"use server";

import { nanoid } from "nanoid";
import { getDb } from "@/shared/lib/db";
import { sendContactNotification } from "@/shared/lib/email";

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

  // Send email notification (non-blocking — don't fail the form if email fails)
  sendContactNotification({ name, email, company, message }).catch((err) =>
    console.error("Failed to send contact notification email:", err)
  );

  return { success: true };
}
