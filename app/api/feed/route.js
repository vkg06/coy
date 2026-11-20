import { NextResponse } from "next/server";
import { PROFILES } from "@/lib/seed.js";
import { getFeed } from "@/lib/logic.js";
import { readDb } from "@/lib/store.js";

export const dynamic = "force-dynamic";

// GET /api/feed -> profiles the user has not swiped on yet.
export async function GET() {
  const profiles = getFeed(PROFILES, readDb());
  return NextResponse.json({ profiles });
}
