import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/store";
import { getGeocoderProvider } from "@/server/geocoding/geocoder";

// In-memory rate limiting for serviceability checks (max 40 requests per IP per hour)
const ipRateMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  if (
    process.env.NODE_ENV !== "production" &&
    (ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip === "localhost")
  ) {
    return false;
  }
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    ipRateMap.set(ip, { count: 1, expiresAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 40) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many serviceability checks. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { lat, lng, pincode, addressText } = body;

    let targetPincode: string | undefined = pincode;
    let targetArea: string | undefined = addressText;
    let detectedAddress: string | undefined;

    // 1. If lat or lng provided, validate coordinates and reverse-geocode
    if (lat !== undefined || lng !== undefined) {
      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid coordinates provided. Latitude must be between -90 and 90, and longitude between -180 and 180.",
          },
          { status: 400 }
        );
      }

      const geocoder = getGeocoderProvider();
      const geocoded = await geocoder.reverseGeocode(lat, lng);

      if (geocoded) {
        targetPincode = geocoded.pincode || targetPincode;
        targetArea = geocoded.areaName || targetArea;
        detectedAddress = geocoded.formattedAddress;
      }
    }

    // Clean up 6-digit pincode if present
    if (targetPincode) {
      targetPincode = targetPincode.replace(/\D/g, "").slice(0, 6);
    }

    // 2. Check serviceability against ServiceArea table
    const result = await db.checkServiceability(targetPincode, targetArea);

    return NextResponse.json({
      success: true,
      serviceable: result.serviceable,
      areaName: result.areaName || targetArea,
      pincode: result.pincode || targetPincode,
      detectedAddress,
      reason: result.reason,
    });
  } catch (err) {
    console.error("[serviceability check error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify serviceability. Please try manual entry.",
      },
      { status: 500 }
    );
  }
}
