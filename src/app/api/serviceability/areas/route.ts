import { NextResponse } from "next/server";
import { db } from "@/server/db/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const allAreas = await db.getAllServiceAreas();
    const activeAreas = allAreas.filter((a) => a.active);

    return NextResponse.json({
      success: true,
      areas: activeAreas.map((a) => ({
        areaName: a.areaName,
        pincode: a.pincode,
        city: a.city,
      })),
      count: activeAreas.length,
    });
  } catch (err) {
    console.error("[service areas list error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load service areas." },
      { status: 500 }
    );
  }
}
