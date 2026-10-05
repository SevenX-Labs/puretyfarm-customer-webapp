import { NextRequest, NextResponse } from "next/server";
import {
  normalizeIndianPhoneNumber,
  generateSecureOtp,
  hashOtp,
  checkRateLimit,
  recordSendOtp,
  SECURITY_CONSTANTS,
} from "@/server/auth/security";
import { db } from "@/server/db/store";
import { getOtpProvider } from "@/server/auth/otpProviders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body.phone;

    // 1. Phone validation & normalization
    const { valid, phone, error: phoneError } = normalizeIndianPhoneNumber(rawPhone);
    if (!valid || !phone) {
      return NextResponse.json(
        { success: false, error: phoneError || "Invalid phone number." },
        { status: 400 }
      );
    }

    // Extract client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";

    // 2. Check existing OTP for cooldown
    const existingOtp = await db.getOtp(phone);
    const rateCheck = checkRateLimit(phone, ip, existingOtp?.lastSentAt);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.error || "Rate limit reached.",
          remainingCooldown: rateCheck.remainingCooldown,
        },
        { status: 429 }
      );
    }

    // 3. Generate secure 6-digit OTP & hash it
    const code = generateSecureOtp();
    const codeHash = hashOtp(phone, code);
    const now = Date.now();

    // 4. Save to database
    await db.saveOtp({
      phone,
      codeHash,
      expiresAt: now + SECURITY_CONSTANTS.OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now,
      createdAt: now,
    });

    // 5. Send OTP via configured provider
    const provider = getOtpProvider();
    const sendResult = await provider.send(phone, code);

    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: sendResult.error || "Failed to deliver OTP. Please try again.",
        },
        { status: 500 }
      );
    }

    // 6. Record send for rate-limiting
    recordSendOtp(phone, ip);

    return NextResponse.json({
      success: true,
      message: "6-digit OTP sent successfully.",
      cooldownSeconds: 30,
      // Only included in development console provider mode for demo/testing without SMS gateway
      devOtpHint: sendResult.devOtpHint,
    });
  } catch (err) {
    console.error("[send-otp error]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
