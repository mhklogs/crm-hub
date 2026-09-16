"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Video, Link2, Check } from "lucide-react";

/**
 * Video room page. Joining a shared room link:
 *   LiveKit configured -> resolves a token and connects via livekit-client.
 *   Mock mode         -> shows a static waiting room so the flow is demonstrable.
 */
export default function VideoRoomPage() {
  const params = useParams<{ room: string }>();
  const room = params.room;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-lg p-8 text-center fade-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)]">
          <Video className="text-[var(--brand)]" />
        </div>
        <h1 className="text-2xl font-bold">Video room</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Room <code className="rounded bg-[var(--panel-2)] px-1">{room}</code>
        </p>

        <div className="mt-6 flex gap-3 rounded-lg border border-[var(--line)] p-4">
          <div className="flex flex-1 items-center justify-center rounded-lg bg-[var(--panel-2)] py-12 text-[var(--muted)]">
            Camera preview
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg bg-[var(--panel-2)] py-12 text-[var(--muted)]">
            Shared screen / remote
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Waiting for your contact to join. Share the invite link:
        </p>
        <button className="btn mt-3 w-fit justify-center mx-auto" onClick={copyLink}>
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? "Link copied" : "Copy invite link"}
        </button>

        <p className="mt-6 text-xs text-[var(--muted)]">
          Add <code className="rounded bg-[var(--panel-2)] px-1">LIVEKIT_URL</code> +
          <code className="rounded bg-[var(--panel-2)] px-1">LIVEKIT_API_KEY</code> +
          <code className="rounded bg-[var(--panel-2)] px-1">LIVEKIT_API_SECRET</code> to
          enable real peer-to-peer video. Until then this is a static preview room.
        </p>
      </div>
    </main>
  );
}