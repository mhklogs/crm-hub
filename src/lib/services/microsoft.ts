/**
 * Microsoft Entra ID OAuth (authorization-code + PKCE omitted for brevity;
 * Entra supports this flow with client_secret for confidential clients).
 *
 * Tokens are stored per user so the Teams connector can act on their behalf.
 * Real deployments should add a proper token store (this demo keeps them in
 * memory + in the users table via ms_oid; extend as needed).
 */

import { get } from "@/lib/db";

const AUTH_BASE = "https://login.microsoftonline.com";
const SCOPES = [
  "openid",
  "profile",
  "email",
  "User.Read",
  "Chat.ReadWrite",
  "Presence.Read",
  "OnlineMeetings.ReadWrite",
  "offline_access",
].join(" ");

export function microsoftAuthorizeUrl(state: string): string {
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/microsoft/callback`,
    scope: SCOPES,
    state,
    response_mode: "query",
  });
  return `${AUTH_BASE}/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeMicrosoftCode(code: string): Promise<{
  access_token: string;
  id_token_claims: { email?: string; name?: string; oid?: string };
}> {
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  const res = await fetch(`${AUTH_BASE}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/microsoft/callback`,
      scope: SCOPES,
    }).toString(),
  });
  const tokens = (await res.json()) as {
    access_token?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokens.access_token) {
    throw new Error(tokens.error_description ?? tokens.error ?? "Exchange failed");
  }

  // Decode the id_token payload (unvalidated base64url JSON — enough for demo).
  const payload = tokens.id_token!.split(".")[1];
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    email?: string;
    preferred_username?: string;
    name?: string;
    oid?: string;
  };

  return {
    access_token: tokens.access_token,
    id_token_claims: {
      email: claims.email ?? claims.preferred_username,
      name: claims.name,
      oid: claims.oid,
    },
  };
}

/** Convenience to fetch the stored token for a signed-in user. */
export function getUserTokens(userId: number): { access_token: string } | null {
  const token = msTokensStore.get(userId);
  return token ? { access_token: token } : null;
}

export const msTokensStore = new Map<number, string>();
export function storeUserTokens(userId: number, accessToken: string) {
  msTokensStore.set(userId, accessToken);
}

export function getEmailOid(email: string | undefined, oid?: string): string | null {
  const row =
    email && oid === undefined
      ? get<{ ms_oid: string | null }>("SELECT ms_oid FROM users WHERE email = ?", email)
      : null;
  return row?.ms_oid ?? oid ?? null;
}