import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getUserTokens } from "@/lib/services/microsoft";
import { sendTeamsMessage } from "@/lib/services/teams";
import { run, get } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { contactId?: number | null; message?: string };
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const contact = body.contactId
      ? get<{ ms_email: string | null; name: string }>(
          "SELECT ms_email, name FROM contacts WHERE id = ? AND user_id = ?",
          body.contactId,
          user.id,
        )
      : null;

    const recipientEmail = contact?.ms_email;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Contact has no Microsoft email set (add it to connect via Teams)" },
        { status: 400 },
      );
    }

    const tokens = getUserTokens(user.id) ?? undefined;
    const result = await sendTeamsMessage({
      tokens,
      recipientEmail,
      message: body.message.trim(),
    });

    run(
      "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
      user.id,
      body.contactId ?? null,
      "team_message",
      "outbound",
      `Teams → ${contact?.name ?? recipientEmail}`,
      body.message.trim(),
    );

    return NextResponse.json(result);
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}