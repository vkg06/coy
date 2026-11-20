"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SwipeCard from "./SwipeCard.js";
import MatchOverlay from "./MatchOverlay.js";

export default function Discover({ active }) {
  const [view, setView] = useState("swipe"); // "swipe" | "matches"
  const [feed, setFeed] = useState(null); // null = loading
  const [matches, setMatches] = useState([]);
  const [matchPopup, setMatchPopup] = useState(null);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);
  const busy = useRef(false);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed", { cache: "no-store" });
      const data = await res.json();
      setFeed(data.profiles);
      setError(null);
    } catch {
      setError("Couldn't load profiles. Check your connection and retry.");
      setFeed((f) => f ?? []);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      setMatches(data.matches);
    } catch {
      /* keep the previous list */
    }
  }, []);

  useEffect(() => {
    loadFeed();
    loadMatches();
  }, [loadFeed, loadMatches]);

  const top = feed?.[0];
  const next = feed?.[1];

  // Called by the card once its fly-out animation has finished.
  async function handleSwiped(action) {
    if (!top || busy.current) return;
    busy.current = true;
    const swiped = top;
    setFeed((f) => f.filter((p) => p.id !== swiped.id)); // optimistic: never show it again

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: swiped.id, action }),
      });
      if (res.status === 409) {
        // Already swiped elsewhere (another tab). Resync and move on.
        await loadFeed();
      } else if (!res.ok) {
        throw new Error("swipe failed");
      } else {
        const data = await res.json();
        if (data.matched) {
          setMatchPopup(data.profile);
          loadMatches();
        }
      }
    } catch {
      setError("That swipe didn't save. Please try again.");
      await loadFeed(); // server is the source of truth
    } finally {
      busy.current = false;
    }
  }

  // Desktop keyboard shortcuts: ← pass, → like.
  useEffect(() => {
    if (!active || view !== "swipe" || matchPopup) return;
    function onKey(e) {
      if (e.key === "ArrowRight") cardRef.current?.fling("like");
      if (e.key === "ArrowLeft") cardRef.current?.fling("pass");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, view, matchPopup]);

  async function resetDemo() {
    await fetch("/api/reset", { method: "POST" });
    setMatches([]);
    setMatchPopup(null);
    await loadFeed();
  }

  return (
    <section className="discover">
      <header className="d-header">
        <h1 className="logo">Discover</h1>
        <div className="seg" role="tablist" aria-label="Discover views">
          <button className={view === "swipe" ? "seg-on" : ""} onClick={() => setView("swipe")}>
            Swipe
          </button>
          <button
            className={view === "matches" ? "seg-on" : ""}
            onClick={() => {
              setView("matches");
              loadMatches();
            }}
          >
            Matches{matches.length > 0 && <span className="badge">{matches.length}</span>}
          </button>
        </div>
      </header>

      {error && (
        <div className="toast" role="alert" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {view === "swipe" && (
        <>
          <div className="deck">
            {feed === null && <p className="muted center">Loading…</p>}

            {feed !== null && !top && (
              <div className="empty">
                <div className="empty-emoji">✨</div>
                <h2>You&apos;re all caught up</h2>
                <p className="muted">No more profiles right now. Check back later for new people.</p>
                <button className="btn btn-ghost" onClick={resetDemo}>Reset demo data</button>
              </div>
            )}

            {next && (
              <div className="card card-behind" aria-hidden>
                <img className="card-photo" src={next.photo} alt="" draggable={false} />
              </div>
            )}
            {top && <SwipeCard key={top.id} ref={cardRef} profile={top} onSwipe={handleSwiped} />}
          </div>

          {top && (
            <div className="actions">
              <button className="round round-pass" aria-label="Pass" onClick={() => cardRef.current?.fling("pass")}>
                ✕
              </button>
              <button className="round round-like" aria-label="Like" onClick={() => cardRef.current?.fling("like")}>
                ♥
              </button>
            </div>
          )}
          {top && <p className="hint muted">Drag the card, use the buttons, or press ← / →</p>}
        </>
      )}

      {view === "matches" && (
        <div className="matches">
          {matches.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">💌</div>
              <h2>No matches yet</h2>
              <p className="muted">When you and someone else like each other, they&apos;ll show up here.</p>
            </div>
          ) : (
            <ul className="match-list">
              {matches.map((m) => (
                <li key={m.id} className="match-row">
                  <img src={m.photo} alt="" />
                  <div>
                    <strong>{m.name}, {m.age}</strong>
                    <div className="muted small">📍 {m.place}</div>
                    <div className="muted small">{m.bio}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {matchPopup && (
        <MatchOverlay
          profile={matchPopup}
          onClose={() => setMatchPopup(null)}
          onViewMatches={() => {
            setMatchPopup(null);
            setView("matches");
          }}
        />
      )}
    </section>
  );
}
