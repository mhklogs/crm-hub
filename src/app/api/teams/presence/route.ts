import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getUserTokens } from "@/lib/services/microsoft";
import { getTeamsPresence } from "@/lib/services/teams";

export async function GET() {
  try {
    const user = await requireUser();
    const tokens = getUserTokens(user.id) ?? undefined;
    const presence = await getTeamsPresence(tokens);
    return NextResponse.json(presence);
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}