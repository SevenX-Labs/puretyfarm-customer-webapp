import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const addresses = await db.getAddressesByUserId(session.userId);
    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (err) {
    console.error("[addresses GET error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses." },
      { status: 500 }
    );
  }
}

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
    const {
      fullName,
      phone,
      alternatePhone,
      street,
      locality,
      landmark,
      city,
      pincode,
      addressType = "Home",
      isDefault,
    } = body;

    if (!fullName?.trim() || !phone?.trim() || !street?.trim() || !locality?.trim() || !pincode?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required address fields." },
        { status: 400 }
      );
    }

    const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    // Server-side strict serviceability re-verification (never trust client result)
    const serviceCheck = await db.checkServiceability(cleanPin, locality.trim());
    if (!serviceCheck.serviceable) {
      return NextResponse.json(
        {
          success: false,
          error:
            serviceCheck.reason ||
            "PuretyFarm milk delivery is not yet available at this pincode/locality. Please enter a serviceable address.",
        },
        { status: 400 }
      );
    }

    const newAddress = await db.createAddress({
      userId: session.userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : "",
      street: street.trim(),
      locality: serviceCheck.areaName || locality.trim(),
      landmark: landmark ? landmark.trim() : "",
      city: (city && city.trim()) || "Raipur",
      pincode: cleanPin,
      addressType: ["Home", "Work", "Other"].includes(addressType) ? addressType : "Home",
      isDefault: Boolean(isDefault),
      isServiceable: true,
    });

    const onboardingStep = await db.getUserOnboardingStatus(session.userId);

    return NextResponse.json({
      success: true,
      message: "Delivery address verified and saved.",
      address: newAddress,
      onboardingStep,
    });
  } catch (err) {
    console.error("[addresses POST error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to save address." },
      { status: 500 }
    );
  }
}
