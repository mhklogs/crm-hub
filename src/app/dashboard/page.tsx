"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";
import { useToast } from "@/components/toast";
import { Phone, MessagesSquare, Video, Activity, Users, DollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type Deal = { id: number; title: string; value: number; stage: string; created_at: string };
type Activity = { id: number; kind: string; summary: string; detail: string; created_at: string };
type Contact = { id: number; name: string; company: string | null };

export default function DashboardPage() {
  const { toast, node } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [presence, setPresence] = useState("…");

  const load = () => {
    fetch("/api/deals").then((r) => r.json()).then((d) => setDeals(d.deals ?? [])).catch(() => {});
    fetch("/api/activities").then((r) => r.json()).then((d) => setActivity(d.activities ?? [])).catch(() => {});
    fetch("/api/contacts").then((r) => r.json()).then((d) => setContacts(d.contacts ?? [])).catch(() => {});
    fetch("/api/teams/presence").then((r) => r.json()).then((d) => setPresence(d.availability ?? d.provider)).catch(() => {});
  };

  useEffect(load, []);

  const totalPipeline = deals.reduce((a, d) => a + d.value, 0);
  const kindIcon: Record<string, JSX.Element> = {
    team_message: <MessagesSquare size={14} className="text-sky-400" />,
    call: <Phone size={14} className="text-emerald-400" />,
    sms: <Activity size={14} className="text-amber-400" />,
    video: <Video size={14} className="text-fuchsia-400" />,
    note: <Activity size={14} className="text-[var(--muted)]" />,
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Teams presence: {presence}</p>
        </div>
        <Link href="/contacts" className="btn btn-primary">
          <Phone size={14} /> New call / contact
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4 fade-up">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Users size={14} /> Contacts
          </div>
          <p className="mt-2 text-3xl font-bold">{contacts.length}</p>
        </div>
        <div className="card p-4 fade-up">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <DollarSign size={14} /> Pipeline
          </div>
          <p className="mt-2 text-3xl font-bold">${totalPipeline.toLocaleString()}</p>
        </div>
        <div className="card p-4 fade-up">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Activity size={14} /> Today&apos;s activity
          </div>
          <p className="mt-2 text-3xl font-bold">{activity.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
          {activity.length === 0 && <p className="text-sm text-[var(--muted)]">Nothing yet — dial, message or create a video room.</p>}
          <ul className="flex flex-col gap-2">
            {activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-start gap-2 rounded-lg border border-[var(--line)] p-2 text-sm">
                <span className="mt-0.5">{kindIcon[a.kind] ?? kindIcon.note}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{a.summary}</span>
                  {a.detail && <span className="block text-xs text-[var(--muted)] truncate">{a.detail}</span>}
                </span>
                <span className="text-xs text-[var(--muted)]">{a.created_at.slice(5, 16)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Deals</h2>
            <ArrowUpRight size={14} className="text-[var(--muted)]" />
          </div>
          {deals.length === 0 && <p className="mt-2 text-sm text-[var(--muted)]">No deals yet — add one from the contacts area.</p>}
          <ul className="mt-2 flex flex-col gap-2">
            {deals.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-2 text-sm">
                <span>{d.title}</span>
                <span className="flex items-center gap-2">
                  <span className="chip">{d.stage}</span>
                  <span className="font-semibold">${d.value.toLocaleString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {node}
    </div>
  );
}