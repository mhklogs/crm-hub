/**
 * Microsoft Teams connector via the Microsoft Graph API.
 *
 * Requires a Microsoft 365 Business/Enterprise tenant (personal/free
 * Microsoft accounts do NOT get Teams API scopes).
 *
 * Delegate token flow approach: we read the MS tokens that our OAuth
 * callback stored for the signed-in user. When MICROSOFT_CLIENT_ID is
 * empty we run in MOCK mode so the UI works end-to-end before M365 access
 * is granted.
 */

type MsTokens = {
  access_token: string;
  expires_at: number;
};

export type TeamsToken = MsTokens | { access_token: string };

const GRAPH = "https://graph.microsoft.com/v1.0";

function mock(): boolean {
  return !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET;
}

function graphHeaders(tokens: MsTokens) {
  return {
    Authorization: `Bearer ${tokens.access_token}`,
    "Content-Type": "application/json",
  };
}

async function graphGet<T>(tokens: TeamsToken, path: string): Promise<T> {
  const res = await fetch(`${GRAPH}${path}`, { headers: graphHeaders(tokens as MsTokens) });
  if (!res.ok) throw new Error(`Graph ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/**
 * Sends a message into a Teams 1:1 chat. Provide either chatId (existing
 * chat) or a recipient email to look up / create the chat.
 */
export async function sendTeamsMessage(input: {
  tokens?: TeamsToken;
  recipientEmail: string;
  message: string;
}): Promise<{ ok: boolean; provider: "mock" | "microsoft"; chatId?: string }> {
  if (mock() || !input.tokens) {
    return { ok: true, provider: "mock" };
  }

  // Find or create a direct chat with the user (by their email/UPN).
  const found = await graphGet<{ value: { id: string }[] }>(input.tokens, `/me/chats`);
  const chat = found.value.find((c) => c.id) ?? null;
  const chatId =
    chat?.id ??
    (await createDirectChat(input.tokens, input.recipientEmail));

  const res = await fetch(`${GRAPH}/chats/${chatId}/messages`, {
    method: "POST",
    headers: graphHeaders(input.tokens as MsTokens),
    body: JSON.stringify({
      body: { contentType: "html", content: input.message },
    }),
  });
  if (!res.ok) throw new Error(`Graph send ${res.status}: ${await res.text()}`);
  return { ok: true, provider: "microsoft", chatId };
}

async function createDirectChat(tokens: TeamsToken, email: string): Promise<string> {
  const res = await fetch(`${GRAPH}/chats`, {
    method: "POST",
    headers: graphHeaders(tokens as MsTokens),
    body: JSON.stringify({
      chatType: "oneOnOne",
      members: [
        { "@odata.type": "#microsoft.graph.aadUserConversationMember", roles: ["owner"], userId: "self" },
        { "@odata.type": "#microsoft.graph.aadUserConversationMember", roles: ["owner"], userPrincipalName: email },
      ],
    }),
  });
  const data = (await res.json()) as { id?: string };
  return data.id ?? "";
}

/** Returns the user's Teams presence (Available/Busy/Away/etc). */
export async function getTeamsPresence(tokens?: TeamsToken): Promise<{
  provider: "mock" | "microsoft";
  availability: string;
  activity: string;
}> {
  if (mock() || !tokens) {
    return { provider: "mock", availability: "Available", activity: "Available" };
  }
  const presence = await graphGet<{ availability: string; activity: string }>(tokens, "/me/presence");
  return { provider: "microsoft", availability: presence.availability, activity: presence.activity };
}