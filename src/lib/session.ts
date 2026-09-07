/**
 * Dev-mode session auth.
 *
 * Two login paths:
 *  - "Sign in with Microsoft" → real OAuth against Microsoft Entra ID
 *    (works once MICROSOFT_CLIENT_ID/SECRET are set).
 *  - "Dev login" → writes a local session cookie when the provider keys
 *    are blank, so the UI is buildable/usable before M365 is configured.
 */

import { cookies } from "next/headers";
import { get, run } from "@/lib/db";

export const SESSION_COOKIE = "crm_hub_session";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  ms_oid: string | null;
};

/** Returns the current user from the session cookie, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = get<SessionUser & { token: string }>(
    "SELECT id, email, name, ms_oid FROM users WHERE id = ?",
    Number(token),
  );
  return row ?? null;
}

/** Requires an authenticated user; throws if missing. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/** Creates the user row + session cookie. Used by both auth paths. */
export async function createSession(input: {
  email: string;
  name: string;
  ms_oid?: string | null;
}): Promise<void> {
  const existing = get<{ id: number }>("SELECT id FROM users WHERE email = ?", input.email);
  const id = existing?.id ?? run("INSERT INTO users (email, name, ms_oid) VALUES (?, ?, ?)", input.email, input.name, input.ms_oid ?? null).lastInsertRowid;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, String(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}