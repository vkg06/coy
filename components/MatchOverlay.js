"use client";

export default function MatchOverlay({ profile, onClose, onViewMatches }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="It's a match">
      <div className="overlay-box">
        <div className="confetti" aria-hidden>🎉</div>
        <h1>It&apos;s a match!</h1>
        <p className="overlay-sub">You and {profile.name} liked each other.</p>
        <div className="match-pair">
          <div className="pair-avatar pair-you">You</div>
          <img className="pair-avatar" src={profile.photo} alt={profile.name} />
        </div>
        <button className="btn btn-primary" onClick={onViewMatches}>View matches</button>
        <button className="btn btn-ghost" onClick={onClose}>Keep swiping</button>
      </div>
    </div>
  );
}
