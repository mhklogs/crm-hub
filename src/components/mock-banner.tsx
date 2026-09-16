"use client";

import { useEffect, useState } from "react";

type Status = {
  auth: boolean;
  teams: boolean;
  dialer: boolean;
  video: boolean;
};

const LIVE = "LIVE";
const MOCK = "mock";

/**
 * A compact, dismissible banner that makes mock mode explicit. Every
 * integration that hasn't been configured shows so users know calls,
 * SMS, Teams messages and video rooms are simulated locally.
 */
export function MockModeBanner() {
  const [status, setStatus] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status || dismissed) return null;

  const chips: { label: string; live: boolean }[] = [
    { label: "Dialer", live: status.dialer },
    { label: "SMS", live: status.dialer },
    { label: "Teams", live: status.teams },
    { label: "Video", live: status.video },
  ];
  const anyMock = chips.some((c) => !c.live);
  if (!anyMock) return null;

  return (
    <div className="fade-up flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      <span className="font-semibold">Mock mode</span>
      <span className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`chip ${c.live ? "border-emerald-500/40 text-emerald-300" : "border-amber-500/40"}`}
          >
            {c.label} · {c.live ? LIVE : MOCK}
          </span>
        ))}
      </span>
      <span className="text-amber-200/70">
        Add the API keys (see README) to go live — no code changes needed.
      </span>
      <button
        className="ml-auto rounded-md px-1.5 text-amber-200/80 hover:text-amber-100"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss mock mode notice"
      >
        ✕
      </button>
    </div>
  );
}