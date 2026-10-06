import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    const subscription = await db.getSubscriptionByUserId(session.userId);
    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (err) {
    console.error("[subscription GET error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription." },
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
    const { planId = "monthly", planName = "Monthly Subscription", price = 2250, dailyQuantity = "1 Litre Daily" } = body;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const subscription = await db.setSubscription({
      userId: session.userId,
      planId,
      planName,
      price,
      status: "active",
      dailyQuantity,
      nextDeliveryDate: tomorrow.toISOString().split("T")[0],
    });

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully.",
      subscription,
    });
  } catch (err) {
    console.error("[subscription POST error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update subscription." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { status } = body;

    if (!["active", "paused", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value." },
        { status: 400 }
      );
    }

    const updated = await db.updateSubscriptionStatus(session.userId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "No active subscription found to modify." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Subscription has been ${status === "paused" ? "paused" : status === "active" ? "resumed" : "cancelled"}.`,
      subscription: updated,
    });
  } catch (err) {
    console.error("[subscription PATCH error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update subscription status." },
      { status: 500 }
    );
  }
}
