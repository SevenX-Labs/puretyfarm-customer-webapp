STATUS: No active backend endpoints in this phase. This file defines the CLIENT-SIDE INTERFACE CONTRACT (the "slot" pattern) plus a DRAFT/NOT ACTIVE shape for future backend integration.

CLIENT-SIDE CTA INTERFACE (ACTIVE NOW)

File: lib/cta.ts

typescript
// Current implementation — no network call, direct redirect
export function handleTrialClick(): void {
  window.location.href = process.env.NEXT_PUBLIC_PLAY_STORE_URL!;
}

export function handleDownloadClick(): void {
  window.location.href = process.env.NEXT_PUBLIC_PLAY_STORE_URL!;
}

Contract rules:

Both functions take no arguments and return void.
Both functions must always successfully navigate — no conditional disabling.
Components call these functions only — never construct hrefs inline.
FUTURE BACKEND CONTRACT (DRAFT — NOT ACTIVE, for forward compatibility only)

POST /api/trial-signup (proposed, not implemented)

Request:

json
{
  "source": "trial_cta" | "download_cta",
  "locality": "string (optional, from service area check)",
  "utm_source": "string (optional)",
  "utm_campaign": "string (optional)"
}

Response (200):

json
{
  "success": true,
  "redirectUrl": "string (Play Store URL, server-confirmed)"
}

Response (4xx/5xx):

json
{
  "success": false,
  "error": "string"
}

Future implementation of lib/cta.ts (not built now):

typescript
export async function handleTrialClick(): Promise<void> {
  try {
    const res = await fetch('/api/trial-signup', {
      method: 'POST',
      body: JSON.stringify({ source: 'trial_cta' }),
    });
    const data = await res.json();
    window.location.href = data.redirectUrl ?? FALLBACK_PLAY_STORE_URL;
  } catch {
    window.location.href = FALLBACK_PLAY_STORE_URL; // never block the user
  }
}