/**
 * Voice/SMS dialer via Twilio.
 *
 * When TWILIO_ACCOUNT_SID is blank the dialer runs in MOCK mode — call
 * records are still written to the activity feed so the flow is complete.
 */

import { run } from "@/lib/db";

function mock(): boolean {
  return !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN;
}

export type DialResult = {
  ok: boolean;
  provider: "mock" | "twilio";
  sid?: string;
  status?: string;
  detail?: string;
};

/** Initiates a call (real mode uses Twilio REST API; mock logs locally). */
export async function makeCall(input: {
  to: string;
  from?: string;
  userId: number;
  contactId: number | null;
}): Promise<DialResult> {
  if (mock()) {
    run(
      "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
      input.userId,
      input.contactId,
      "call",
      "outbound",
      `Called ${input.to}`,
      "MOCK: no Twilio credentials configured",
    );
    return { ok: true, provider: "mock", status: "mock-queued" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${accountSid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const base = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  const fromNumber = input.from ?? process.env.TWILIO_FROM_NUMBER ?? "";
  if (!fromNumber) {
    return { ok: false, provider: "twilio", detail: "TWILIO_FROM_NUMBER not set" };
  }

  const body = new URLSearchParams({
    To: input.to,
    From: fromNumber,
    StatusCallback: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/twilio/webhook`,
  });

  const res = await fetch(`${base}/Calls.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = (await res.json()) as { sid?: string; status?: string; message?: string };
  if (!res.ok || !data.sid) {
    return { ok: false, provider: "twilio", detail: data.message ?? "Twilio error", status: data.status };
  }

  run(
    "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
    input.userId,
    input.contactId,
    "call",
    "outbound",
    `Called ${input.to}`,
    `Twilio SID ${data.sid}`,
  );
  return { ok: true, provider: "twilio", sid: data.sid, status: data.status };
}

/** Sends an SMS. Mock mode logs it to the activity feed. */
export async function sendSms(input: {
  to: string;
  message: string;
  userId: number;
  contactId: number | null;
}): Promise<DialResult> {
  if (mock()) {
    run(
      "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
      input.userId,
      input.contactId,
      "sms",
      "outbound",
      `SMS to ${input.to}`,
      input.message,
    );
    return { ok: true, provider: "mock", status: "mock-sent" };
  }

  if (!process.env.TWILIO_FROM_NUMBER) {
    return { ok: false, provider: "twilio", detail: "TWILIO_FROM_NUMBER not set" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${accountSid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const base = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;

  const res = await fetch(`${base}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      To: input.to,
      From: process.env.TWILIO_FROM_NUMBER!,
      Body: input.message,
    }).toString(),
  });
  const data = (await res.json()) as { sid?: string; status?: string; message?: string };
  if (!res.ok || !data.sid) {
    return { ok: false, provider: "twilio", detail: data.message ?? "Twilio error", status: data.status };
  }

  run(
    "INSERT INTO activities (user_id, contact_id, kind, direction, summary, detail) VALUES (?,?,?,?,?,?)",
    input.userId,
    input.contactId,
    "sms",
    "outbound",
    `SMS to ${input.to}`,
    input.message,
  );
  return { ok: true, provider: "twilio", sid: data.sid, status: data.status };
}