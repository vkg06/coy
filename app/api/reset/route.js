import { NextResponse } from "next/server";
import { emptyDb } from "@/lib/logic.js";
import { writeDb } from "@/lib/store.js";

export const dynamic = "force-dynamic";

// POST /api/reset: demo convenience. Clears all swipes and matches.
// Disabled in production builds unless ALLOW_RESET=1.
export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_RESET !== "1") {
    return NextResponse.json({ error: "Reset disabled" }, { status: 403 });
  }
  writeDb(emptyDb());
  return NextResponse.json({ ok: true });
}
