import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { createVideoRoom } from "@/lib/services/video";
import { get } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { contactId?: number | null };
    const contact = body.contactId
      ? get<{ name: string }>("SELECT name FROM contacts WHERE id = ? AND user_id = ?", body.contactId, user.id)
      : null;
    const room = `room-${user.id}-${Date.now().toString(36)}`;
    const result = await createVideoRoom({
      room,
      displayName: user.name || user.email,
      userId: user.id,
      contactId: body.contactId ?? null,
      contactName: contact?.name,
    });
    return NextResponse.json(result);
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}