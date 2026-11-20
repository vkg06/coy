import { NextResponse } from "next/server";
import { PROFILES, LIKED_ME_IDS } from "@/lib/seed.js";
import { applySwipe } from "@/lib/logic.js";
import { readDb, writeDb } from "@/lib/store.js";

export const dynamic = "force-dynamic";

const STATUS = { INVALID_ACTION: 400, UNKNOWN_PROFILE: 404, ALREADY_SWIPED: 409 };

// POST /api/swipe  { profileId, action: "like" | "pass" }
// -> { matched: boolean, profile? }   (profile only present on a mutual match)
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const result = applySwipe({
    profiles: PROFILES,
    likedMeIds: LIKED_ME_IDS,
    db: readDb(),
    profileId: body?.profileId,
    action: body?.action,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.code }, { status: STATUS[result.code] ?? 400 });
  }

  writeDb(result.db);
  return NextResponse.json({
    matched: result.matched,
    ...(result.matched ? { profile: result.profile } : {}),
  });
}
