import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/store";
import { normalizeIndianPhoneNumber } from "@/server/auth/security";

import { getCurrentSession } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { pincode, locality } = body;

    const { valid, phone, error } = normalizeIndianPhoneNumber(session.phone);
    if (!valid || !phone) {
      return NextResponse.json(
        { success: false, error: error || "Valid mobile number is required." },
        { status: 400 }
      );
    }

    const cleanPin = pincode ? String(pincode).replace(/\D/g, "").slice(0, 6) : "";
    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Valid 6-digit pincode is required." },
        { status: 400 }
      );
    }

    await db.createWaitlistRequest({
      phone,
      pincode: cleanPin,
      locality: locality ? String(locality).trim() : "",
    });

    return NextResponse.json({
      success: true,
      message: "You're on the waitlist! We will alert you on WhatsApp as soon as deliveries start in your area.",
    });
  } catch (err) {
    console.error("[waitlist error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to record waitlist request." },
      { status: 500 }
    );
  }
}
