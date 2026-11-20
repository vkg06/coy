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

# Part A: Two Feature Suggestions for Coy

After thinking about Coy's concept and how users interact with the platform, I came up with two features that I believe could make the experience better and more comfortable for users.

### 1. Conversation Starters After a Mutual Match

**What:** 

When two people get a mutual match, Coy could show a few simple conversation starters or fun questions to help them break the ice. For example, users could see suggestions like "What's something that always makes you smile?" or "Who do you think made the first move?"

**Why I think this is useful:**

Getting a mutual match is exciting, but sometimes the hardest part is knowing what to say next. Not everyone feels comfortable starting a conversation, even when both people are interested. I think these suggestions could make that first step easier and encourage users to take things forward instead of just seeing a match and leaving the app.

### 2. Private Hide List

**What:**

Coy could allow users to add specific phone numbers or contacts to a private hide list. People on this list would not be able to discover the user's profile, and the user would not be shown their profile either.

**Why I think this is useful:**

Privacy is especially important in an app like Coy. Users might not want their profile to appear to certain people, such as family members, colleagues, ex-partners or people they already know. Having this option would give users more control over who can discover them and make them feel safer using the platform.

### Final Thoughts

I believe these two features could improve Coy in different ways. Conversation starters would make mutual matches more meaningful, while the private hide list would give users greater control over their privacy. Both features would add value without changing the basic idea behind Coy.
