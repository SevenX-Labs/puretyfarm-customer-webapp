import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({
        success: true,
        addresses: [],
      });
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

    const cleanPin = pincode ? pincode.replace(/\D/g, "").slice(0, 6) : "492001";
    const finalPin = cleanPin.length === 6 ? cleanPin : "492001";
    const serviceCheck = await db.checkServiceability(finalPin, locality ? locality.trim() : "Raipur");

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
