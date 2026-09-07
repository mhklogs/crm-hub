import { NextResponse } from "next/server";
import { exchangeMicrosoftCode, storeUserTokens } from "@/lib/services/microsoft";
import { createSession } from "@/lib/session";
import { get } from "@/lib/db";

/**
 * GET /api/auth/microsoft/callback?code=...&state=...
 * Exchanges the OAuth code, creates a local user + session, stores tokens.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/?error=code_missing`);
  }

  try {
    const { access_token, id_token_claims } = await exchangeMicrosoftCode(code);
    const email = id_token_claims.email;
    if (!email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/?error=no_email`);
    }
    await createSession({
      email,
      name: id_token_claims.name ?? email.split("@")[0],
      ms_oid: id_token_claims.oid,
    });
    const user = get<{ id: number }>("SELECT id FROM users WHERE email = ?", email);
    if (user) storeUserTokens(user.id, access_token);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/?error=${encodeURIComponent(msg)}`,
    );
  }
}