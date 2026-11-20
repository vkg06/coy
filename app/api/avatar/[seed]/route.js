import { PROFILES } from "@/lib/seed.js";

// Placeholder "photo": a deterministic gradient with the person's initial.
// Keeps the demo fully offline (no third-party image hosts).
const PALETTES = [
  ["#ff9a9e", "#fad0c4"], ["#a18cd1", "#fbc2eb"], ["#84fab0", "#8fd3f4"],
  ["#f6d365", "#fda085"], ["#fccb90", "#d57eeb"], ["#9face6", "#74ebd5"],
  ["#ff758c", "#ff7eb3"], ["#43e97b", "#38f9d7"], ["#fa709a", "#fee140"],
  ["#30cfd0", "#a18cd1"],
];

export async function GET(_req, { params }) {
  const idx = PROFILES.findIndex((p) => p.id === params.seed);
  const profile = PROFILES[idx];
  const [a, b] = PALETTES[(idx < 0 ? 0 : idx) % PALETTES.length];
  const initial = profile ? profile.name[0] : "?";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <circle cx="300" cy="330" r="130" fill="rgba(255,255,255,0.35)"/>
  <ellipse cx="300" cy="640" rx="210" ry="170" fill="rgba(255,255,255,0.35)"/>
  <text x="300" y="375" font-family="system-ui,sans-serif" font-size="150" font-weight="700" fill="rgba(255,255,255,0.9)" text-anchor="middle">${initial}</text>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
