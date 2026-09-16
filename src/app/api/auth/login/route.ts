import { NextResponse } from "next/server";
import { createSession, isAuthConfigured } from "@/lib/session";

/**
 * POST /api/auth/login  { email, name }
 * Dev login — used when Microsoft auth is not yet configured.
 */
export async function POST(req: Request) {
  if (isAuthConfigured()) {
    return NextResponse.json({ error: "Use Microsoft login" }, { status: 400 });
  }
  const body = (await req.json().catch(() => ({}))) as { email?: string; name?: string };
  const email = nameFromBody(body);
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  await createSession({ email, name: email.split("@")[0] });
  return NextResponse.json({ ok: true });
}
function nameFromBody(body: { email?: string; name?: string }): string | undefined {
  const e = (body.email ?? "").trim();
  if (!e) return undefined;
  return e;
}