# Coy · Discover tab

A swipe-based discovery feature built as a standalone Next.js app. It has a blank **Home** tab (standing in for Coy's existing experience) and a **Discover** tab with swipe cards, an "It's a match!" screen and a Matches view.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  (open in a phone-sized window)
npm test           # 21 unit tests
```

State is stored in `data/db.json` (created on first swipe, git-ignored). The "Reset demo data" button on the empty state, or `POST /api/reset`, clears it so you can demo again.

**Demo tip:** 11 of the 32 seeded profiles have already liked you (e.g. Rohan, Meera, Ishita are in the first few cards). Like them to trigger a match. Like or pass on anyone else and nothing happens.

## Stack

- Next.js 14 (app router), React 18, mobile-first CSS, no UI libraries
- Backend: Next.js API routes
- Data: JSON file (`data/db.json`), written atomically (temp file + rename)
- Tests: Node's built-in test runner

## API

The API routes live under `/api` (Next.js convention).

| Method & path | Body | Returns |
|---|---|---|
| `GET /api/feed` | – | `{ profiles }` – profiles not yet swiped on |
| `POST /api/swipe` | `{ profileId, action: "like" \| "pass" }` | `{ matched, profile? }` – `profile` only when `matched` is true |
| `GET /api/matches` | – | `{ matches }` – mutual matches, newest first |
| `POST /api/reset` | – | demo only; disabled in production unless `ALLOW_RESET=1` |

Errors from `/api/swipe`: `400` invalid action or body, `404` unknown profile, `409` already swiped.

## The privacy promise (core to Coy)

> Never reveal who has liked the user unless it is mutual.

How this is enforced rather than just hoped for:

1. **Like state is not on the profile objects.** "Who liked me" lives only in a server-side set (`LIKED_ME_IDS` in `lib/seed.js`) and is never serialised.
2. **Allow-list serialisation.** Every profile leaving the server goes through `toPublicProfile`, which copies a fixed set of fields. A stray `likedMe` field added later would be dropped.
3. **Responses can't be used as an oracle.** Passing on someone returns `{ matched: false }` whether or not they liked you. Liking someone who hasn't liked you returns the same. The only signal is a real mutual match.
4. **Feed order carries no signal.** The feed is the fixed seed order minus swiped profiles; it is not sorted or boosted by who liked you.
5. Tests cover each of these (`tests/logic.test.js`, "privacy:" cases).

## Other behaviour

- **Swiped profiles never return.** The server rejects a second swipe on the same profile (`409`) and removes it from `/feed` permanently; the client also removes it optimistically and re-syncs from the server on any error. Double swipes cannot create duplicate matches.
- **Persistence.** Swipes and matches survive reloads and server restarts (covered by a test and verified against a restarted production server).
- **Swiping.** Drag with touch or mouse (pointer events), buttons, or ← / → keys. Cards tilt while dragging, show LIKE/PASS stamps, fly off on release past a threshold, and spring back otherwise.
- **Empty states** for no profiles left and no matches yet.

## Structure

```
lib/logic.js     pure matching/feed logic (no I/O, fully unit tested)
lib/store.js     JSON-file persistence
lib/seed.js      32 mock profiles + server-only "liked me" set
app/api/*        feed, swipe, matches, reset, avatar placeholder
components/     Discover (state + views), SwipeCard (gestures), MatchOverlay
tests/           logic + persistence tests
```

## Known limitations / what I'd do next

- Single hard-coded user and a JSON file: no auth, and read-modify-write is only safe for one server process. A real version would use a database with a unique `(user, target)` constraint and do the swipe + match check in one transaction.
- Matches are stored when created; a real version would also handle un-matching and blocking.
- Photos are generated SVG placeholders.
- No component or end-to-end tests for the gesture layer; logic and API behaviour are tested.

---

# Part A: two feature suggestions

> **DRAFT: replace with your own observations.** These were written from the product's stated premise (mutual-only reveal), not from a walkthrough of the app. Add what you actually noticed while going through OTP login, adding a crush, email verification, the invite link and the extra-slots screen, since that is what the assignment asks for.

### 1. Time-boxed icebreaker after a mutual reveal

**What:** When two people match, offer a shared prompt (a pick-one question or a tappable opener) and show a gentle "say hi within 48 hours" window.

**Why:** Mutual reveal is the hard part of Coy; the risk is that it ends in a screen and nothing happens. Matches that never turn into a conversation make the core promise feel empty, and the first message is the most common drop-off point because it feels awkward for shy users, which is exactly Coy's audience. An opener lowers that barrier, and a soft deadline gives a reason to act now. It also gives you a measurable funnel (match → first message).

### 2. "Hide me from" list

**What:** Let users privately list people (by phone number or contact) they never want to be discoverable by, such as exes, relatives or colleagues. It is one-directional and the other person is never told.

**Why:** Any discovery surface can show you to people you'd rather avoid, and users who fear that stop using it. A hide list removes that fear without breaking the mutual-only promise, because nothing is revealed to anyone. It matters more once Discover exists, since profiles are shown to strangers in the same city or college, where overlap with people you know is likely.
