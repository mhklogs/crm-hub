"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessagesSquare, Video, Activity } from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Unified Timeline",
    desc: "Every call, message, SMS, video room and note — chronologically linked to the contact.",
  },
  {
    icon: MessagesSquare,
    title: "Teams Integration",
    desc: "Send and receive via Microsoft Teams right from the CRM. Presence and chat built in.",
  },
  {
    icon: Phone,
    title: "Click-to-Dial & SMS",
    desc: "Twilio-powered calls and SMS. One click. Auto-logged. No context switching.",
  },
  {
    icon: Video,
    title: "Video Rooms",
    desc: "Launch a Zoom-style LiveKit room per contact. Share a link. Done.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const devLogin = async () => {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || `${name || "demo"}@crmhub.local` }),
    });
    if (res.ok) router.push("/dashboard");
    else setErr("Dev login unavailable — Microsoft auth may already be configured. Use Sign in with Microsoft.");
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="hero-glow flex flex-col items-center justify-center gap-8 px-4 pt-24 pb-16 text-center">
        <div className="fade-up max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            CRM <span className="grad-text">Hub</span>
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            The Teams-connected workspace for calls, messaging, video rooms and deal tracking —
            everything logged to a single per-contact timeline.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-[var(--muted)]">
            <span className="chip border-[var(--line)]">Microsoft Teams</span>
            <span className="chip border-[var(--line)]">Twilio Dialer + SMS</span>
            <span className="chip border-[var(--line)]">LiveKit Video</span>
            <span className="chip border-[var(--line)]">SQLite / Supabase</span>
          </div>
        </div>

        {/* Features */}
        <div className="fade-up grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card flex items-start gap-3 p-4 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Login form */}
      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="card w-full max-w-sm p-8 fade-up">
          <h2 className="text-lg font-bold">
            Sign in to <span className="grad-text">CRM Hub</span>
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Microsoft auth is the primary login. Dev login lets you explore in mock mode
            without any keys — calls, SMS, Teams and video are simulated locally.
          </p>

          {err && (
            <div className="mt-4 rounded-lg border border-red-500/50 p-2 text-xs text-red-300">{err}</div>
          )}

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              devLogin();
            }}
          >
            <a className="btn btn-primary w-full justify-center" href="/api/auth/microsoft">
              Sign in with Microsoft Teams
            </a>
            <div className="my-1 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span className="h-px flex-1 bg-[var(--line)]" /> or dev login <span className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className="input"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn w-full justify-center" disabled={busy}>
              {busy ? "Signing in…" : "Enter app (dev)"}
            </button>
          </form>

          <p className="mt-6 text-xs text-[var(--muted)]">
            Microsoft login needs a Microsoft 365 Business/Enterprise tenant (Entra app registration). Until then, Dev
            login lets you explore the full CRM experience with mock Teams/dialer/video.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--muted)]">
        CRM Hub &mdash; Teams-connected CRM, dialer &amp; video
      </footer>
    </div>
  );
}