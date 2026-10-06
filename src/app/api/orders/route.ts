import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orders = await db.getOrdersByUserId(session.userId);
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("[orders GET error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
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
    const { items, totalAmount, deliveryAddress, status = "Placed" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.street) {
      return NextResponse.json(
        { success: false, error: "Valid delivery address is required." },
        { status: 400 }
      );
    }

    const newOrder = await db.createOrder({
      userId: session.userId,
      items,
      totalAmount: Number(totalAmount) || 0,
      status,
      deliveryAddress,
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (err) {
    console.error("[orders POST error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to place order." },
      { status: 500 }
    );
  }
}
