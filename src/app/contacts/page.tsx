"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import {
  Phone, MessagesSquare, Video, Plus, StickyNote, Search,
} from "lucide-react";

type Contact = {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  ms_email: string | null;
  notes: string | null;
};
type Activity = { id: number; kind: string; direction: string; summary: string; detail: string; created_at: string };

export default function ContactsPage() {
  const { toast, node } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [selected, setSelected] = useState<Contact | null>(null);
  const [q, setQ] = useState("");
  const [showPanel, setShowPanel] = useState<"dial" | "teams" | "sms" | "video" | "note" | "deal" | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", ms_email: "" });
  const [text, setText] = useState("");
  const [smsText, setSmsText] = useState("");

  const reload = useCallback(() => {
    fetch("/api/contacts").then((r) => r.json()).then((d) => {
      setContacts(d.contacts ?? []);
      if (selected) {
        const still = (d.contacts ?? []).find((c: Contact) => c.id === selected.id);
        if (still) setSelected(still);
      }
    });
  }, [selected]);

  useEffect(reload, [reload]);

  const select = async (c: Contact) => {
    setSelected(c);
    const r = await fetch(`/api/activities?contactId=${c.id}`);
    const d = await r.json();
    setActivities((a) => ({ ...a, [c.id]: d.activities ?? [] }));
  };

  const act = async (path: string, body: unknown) => {
    setBusy(true);
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Request failed");
      if (d.provider === "mock") {
        toast("Done — simulated in mock mode (add API keys to go live)");
      } else if (d.provider) {
        toast(`Done — via ${d.provider}`);
      } else {
        toast("Done");
      }
      setShowPanel(null);
      setText("");
      setSmsText("");
      reload();
      if (selected) await select(selected);
      return d;
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const addContact = async () => {
    if (!form.name.trim()) return toast("Name is required", "err");
    await act("/api/contacts", { ...form });
    setForm({ name: "", company: "", email: "", phone: "", ms_email: "" });
  };

  const dial = () => act("/api/dial", { to: selected?.phone ?? text, contactId: selected?.id });
  const sms = () => act("/api/sms", { to: selected?.phone ?? text, message: smsText, contactId: selected?.id });
  const teams = () => act("/api/teams/message", { contactId: selected?.id, message: text });
  const video = () => act("/api/video", { contactId: selected?.id });
  const note = () => act("/api/activities", { contactId: selected?.id, kind: "note", direction: "inbound", summary: text });
  const addDeal = () => act("/api/deals", { contactId: selected?.id, title: text });

  const filtered = contacts.filter((c) =>
    (c.name + " " + (c.company ?? "") + " " + (c.email ?? "") + " " + (c.phone ?? "")).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Contacts & Communication</h1>
        <button className="btn btn-primary" onClick={addContact}>
          <Plus size={14} /> Add contact
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Contact list */}
        <div className="card flex max-h-[calc(100vh-9rem)] flex-col p-2">
          <div className="mb-2 flex items-center gap-2 p-1">
            <Search size={14} className="text-[var(--muted)]" />
            <input className="input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 overflow-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => select(c)}
                className={`flex items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-[var(--panel-2)] ${selected?.id === c.id ? "bg-[var(--panel-2)] border border-[var(--line)]" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-[var(--muted)]">{c.company ?? c.email ?? c.phone ?? "—"}</span>
                </span>
                <Phone size={13} className="ml-2 shrink-0 text-[var(--muted)]" />
              </button>
            ))}
            {filtered.length === 0 && <p className="p-3 text-sm text-[var(--muted)]">No contacts yet.</p>}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex min-h-[400px] flex-col gap-4">
          {!selected && (
            <div className="card flex flex-1 items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
              Select a contact, then call, message on Teams, SMS, or start a video room — every action lands on the timeline.
            </div>
          )}

          {selected && (
            <>
              {/* Action bar */}
              <div className="card flex flex-wrap items-center gap-2 p-3">
                <div className="mr-2 min-w-0">
                  <p className="truncate font-semibold">{selected.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {[selected.company, selected.email, selected.phone].filter(Boolean).join(" · ") || "No details"}
                    {selected.ms_email ? ` · Teams: ${selected.ms_email}` : ""}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={() => { setShowPanel("dial"); setText(selected.phone ?? ""); }}>
                    <Phone size={14} /> Call
                  </button>
                  <button className="btn" onClick={() => { setShowPanel("teams"); setText(""); }}>
                    <MessagesSquare size={14} /> Teams
                  </button>
                  <button className="btn" onClick={() => { setShowPanel("sms"); setSmsText(""); }}>
                    <StickyNote size={14} /> SMS
                  </button>
                  <button className="btn" onClick={() => { setShowPanel("video"); }}>
                    <Video size={14} /> Video room
                  </button>
                </div>
              </div>

              {/* Active composer */}
              {showPanel && (
                <div className="card p-4 fade-up flex flex-col gap-3">
                  {showPanel === "dial" && (
                    <>
                      <label className="text-sm text-[var(--muted)]">Number</label>
                      <input className="input" value={text} onChange={(e) => setText(e.target.value)} />
                      <button className="btn btn-primary w-fit" onClick={dial} disabled={busy}><Phone size={14} /> Call now</button>
                    </>
                  )}
                  {showPanel === "teams" && (
                    <>
                      <label className="text-sm text-[var(--muted)]">
                        Send via Microsoft Teams {!selected.ms_email && <span className="text-amber-400">(set a Teams email on this contact first)</span>}
                      </label>
                      <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" />
                      <button className="btn btn-primary w-fit" onClick={teams} disabled={busy || !selected.ms_email}><MessagesSquare size={14} /> Send in Teams</button>
                    </>
                  )}
                  {showPanel === "sms" && (
                    <>
                      <label className="text-sm text-[var(--muted)]">SMS text</label>
                      <textarea className="textarea" value={smsText} onChange={(e) => setSmsText(e.target.value)} />
                      <button className="btn btn-primary w-fit" onClick={sms} disabled={busy}><StickyNote size={14} /> Send SMS</button>
                    </>
                  )}
                  {showPanel === "video" && (
                    <>
                      <p className="text-sm text-[var(--muted)]">
                        Create a Zoom-style video room. You&apos;ll get a link to share.
                      </p>
                      <button className="btn btn-primary w-fit" onClick={video} disabled={busy}><Video size={14} /> Create & join room</button>
                    </>
                  )}
                  {showPanel === "note" && (
                    <>
                      <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Call note / follow-up…" />
                      <button className="btn btn-primary w-fit" onClick={note} disabled={busy}>Save note</button>
                    </>
                  )}
                  {showPanel === "deal" && (
                    <>
                      <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Deal title (e.g. Retainer – Q3)" />
                      <button className="btn btn-primary w-fit" onClick={addDeal} disabled={busy}>Add deal</button>
                    </>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="card flex-1 overflow-auto p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Timeline — everything in one feed</h2>
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => setShowPanel("note")}><StickyNote size={14} /> Note</button>
                    <button className="btn" onClick={() => setShowPanel("deal")}><Plus size={14} /> Deal</button>
                  </div>
                </div>
                {(activities[selected.id] ?? []).length === 0 && (
                  <p className="text-sm text-[var(--muted)]">No activity for this contact yet.</p>
                )}
                <ul className="flex flex-col gap-2">
                  {(activities[selected.id] ?? []).map((a) => (
                    <li key={a.id} className="rounded-lg border border-[var(--line)] p-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="chip">{a.kind === "team_message" ? "Teams" : a.kind}</span>
                        <span className="text-xs text-[var(--muted)]">{a.direction} · {a.created_at.slice(5, 16)}</span>
                      </span>
                      <p className="mt-1">{a.summary}</p>
                      {a.detail && <p className="text-xs text-[var(--muted)]">{a.detail}</p>}
                    </li>
                  ))}
                </ul>
              </div>

              </>
          )}
        </div>
      </div>

      {/* Add-contact inline form */}
      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-semibold">Add a contact</summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className="input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Microsoft (Teams) email" value={form.ms_email} onChange={(e) => setForm({ ...form, ms_email: e.target.value })} />
          <button className="btn btn-primary" onClick={addContact}><Plus size={14} /> Save</button>
        </div>
      </details>

      {node}
    </div>
  );
}