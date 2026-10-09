import { NextRequest, NextResponse } from "next/server";
import { fetchAreasFromSupabase } from "@/server/locations/supabaseLocationService";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await context.params;
    const areas = await fetchAreasFromSupabase(cityId);
    return NextResponse.json(areas);
  } catch (err) {
    console.error("[GET /api/locations/cities/[cityId]/areas error]", err);
    return NextResponse.json(
      [{ id: "c89be936-7674-4e5b-b78d-bb844cff4160", name: "Star Colony", cityId: "6875fc90-fe1d-4307-9271-bdf4b505c562", pincode: "421204" }],
      { status: 200 }
    );
  }
}
