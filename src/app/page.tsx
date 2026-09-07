"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-sm p-8 fade-up">
        <h1 className="text-2xl font-bold">
          CRM <span className="grad-text">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          CRM · Teams messaging · click-to-dial · video — one timeline.
        </p>

        {err && <div className="mt-4 rounded-lg border border-red-500/50 p-2 text-xs text-red-300">{err}</div>}

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
            Enter app (dev)
          </button>
        </form>

        <p className="mt-6 text-xs text-[var(--muted)]">
          Microsoft login needs a Microsoft 365 Business/Enterprise tenant (Entra app registration). Until then, Dev
          login lets you explore with mock Teams/dialer/video.
        </p>
      </div>
    </main>
  );
}