export const ENV = {
  PLAY_STORE_URL:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=com.puretyfarm.customer",
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919082873561",
  PHONE_NUMBER: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "+919082873561",
  PHONE_DISPLAY: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+91 90828 73561",
  SUPPORT_EMAIL:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "care@puretyfarm.com",
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretyfarm.com",
} as const;

