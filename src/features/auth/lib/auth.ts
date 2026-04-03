import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "pragma_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  // Try hashed password first (production)
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  // Fall back to plain text for development (requires ADMIN_PASSWORD)
  const plaintext = process.env.ADMIN_PASSWORD;
  if (plaintext) {
    return password === plaintext;
  }

  return false;
}

export async function createSession(): Promise<void> {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return !!session?.value;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
