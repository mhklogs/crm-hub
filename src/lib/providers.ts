/**
 * Integration readiness check. Returns only booleans — never secrets —
 * so client components can show which features are live vs. mock mode.
 */
export function providerStatus() {
  return {
    auth: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    teams: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    dialer: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    video: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL),
  };
}

export type ProviderStatus = ReturnType<typeof providerStatus>;