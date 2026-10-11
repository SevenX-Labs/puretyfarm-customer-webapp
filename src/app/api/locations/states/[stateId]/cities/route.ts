import { NextRequest, NextResponse } from "next/server";
import { fetchCitiesFromSupabase } from "@/server/locations/supabaseLocationService";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ stateId: string }> }
) {
  try {
    const { stateId } = await context.params;
    const cities = await fetchCitiesFromSupabase(stateId);
    return NextResponse.json(cities);
  } catch (err) {
    console.error("[GET /api/locations/states/[stateId]/cities error]", err);
    return NextResponse.json([], { status: 200 });
  }
}
