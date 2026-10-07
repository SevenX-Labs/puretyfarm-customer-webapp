import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://puretyfarm.com"),
  NEXT_PUBLIC_API_URL: z.string().default("https://api-puretyfarm.onrender.com"),
  NEXT_PUBLIC_API_MODE: z.enum(["proxy", "direct"]).default("proxy"),
  NEXT_PUBLIC_PLAY_STORE_URL: z
    .string()
    .url()
    .default("https://play.google.com/store/apps/details?id=com.puretyfarm.customer"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default("917587347266"),
  NEXT_PUBLIC_WHATSAPP_DISPLAY: z.string().default("+91 75873 47266"),
  NEXT_PUBLIC_PHONE_NUMBER: z.string().default("+916260310919"),
  NEXT_PUBLIC_PHONE_DISPLAY: z.string().default("+91 62603 10919"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().default("care@puretyfarm.in"),
});

const serverEnvSchema = clientEnvSchema.extend({
  AUTH_SECRET: z.string().min(16).default("puretyfarm-production-jwt-secret-key-min-32-chars!"),
  OTP_PROVIDER: z.enum(["console", "msg91", "twilio"]).default("console"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GEOCODER_PROVIDER: z.enum(["nominatim", "google"]).default("nominatim"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  BACKEND_URL: z.string().url().default("https://api-puretyfarm.onrender.com"),
});

function validateEnv() {
  const isServer = typeof window === "undefined";
  const rawEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api-puretyfarm.onrender.com",
    NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
    NEXT_PUBLIC_PLAY_STORE_URL: process.env.NEXT_PUBLIC_PLAY_STORE_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_WHATSAPP_DISPLAY: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY,
    NEXT_PUBLIC_PHONE_NUMBER: process.env.NEXT_PUBLIC_PHONE_NUMBER,
    NEXT_PUBLIC_PHONE_DISPLAY: process.env.NEXT_PUBLIC_PHONE_DISPLAY,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    OTP_PROVIDER: process.env.OTP_PROVIDER,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    GEOCODER_PROVIDER: process.env.GEOCODER_PROVIDER,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    BACKEND_URL: process.env.BACKEND_URL || "https://api-puretyfarm.onrender.com",
  };

  if (isServer) {
    const parsed = serverEnvSchema.safeParse(rawEnv);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.format());
      throw new Error("Invalid environment variables");
    }
    return parsed.data;
  }

  const parsed = clientEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.error("Invalid client environment variables:", parsed.error.format());
    throw new Error("Invalid client environment variables");
  }
  return parsed.data as z.infer<typeof serverEnvSchema>;
}

export const env = validateEnv();

// Backwards-compatible alias for existing imports
export const ENV = {
  PLAY_STORE_URL: env.NEXT_PUBLIC_PLAY_STORE_URL,
  WHATSAPP_NUMBER: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY: env.NEXT_PUBLIC_WHATSAPP_DISPLAY,
  PHONE_NUMBER: env.NEXT_PUBLIC_PHONE_NUMBER,
  PHONE_DISPLAY: env.NEXT_PUBLIC_PHONE_DISPLAY,
  SUPPORT_EMAIL: env.NEXT_PUBLIC_SUPPORT_EMAIL,
  SITE_URL: env.NEXT_PUBLIC_SITE_URL,
} as const;
