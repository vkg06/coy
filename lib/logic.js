// Pure matching logic. No I/O in this file so it is trivial to unit test.
//
// State shape ("db"):
//   { swipes: { [profileId]: "like" | "pass" },
//     matches: [{ profileId, matchedAt }] }

export const ACTIONS = ["like", "pass"];

export function emptyDb() {
  return { swipes: {}, matches: [] };
}

/**
 * Only these fields ever leave the server. Anything else (e.g. whether the
 * profile liked the user) is dropped here by construction, so it cannot leak
 * through an accidental spread of a profile object.
 */
export function toPublicProfile(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    place: p.place,
    bio: p.bio,
    interests: [...p.interests],
    photo: p.photo,
  };
}

/** Profiles the user has not swiped on yet. */
export function getFeed(profiles, db) {
  return profiles.filter((p) => !(p.id in db.swipes)).map(toPublicProfile);
}

/**
 * Record a swipe. Returns a new db plus the outcome. Never mutates its input.
 *
 * Outcomes:
 *   { ok: false, code: "INVALID_ACTION" | "UNKNOWN_PROFILE" | "ALREADY_SWIPED" }
 *   { ok: true, matched: boolean, profile?: PublicProfile, db }
 *
 * A match is created only when the user LIKES a profile that has already liked
 * the user. Passing never matches. The profile's like is never exposed unless
 * this mutual condition holds.
 */
export function applySwipe({ profiles, likedMeIds, db, profileId, action, now = () => new Date() }) {
  if (!ACTIONS.includes(action)) return { ok: false, code: "INVALID_ACTION" };

  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return { ok: false, code: "UNKNOWN_PROFILE" };

  if (profileId in db.swipes) return { ok: false, code: "ALREADY_SWIPED" };

  const next = {
    swipes: { ...db.swipes, [profileId]: action },
    matches: [...db.matches],
  };

  const matched = action === "like" && likedMeIds.has(profileId);
  if (matched) {
    next.matches.push({ profileId, matchedAt: now().toISOString() });
  }

  return {
    ok: true,
    matched,
    db: next,
    ...(matched ? { profile: toPublicProfile(profile) } : {}),
  };
}

/** Mutual matches, most recent first. */
export function getMatches(profiles, db) {
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return db.matches
    .filter((m) => byId.has(m.profileId))
    .map((m) => ({ ...toPublicProfile(byId.get(m.profileId)), matchedAt: m.matchedAt }))
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
