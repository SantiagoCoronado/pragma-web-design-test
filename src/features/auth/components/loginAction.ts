"use server";

import { redirect } from "next/navigation";
import { verifyPassword, createSession } from "../lib/auth";

export async function loginAction(formData: FormData) {
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
