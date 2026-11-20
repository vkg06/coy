// JSON-file persistence. Swipes and matches survive page reloads and server restarts.
// Reads/writes are synchronous, so each request's read-modify-write runs to
// completion without interleaving (fine for a single-user, single-process demo).

import fs from "node:fs";
import path from "node:path";
import { emptyDb } from "./logic.js";

function dbPath() {
  return process.env.COY_DB_PATH || path.join(process.cwd(), "data", "db.json");
}

export function readDb() {
  try {
    const raw = fs.readFileSync(dbPath(), "utf8");
    const parsed = JSON.parse(raw);
    return {
      swipes: parsed.swipes && typeof parsed.swipes === "object" ? parsed.swipes : {},
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
    };
  } catch {
    return emptyDb();
  }
}

export function writeDb(db) {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Write to a temp file then rename so a crash can't leave half a JSON file.
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, file);
}
