import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { sendSms } from "@/lib/services/dialer";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { to?: string; message?: string; contactId?: number | null };
    if (!body.to?.trim() || !body.message?.trim()) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 });
    }
    const result = await sendSms({
      to: body.to.trim(),
      message: body.message.trim(),
      userId: user.id,
      contactId: body.contactId ?? null,
    });
    return NextResponse.json(result);
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}