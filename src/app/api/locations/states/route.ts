import { NextResponse } from "next/server";
import { fetchStatesFromSupabase } from "@/server/locations/supabaseLocationService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const states = await fetchStatesFromSupabase();
    return NextResponse.json(states, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("[GET /api/locations/states error]", err);
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
}
