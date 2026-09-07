import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { all, run } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const contacts = all<{
      id: number;
      name: string;
      company: string | null;
      email: string | null;
      phone: string | null;
      ms_email: string | null;
      notes: string | null;
      created_at: string;
    }>("SELECT * FROM contacts WHERE user_id = ? ORDER BY name", user.id);
    return NextResponse.json({ contacts });
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
      name?: string;
      company?: string;
      email?: string;
      phone?: string;
      ms_email?: string;
      notes?: string;
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const id = run(
      "INSERT INTO contacts (user_id, name, company, email, phone, ms_email, notes) VALUES (?,?,?,?,?,?,?)",
      user.id,
      body.name.trim(),
      body.company ?? null,
      body.email ?? null,
      body.phone ?? null,
      body.ms_email ?? null,
      body.notes ?? null,
    ).lastInsertRowid;
    return NextResponse.json({ id });
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw e;
  }
}