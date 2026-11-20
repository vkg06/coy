import { NextResponse } from "next/server";
import { PROFILES } from "@/lib/seed.js";
import { getMatches } from "@/lib/logic.js";
import { readDb } from "@/lib/store.js";

export const dynamic = "force-dynamic";

// GET /api/matches -> mutual matches only, newest first.
export async function GET() {
  const matches = getMatches(PROFILES, readDb());
  return NextResponse.json({ matches });
}
