import { NextResponse } from "next/server";

/**
 * Twilio status callback. Twilio POSTs here with CallStatus events
 * (queued/ringing/in-progress/completed). Production: match the CallSid to
 * the activity and update the record.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") ?? "");
  const callStatus = String(form.get("CallStatus") ?? "");
  console.log(`[twilio] call ${callSid} → ${callStatus}`);
  return new NextResponse(`
    <Response>
      <Hangup/>
    </Response>
  `, { headers: { "Content-Type": "text/xml" } });
}