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
    return NextResponse.json(
      [{ id: "6875fc90-fe1d-4307-9271-bdf4b505c562", name: "Dombivali", stateId: "8277a58a-ff91-4163-b8a7-1c915af8d859" }],
      { status: 200 }
    );
  }
}
