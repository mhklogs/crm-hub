"use client";

import { useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const [kind, setKind] = useState<"ok" | "err">("ok");
  const toast = (m: string, k: "ok" | "err" = "ok") => {
    setMsg(m);
    setKind(k);
    setTimeout(() => setMsg(null), 3000);
  };
  const node = msg ? (
    <div className="toast fade-up" role="status" aria-live="polite">
      <div
        className={`card px-4 py-2 text-sm ${kind === "err" ? "border-red-500/60 text-red-300" : "border-emerald-500/60 text-emerald-300"}`}
      >
        {msg}
      </div>
    </div>
  ) : null;
  return { toast, node };
}