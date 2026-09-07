/**
 * Zoom-like video rooms via LiveKit.
 *
 * Real mode: mints an access token for a LiveKit room (room name +
 * join token). The browser then connects using LiveKit's Web SDK.
 * Mock mode: returns a fake room + token + join URL, and logs the
 * activity so the UI flow works before LiveKit is configured.
 */

import { run } from "@/lib/db";

function mock(): boolean {
  return !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET;
}

export type VideoRoomResult = {
  ok: boolean;
  provider: "mock" | "livekit";
  room: string;
  token: string;
  url: string;
  detail?: string;
};

/**
 * Creates (or reuses) a video room for two people. The returned `url`
 * points at the app's /video/[room] page so the other side just clicks it.
 */
export async function createVideoRoom(input: {
  room: string;
  displayName: string;
  userId: number;
  contactId: number | null;
  contactName?: string;
}): Promise<VideoRoomResult> {
  if (mock() || !process.env.LIVEKIT_URL) {
    run(
      "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
      input.userId,
      input.contactId,
      "video",
      "outbound",
      `Video room "${input.room}" with ${input.contactName ?? "a contact"}`,
      "MOCK: no LiveKit credentials configured",
    );
    return {
      ok: true,
      provider: "mock",
      room: input.room,
      token: "mock-token",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/video/${input.room}`,
    };
  }

  const { AccessToken } = await import("livekit-server-sdk");
  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: input.displayName,
    ttl: "2h",
  });
  at.addGrant({ roomJoin: true, room: input.room, canPublish: true, canSubscribe: true });
  const token = await at.toJwt();

  run(
    "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
    input.userId,
    input.contactId,
    "video",
    "outbound",
    `Video room "${input.room}" with ${input.contactName ?? "a contact"}`,
    process.env.LIVEKIT_URL!,
  );

  return {
    ok: true,
    provider: "livekit",
    room: input.room,
    token,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/video/${input.room}`,
  };
}