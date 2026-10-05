import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await db.getOrderById(id, session.userId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("[order detail GET error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}
