import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";

export async function PATCH(
  req: NextRequest,
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
    const body = await req.json().catch(() => ({}));

    const updated = await db.updateAddress(id, session.userId, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      address: updated,
    });
  } catch (err) {
    console.error("[addresses PATCH error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update address." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const success = await db.deleteAddress(id, session.userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Address not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (err) {
    console.error("[addresses DELETE error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete address." },
      { status: 500 }
    );
  }
}
