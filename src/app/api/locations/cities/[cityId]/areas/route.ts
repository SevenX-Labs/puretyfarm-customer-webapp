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
    return NextResponse.json([], { status: 200 });
  }
}
