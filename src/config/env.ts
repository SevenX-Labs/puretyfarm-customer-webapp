// Typed environment accessors
// All env vars are NEXT_PUBLIC_ prefixed for client-side access

export const ENV = {
  PLAY_STORE_URL:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=REPLACE_ME",
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "91XXXXXXXXXX",
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretyfarm.example.com",
} as const;
