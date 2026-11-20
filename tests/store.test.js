import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readDb, writeDb } from "../lib/store.js";
import { applySwipe, emptyDb, getFeed } from "../lib/logic.js";
import { PROFILES, LIKED_ME_IDS } from "../lib/seed.js";

function withTempDb(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coy-"));
  const prev = process.env.COY_DB_PATH;
  process.env.COY_DB_PATH = path.join(dir, "db.json");
  try {
    return fn(process.env.COY_DB_PATH);
  } finally {
    if (prev === undefined) delete process.env.COY_DB_PATH;
    else process.env.COY_DB_PATH = prev;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("store: missing file reads as an empty db", () => {
  withTempDb(() => assert.deepEqual(readDb(), emptyDb()));
});

test("store: corrupt file falls back to an empty db instead of crashing", () => {
  withTempDb((file) => {
    fs.writeFileSync(file, "{not json");
    assert.deepEqual(readDb(), emptyDb());
  });
});

test("store: swipes and matches persist across reads (page reload / restart)", () => {
  withTempDb(() => {
    const likerId = [...LIKED_ME_IDS][0];
    const otherId = PROFILES.find((p) => !LIKED_ME_IDS.has(p.id)).id;

    let r = applySwipe({ profiles: PROFILES, likedMeIds: LIKED_ME_IDS, db: readDb(), profileId: likerId, action: "like" });
    writeDb(r.db);
    r = applySwipe({ profiles: PROFILES, likedMeIds: LIKED_ME_IDS, db: readDb(), profileId: otherId, action: "pass" });
    writeDb(r.db);

    // "Reload": read fresh from disk.
    const db = readDb();
    assert.equal(db.swipes[likerId], "like");
    assert.equal(db.swipes[otherId], "pass");
    assert.equal(db.matches.length, 1);
    const feedIds = getFeed(PROFILES, db).map((p) => p.id);
    assert.ok(!feedIds.includes(likerId) && !feedIds.includes(otherId));
    assert.equal(feedIds.length, PROFILES.length - 2);
  });
});
