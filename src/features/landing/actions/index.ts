"use server";

import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(1),
});

export async function submitContactAction(formData: FormData) {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") ?? undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Missing or invalid fields" };
  }

  await new Promise((r) => setTimeout(r, 700));

  return { success: true };
}
