import { NextRequest, NextResponse } from "next/server";
import {
  normalizeIndianPhoneNumber,
  verifyOtpHash,
  SECURITY_CONSTANTS,
} from "@/server/auth/security";
import { db } from "@/server/db/store";
import {
  createSessionToken,
  getSessionCookieOptions,
} from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone: rawPhone, code, name, email } = body;

    // 1. Validate phone
    const { valid, phone, error: phoneError } = normalizeIndianPhoneNumber(rawPhone);
    if (!valid || !phone) {
      return NextResponse.json(
        { success: false, error: phoneError || "Invalid phone number." },
        { status: 400 }
      );
    }

    // 2. Validate code format
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { success: false, error: "Please enter the complete 6-digit OTP code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();

    // 3. Lookup stored OTP
    const otp = await db.getOtp(phone);
    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          error: "No active OTP found. Please request a new verification code.",
        },
        { status: 400 }
      );
    }

    // 4. Check expiry
    const now = Date.now();
    if (now > otp.expiresAt) {
      await db.deleteOtp(phone);
      return NextResponse.json(
        {
          success: false,
          error: "The verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // 5. Check maximum attempts
    if (otp.attempts >= SECURITY_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
      await db.deleteOtp(phone);
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. This OTP has been invalidated for security. Please request a new code.",
        },
        { status: 429 }
      );
    }

    // 6. Verify hash
    const isValid = verifyOtpHash(phone, cleanCode, otp.codeHash);
    if (!isValid) {
      const attemptsSoFar = await db.incrementOtpAttempts(phone);
      const remaining = SECURITY_CONSTANTS.MAX_VERIFICATION_ATTEMPTS - attemptsSoFar;

      if (remaining <= 0) {
        await db.deleteOtp(phone);
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. This OTP has been invalidated. Please request a new code.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Incorrect OTP. You have ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // 7. Success! Enforce single use: delete the OTP record
    await db.deleteOtp(phone);

    // 8. Lookup or create user
    let user = await db.getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await db.createUser({
        phone,
        name: (name && typeof name === "string") ? name.trim() : "",
        email: (email && typeof email === "string") ? email.trim() : "",
      });
    } else if (name && !user.name) {
      // If user had no name set previously and provided it now
      const updated = await db.updateUser(user.id, {
        name: name.trim(),
        ...(email ? { email: email.trim() } : {}),
      });
      if (updated) user = updated;
    }

    // 9. Generate signed 30-day session token
    const token = await createSessionToken(user);

    // 10. Construct response with secure httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: isNewUser ? "Account created successfully!" : "Signed in successfully!",
      isNewUser: isNewUser || !user.name,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (err) {
    console.error("[verify-otp error]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
