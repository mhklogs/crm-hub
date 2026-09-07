import { NextResponse } from "next/server";
import { microsoftAuthorizeUrl } from "@/lib/services/microsoft";

/**
 * GET /api/auth/microsoft  -> redirects to Microsoft Entra sign-in.
 * Providers a random state param. Production: persist state in a cookie and
 * verify it in the callback.
 */
export async function GET() {
  const state = Math.random().toString(36).slice(2);
  const url = microsoftAuthorizeUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("ms_oauth_state", state, { httpOnly: true, sameSite: "lax" });
  return res;
}