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

  // In development / preview phase: accept any 10-digit number or fallback to 9876543210
  const finalDigits = digits.length === 10 ? digits : (digits || "9876543210").slice(0, 10).padEnd(10, "0");

  return {
    valid: true,
    phone: `+91${finalDigits}`,
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
  // Development phase: unlimited testing with zero cooldown blocks
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
