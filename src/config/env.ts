export const ENV = {
  PLAY_STORE_URL:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=com.puretyfarm.customer",
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917587347266",
  WHATSAPP_DISPLAY:
    process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "+91 75873 47266",
  PHONE_NUMBER: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "+916260310919",
  PHONE_DISPLAY: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+91 62603 10919",
  SUPPORT_EMAIL:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "care@puretyfarm.in",
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretyfarm.com",
} as const;

