import "server-only";
import crypto from "crypto";

const OTP_SECRET = process.env.AUTH_SECRET || "puretyfarm-secret-key-32-chars-long!";
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_VERIFICATION_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 3;
const MAX_SENDS_PER_IP_HOUR = 10;

// Rate limiting in-memory tracking
interface RateLimitBucket {
  timestamps: number[];
}

const phoneSendLimitMap = new Map<string, RateLimitBucket>();
const ipSendLimitMap = new Map<string, RateLimitBucket>();

function cleanOldTimestamps(bucket: RateLimitBucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
}

/**
 * Normalizes an Indian phone number to canonical E.164: +91XXXXXXXXXX
 * Accepts: "9876543210", "+91 98765 43210", "09876543210", "+919876543210"
 */
export function normalizeIndianPhoneNumber(input: string): {
  valid: boolean;
  phone: string;
  error?: string;
} {
  if (!input || typeof input !== "string") {
    return { valid: false, phone: "", error: "Phone number is required." };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = input.replace(/[\s\-()]/g, "");

  // Match 10-digit number optionally prefixed with +91, 91, or 0
  let digits = "";
  if (cleaned.startsWith("+91")) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    digits = cleaned.slice(1);
  } else {
    digits = cleaned;
  }

  // Check that digits is exactly 10 digits and starts with 6, 7, 8, or 9 (valid Indian mobile ranges)
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      valid: false,
      phone: "",
      error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
    };
  }

  return {
    valid: true,
    phone: `+91${digits}`,
  };
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  // crypto.randomInt is cryptographically strong
  const code = crypto.randomInt(100000, 1000000).toString();
  return code;
}

/**
 * Creates a SHA-256 HMAC hash of the OTP tied to the phone number and secret
 */
export function hashOtp(phone: string, code: string): string {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${phone}:${code}`)
    .digest("hex");
}

/**
 * Verifies if the provided OTP matches the stored hash
 */
export function verifyOtpHash(phone: string, code: string, storedHash: string): boolean {
  const computed = hashOtp(phone, code);
  try {
    // Constant time comparison against timing attacks
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

/**
 * Check and enforce rate limits for sending OTPs
 */
export function checkRateLimit(
  phone: string,
  ip: string,
  lastSentAt?: number
): { allowed: boolean; error?: string; remainingCooldown?: number } {
  const now = Date.now();

  // 1. Enforce 30-second cooldown between resends for the same phone
  if (lastSentAt) {
    const elapsed = now - lastSentAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        allowed: false,
        error: `Please wait ${waitSeconds}s before requesting a new OTP.`,
        remainingCooldown: waitSeconds,
      };
    }
  }

  // 2. Enforce per-phone hourly limit (max 3/hr)
  let phoneBucket = phoneSendLimitMap.get(phone);
  if (!phoneBucket) {
    phoneBucket = { timestamps: [] };
    phoneSendLimitMap.set(phone, phoneBucket);
  }
  cleanOldTimestamps(phoneBucket, 60 * 60 * 1000);

  if (phoneBucket.timestamps.length >= MAX_SENDS_PER_HOUR) {
    return {
      allowed: false,
      error: "Too many OTP requests for this number. Please try again after 1 hour.",
    };
  }

  // 3. Enforce per-IP hourly limit (max 10/hr in prod, bypassed for localhost in dev)
  const isLocalDevIp = process.env.NODE_ENV !== "production" && (ip === "::1" || ip === "127.0.0.1" || ip === "localhost");
  if (ip && ip !== "unknown" && !isLocalDevIp) {
    let ipBucket = ipSendLimitMap.get(ip);
    if (!ipBucket) {
      ipBucket = { timestamps: [] };
      ipSendLimitMap.set(ip, ipBucket);
    }
    cleanOldTimestamps(ipBucket, 60 * 60 * 1000);

    if (ipBucket.timestamps.length >= MAX_SENDS_PER_IP_HOUR) {
      return {
        allowed: false,
        error: "Too many OTP requests from your connection. Please try again after 1 hour.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Record a successfully dispatched OTP for rate limiting
 */
export function recordSendOtp(phone: string, ip: string): void {
  const now = Date.now();
  const phoneBucket = phoneSendLimitMap.get(phone);
  if (phoneBucket) {
    phoneBucket.timestamps.push(now);
  }

  if (ip && ip !== "unknown") {
    const ipBucket = ipSendLimitMap.get(ip);
    if (ipBucket) {
      ipBucket.timestamps.push(now);
    }
  }
}

export const SECURITY_CONSTANTS = {
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  MAX_VERIFICATION_ATTEMPTS,
};
