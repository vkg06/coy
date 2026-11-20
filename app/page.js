"use client";

import { useState } from "react";
import Discover from "@/components/Discover.js";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "discover", label: "Discover", icon: "🔥" },
];

export default function Page() {
  const [tab, setTab] = useState("discover");

  return (
    <div className="shell">
      <main className="content">
        {/* Home is intentionally blank: it stands in for Coy's existing experience. */}
        {tab === "home" && <div className="home-blank" aria-label="Home (placeholder)" />}
        {/* Kept mounted so swipe state survives switching tabs. */}
        <div hidden={tab !== "discover"}>
          <Discover active={tab === "discover"} />
        </div>
      </main>

      <nav className="tabbar" role="tablist" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
