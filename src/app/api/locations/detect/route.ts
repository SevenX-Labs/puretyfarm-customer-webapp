import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEOAPIFY_API_KEY || "da65ab7210454aafa4d7c81ddf804041";
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
    );

    if (!res.ok) {
      throw new Error(`Geoapify error: ${res.status}`);
    }

    const data = await res.json();
    const feature = data.features?.[0]?.properties;

    if (!feature) {
      throw new Error("No address details found for coordinates");
    }

    return NextResponse.json({
      latitude,
      longitude,
      state: feature.state || "",
      city: feature.city || feature.county || feature.municipality || "",
      area: feature.suburb || feature.neighbourhood || feature.district || feature.name || "",
      pincode: feature.postcode || "",
      country: feature.country || "India",
      formattedAddress: feature.formatted || `${latitude}, ${longitude}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to detect location";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
