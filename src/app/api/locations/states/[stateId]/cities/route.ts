import { NextRequest, NextResponse } from "next/server";
import { fetchCitiesFromSupabase } from "@/server/locations/supabaseLocationService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ stateId: string }> }
) {
  try {
    const { stateId } = await context.params;
    const cities = await fetchCitiesFromSupabase(stateId);
    return NextResponse.json(cities, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("[GET /api/locations/states/[stateId]/cities error]", err);
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
}
