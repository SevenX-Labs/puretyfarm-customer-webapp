// CTA slot functions — per documentation/api-contracts.md
// Current implementation: no network call, direct redirect
// Future: these will be extended to POST to a backend endpoint
// before or alongside the redirect — without changing the calling components.

import { ENV } from "@/config/env";

export function handleTrialClick(): void {
  window.location.href = ENV.PLAY_STORE_URL;
}

export function handleDownloadClick(): void {
  window.location.href = ENV.PLAY_STORE_URL;
}
