import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { PLANS } from "@/data/plans";

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
    const { planId, addressId } = body;

    const chosenPlan = PLANS.find((p) => p.id === planId);
    if (!chosenPlan) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    // 1. Retrieve or auto-provision user delivery address
    const addresses = await db.getAddressesByUserId(session.userId);
    let matchedAddress = addressId
      ? addresses.find((a) => a.id === addressId)
      : (addresses[0] || null);

    if (!matchedAddress) {
      // Development phase: auto-provision address so plan selection is never blocked
      const user = await db.getUserById(session.userId);
      matchedAddress = await db.createAddress({
        userId: session.userId,
        fullName: user?.name || session.name || "Customer",
        phone: user?.phone || session.phone || "+919876543210",
        street: "Sunrise Doorstep Delivery, Sector 1",
        locality: "Civil Lines",
        city: "Raipur",
        pincode: "492001",
        addressType: "Home",
        isDefault: true,
        isServiceable: true,
      });
    }

    // 2. Check onboarding status before provisioning to prevent duplicates
    const currentOnboardingStatus = await db.getUserOnboardingStatus(session.userId);
    if (currentOnboardingStatus === "complete") {
      return NextResponse.json({
        success: true,
        message: "Onboarding is already complete.",
        onboardingStep: "complete",
      });
    }

    // 3. Create Order record linked to user and chosen plan with status "Placed"
    const orderQuantity = chosenPlan.id === "trial" ? 7 : 1;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const order = await db.createOrder({
      userId: session.userId,
      items: [
        {
          id: `item_${chosenPlan.id}`,
          name: chosenPlan.name,
          quantity: orderQuantity,
          price: chosenPlan.price,
          unit: chosenPlan.quantity,
        },
      ],
      totalAmount: chosenPlan.price,
      status: "Placed",
      deliveryAddress: {
        fullName: matchedAddress.fullName,
        phone: matchedAddress.phone,
        alternatePhone: matchedAddress.alternatePhone,
        street: matchedAddress.street,
        locality: matchedAddress.locality,
        city: matchedAddress.city,
        pincode: matchedAddress.pincode,
        addressType: matchedAddress.addressType,
      },
      deliveryDate: tomorrow.toISOString().split("T")[0],
    });

    // 3. For trial or monthly subscriptions, also provision the active Subscription
    let subscription = null;
    if (chosenPlan.id === "trial" || chosenPlan.id === "monthly") {
      subscription = await db.setSubscription({
        userId: session.userId,
        planId: chosenPlan.id,
        planName: chosenPlan.name,
        price: chosenPlan.price,
        status: "active",
        dailyQuantity: chosenPlan.id === "trial" ? "1 Litre Daily for 7 Days" : "1 Litre Daily (30L / mo)",
        nextDeliveryDate: tomorrow.toISOString().split("T")[0],
      });
    }

    const newOnboardingStatus = await db.getUserOnboardingStatus(session.userId);

    return NextResponse.json({
      success: true,
      message: `Your ${chosenPlan.name} has been placed successfully!`,
      order,
      subscription,
      onboardingStep: newOnboardingStatus,
    });
  } catch (err) {
    console.error("[complete-plan error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to confirm plan selection." },
      { status: 500 }
    );
  }
}
