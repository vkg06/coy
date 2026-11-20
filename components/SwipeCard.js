"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";

const THRESHOLD = 110; // px of horizontal drag that commits a swipe
const FLY_DISTANCE = 700;

/**
 * Top card of the deck. Supports pointer drag (touch + mouse) and an imperative
 * `fling("like" | "pass")` used by the buttons and keyboard shortcuts.
 */
const SwipeCard = forwardRef(function SwipeCard({ profile, onSwipe }, ref) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState(null); // "like" | "pass" | null
  const start = useRef(null);
  const done = useRef(false);

  function commit(action) {
    if (done.current) return;
    done.current = true;
    setLeaving(action);
    // Let the fly-out animation play before the parent removes the card.
    setTimeout(() => onSwipe(action), 260);
  }

  useImperativeHandle(ref, () => ({ fling: commit }));

  function onPointerDown(e) {
    if (done.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(e) {
    if (!start.current || done.current) return;
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3, active: true });
  }

  function onPointerUp() {
    if (!start.current || done.current) return;
    start.current = null;
    if (drag.x > THRESHOLD) commit("like");
    else if (drag.x < -THRESHOLD) commit("pass");
    else setDrag({ x: 0, y: 0, active: false }); // spring back
  }

  const x = leaving ? (leaving === "like" ? FLY_DISTANCE : -FLY_DISTANCE) : drag.x;
  const rot = x / 18;
  const likeOpacity = leaving === "like" ? 1 : Math.min(Math.max(drag.x / THRESHOLD, 0), 1);
  const nopeOpacity = leaving === "pass" ? 1 : Math.min(Math.max(-drag.x / THRESHOLD, 0), 1);

  return (
    <article
      className="card"
      style={{
        transform: `translate(${x}px, ${drag.y}px) rotate(${rot}deg)`,
        transition: drag.active && !leaving ? "none" : "transform 0.26s ease, opacity 0.26s ease",
        opacity: leaving ? 0 : 1,
        cursor: drag.active ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      <img className="card-photo" src={profile.photo} alt="" draggable={false} />
      <div className="stamp stamp-like" style={{ opacity: likeOpacity }}>LIKE</div>
      <div className="stamp stamp-nope" style={{ opacity: nopeOpacity }}>PASS</div>

      <div className="card-info">
        <h2>
          {profile.name}, <span className="age">{profile.age}</span>
        </h2>
        <p className="place">📍 {profile.place}</p>
        <p className="bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </article>
  );
});

export default SwipeCard;
