import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { makeCall } from "@/lib/services/dialer";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as { to?: string; contactId?: number | null };
    if (!body.to?.trim()) {
      return NextResponse.json({ error: "to is required" }, { status: 400 });
    }
    const result = await makeCall({
      to: body.to.trim(),
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