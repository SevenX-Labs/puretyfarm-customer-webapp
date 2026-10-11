import { NextResponse } from "next/server";
import { fetchStatesFromSupabase } from "@/server/locations/supabaseLocationService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const states = await fetchStatesFromSupabase();
    return NextResponse.json(states);
  } catch (err) {
    console.error("[GET /api/locations/states error]", err);
    return NextResponse.json([], { status: 200 });
  }
}
