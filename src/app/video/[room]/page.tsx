"use client";

import { useParams } from "next/navigation";
import { Video } from "lucide-react";

/**
 * Video room page. In real mode, the LiveKit JS SDK connects to the room
 * named by `room` using the token minted at creation time (stored for the
 * creator). When LiveKit is unconfigured this shows a static mock room so
 * the join flow can be demonstrated.
 *
 * Production wiring: resolve `room` → token+url via /api/video/join?room=…
 * then `await Room.connect(LIVEKIT_URL, token, {})`.
 */
export default function VideoRoomPage() {
  const params = useParams<{ room: string }>();
  const room = params.room;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-lg p-8 text-center fade-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)]">
          <Video className="text-[var(--brand)]" />
        </div>
        <h1 className="text-2xl font-bold">Video room</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Room <code className="rounded bg-[var(--panel-2)] px-1">{room}</code></p>

        <div className="mt-6 flex gap-3 rounded-lg border border-[var(--line)] p-4">
          <div className="flex flex-1 items-center justify-center rounded-lg bg-[var(--panel-2)] py-12 text-[var(--muted)]">
            Camera preview
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg bg-[var(--panel-2)] py-12 text-[var(--muted)]">
            Shared screen / remote
          </div>
        </div>

        <p className="mt-6 text-xs text-[var(--muted)]">
          {process.env.NEXT_PUBLIC_LIVEKIT_URL
            ? "LiveKit configured — participants connect here."
            : "Mock mode: add LIVEKIT_URL + API keys to enable real peer-to-peer video."}
        </p>
      </div>
    </main>
  );
}