import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { all, run } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const contactId = url.searchParams.get("contactId");
    const rows = all<{
      id: number;
      kind: string;
      direction: string;
      summary: string;
      detail: string;
      created_at: string;
    }>(
      contactId
        ? "SELECT id, kind, direction, summary, detail, created_at FROM activities WHERE user_id = ? AND contact_id = ? ORDER BY created_at DESC LIMIT 100"
        : "SELECT id, kind, direction, summary, detail, created_at FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
      ...(contactId ? [user.id, Number(contactId)] : [user.id]),
    );
    return NextResponse.json({ activities: rows });
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      contactId?: number | null;
      kind?: string;
      direction?: string;
      summary?: string;
      detail?: string;
    };
    const kind = body.kind ?? "note";
    const dir = body.direction ?? "outbound";
    const summary = body.summary ?? body.detail ?? "note";
    if (!summary.trim()) {
      return NextResponse.json({ error: "summary is required" }, { status: 400 });
    }
    run(
      "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
      user.id,
      body.contactId ?? null,
      kind,
      dir,
      summary,
      body.detail ?? null,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw e;
  }
}