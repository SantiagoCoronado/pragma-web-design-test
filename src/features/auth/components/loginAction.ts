"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword, createSession } from "../lib/auth";
import { rateLimit } from "@/shared/lib/rate-limit";

// Next.js Server Actions are CSRF-protected by the framework via Origin header
// validation. No manual CSRF token needed.

export async function loginAction(formData: FormData) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`login:${ip}`, { limit: process.env.NODE_ENV === "development" ? 100 : 5, windowMs: 15 * 60 * 1000 });
  if (!limit.success) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const password = formData.get("password") as string;

  if (!password || !(await verifyPassword(password))) {
    return { error: "Invalid password" };
  }

  await createSession();
  redirect("/en/admin");
}

export async function logoutAction() {
  const { destroySession } = await import("../lib/auth");
  await destroySession();
  redirect("/en");
}
