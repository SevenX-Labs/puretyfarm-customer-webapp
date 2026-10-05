import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
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
    const { planId } = body;

    const chosenPlan = PLANS.find((p) => p.id === planId);
    if (!chosenPlan) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    // 1. Check that user has a serviceable address saved (Server-side enforcement)
    const addresses = await db.getAddressesByUserId(session.userId);
    const defaultAddress = addresses.find((a) => a.isDefault && a.isServiceable !== false) ||
      addresses.find((a) => a.isServiceable !== false);

    if (!defaultAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "A verified serviceable delivery address is required before selecting a plan.",
          redirectStep: "location_pending",
        },
        { status: 400 }
      );
    }

    // 2. Create Order record linked to user and chosen plan with status "Placed"
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
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        alternatePhone: defaultAddress.alternatePhone,
        street: defaultAddress.street,
        locality: defaultAddress.locality,
        city: defaultAddress.city,
        pincode: defaultAddress.pincode,
        addressType: defaultAddress.addressType,
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
