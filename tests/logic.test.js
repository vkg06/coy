import test from "node:test";
import assert from "node:assert/strict";
import { applySwipe, emptyDb, getFeed, getMatches, toPublicProfile } from "../lib/logic.js";
import { PROFILES, LIKED_ME_IDS } from "../lib/seed.js";

const profiles = [
  { id: "a", name: "A", age: 20, place: "X", bio: "b", interests: ["i"], photo: "/a" },
  { id: "b", name: "B", age: 21, place: "Y", bio: "b", interests: ["i"], photo: "/b" },
  { id: "c", name: "C", age: 22, place: "Z", bio: "b", interests: ["i"], photo: "/c" },
];
const likedMeIds = new Set(["a"]); // only A has liked the user

const swipe = (db, profileId, action) =>
  applySwipe({ profiles, likedMeIds, db, profileId, action, now: () => new Date("2026-01-01T00:00:00Z") });

// ---------- seed data ----------

test("seed: at least 30 complete profiles", () => {
  assert.ok(PROFILES.length >= 30);
  for (const p of PROFILES) {
    assert.ok(p.id && p.name && p.age && p.photo && p.bio && p.place);
    assert.ok(Array.isArray(p.interests) && p.interests.length > 0);
  }
  assert.equal(new Set(PROFILES.map((p) => p.id)).size, PROFILES.length, "ids are unique");
});

test("seed: some profiles already liked the user, and all refer to real profiles", () => {
  assert.ok(LIKED_ME_IDS.size >= 5);
  const ids = new Set(PROFILES.map((p) => p.id));
  for (const id of LIKED_ME_IDS) assert.ok(ids.has(id));
});

test("seed: like state is never attached to a profile object", () => {
  for (const p of PROFILES) {
    assert.deepEqual(Object.keys(p).sort(), ["age", "bio", "id", "interests", "name", "photo", "place"]);
  }
});

// ---------- feed ----------

test("feed: returns everything for a fresh user", () => {
  assert.equal(getFeed(profiles, emptyDb()).length, 3);
});

test("feed: a swiped profile never appears again (like or pass)", () => {
  let db = swipe(emptyDb(), "b", "pass").db;
  db = swipe(db, "c", "like").db;
  assert.deepEqual(getFeed(profiles, db).map((p) => p.id), ["a"]);
});

test("feed: empty once every profile has been swiped", () => {
  let db = emptyDb();
  for (const p of profiles) db = swipe(db, p.id, "pass").db;
  assert.deepEqual(getFeed(profiles, db), []);
});

// ---------- matching ----------

test("match: liking someone who liked you creates a match", () => {
  const r = swipe(emptyDb(), "a", "like");
  assert.equal(r.ok, true);
  assert.equal(r.matched, true);
  assert.equal(r.profile.id, "a");
  assert.equal(r.db.matches.length, 1);
});

test("no match: liking someone who has not liked you", () => {
  const r = swipe(emptyDb(), "b", "like");
  assert.equal(r.matched, false);
  assert.equal(r.profile, undefined);
  assert.equal(r.db.matches.length, 0);
});

test("no match: passing on someone who liked you", () => {
  const r = swipe(emptyDb(), "a", "pass");
  assert.equal(r.matched, false);
  assert.equal(r.db.matches.length, 0);
});

test("matches list contains only mutual matches, not plain likes", () => {
  let db = swipe(emptyDb(), "b", "like").db; // one-sided
  db = swipe(db, "a", "like").db; // mutual
  assert.deepEqual(getMatches(profiles, db).map((m) => m.id), ["a"]);
});

// ---------- privacy: the core promise ----------

test("privacy: feed profiles never expose who liked the user", () => {
  const feed = getFeed(profiles, emptyDb());
  for (const p of feed) {
    assert.deepEqual(Object.keys(p).sort(), ["age", "bio", "id", "interests", "name", "photo", "place"]);
  }
  // Serialised output has no trace of like state anywhere.
  assert.ok(!/like/i.test(JSON.stringify(feed)));
});

test("privacy: feed output is identical regardless of who liked the user", () => {
  const a = getFeed(profiles, emptyDb());
  const withLiker = profiles.map((p) => ({ ...p })); // same data, different likedMe set below
  const b = getFeed(withLiker, emptyDb());
  assert.deepEqual(a, b);
});

test("privacy: a pass response is indistinguishable for liker and non-liker", () => {
  const liker = swipe(emptyDb(), "a", "pass");
  const stranger = swipe(emptyDb(), "b", "pass");
  assert.equal(liker.matched, stranger.matched);
  assert.equal("profile" in liker, "profile" in stranger);
});

test("privacy: toPublicProfile drops any extra fields", () => {
  const leaky = { ...profiles[0], likedMe: true, secret: "x" };
  const pub = toPublicProfile(leaky);
  assert.equal("likedMe" in pub, false);
  assert.equal("secret" in pub, false);
});

// ---------- swipe validation ----------

test("swipe: rejects invalid action, unknown profile, and double swipes", () => {
  assert.equal(swipe(emptyDb(), "a", "superlike").code, "INVALID_ACTION");
  assert.equal(swipe(emptyDb(), "zzz", "like").code, "UNKNOWN_PROFILE");
  const db = swipe(emptyDb(), "b", "pass").db;
  assert.equal(swipe(db, "b", "like").code, "ALREADY_SWIPED");
});

test("swipe: a double swipe cannot create a duplicate match", () => {
  const first = swipe(emptyDb(), "a", "like");
  const second = swipe(first.db, "a", "like");
  assert.equal(second.ok, false);
  assert.equal(first.db.matches.length, 1);
});

test("swipe: does not mutate the input db", () => {
  const db = emptyDb();
  swipe(db, "a", "like");
  assert.deepEqual(db, emptyDb());
});

test("matches: newest first", () => {
  const ps = ["a", "b"].map((id) => profiles.find((p) => p.id === id));
  const db = {
    swipes: { a: "like", b: "like" },
    matches: [
      { profileId: "a", matchedAt: "2026-01-01T00:00:00.000Z" },
      { profileId: "b", matchedAt: "2026-02-01T00:00:00.000Z" },
    ],
  };
  assert.deepEqual(getMatches(ps, db).map((m) => m.id), ["b", "a"]);
});
