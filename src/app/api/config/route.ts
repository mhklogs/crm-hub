import { NextResponse } from "next/server";
import { providerStatus } from "@/lib/providers";

export async function GET() {
  return NextResponse.json(providerStatus());
}