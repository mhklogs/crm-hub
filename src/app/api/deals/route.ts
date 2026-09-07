import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { all, run } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const deals = all<{
      id: number;
      contact_id: number | null;
      title: string;
      value: number;
      stage: string;
      created_at: string;
    }>("SELECT * FROM deals WHERE user_id = ? ORDER BY value DESC", user.id);
    return NextResponse.json({ deals });
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
      title?: string;
      value?: number;
      stage?: string;
      contactId?: number | null;
    };
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const id = run(
      "INSERT INTO deals (user_id, contact_id, title, value, stage) VALUES (?,?,?,?,?)",
      user.id,
      body.contactId ?? null,
      body.title.trim(),
      body.value ?? 0,
      body.stage ?? "lead",
    ).lastInsertRowid;
    return NextResponse.json({ id });
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw e;
  }
}