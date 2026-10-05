export interface GeocodeResult {
  pincode?: string;
  areaName?: string;
  city?: string;
  state?: string;
  formattedAddress?: string;
}

export interface GeocoderProvider {
  name: string;
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null>;
}

// In-memory cache for coordinates (~100m radius quantization) to respect rate limits
const geocodeCache = new Map<string, { result: GeocodeResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(lat: number, lng: number): string {
  // 3 decimal places is ~110m precision
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * OpenStreetMap Nominatim / Photon Geocoder
 * Free, zero-API-key development and production fallback.
 * Sends valid User-Agent as required by OSM policy.
 */
export class NominatimGeocoderProvider implements GeocoderProvider {
  name = "nominatim";

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "PuretyFarm-Customer-Webapp/1.0 (care@puretyfarm.in)",
          Accept: "application/json",
        },
        // 5 second timeout
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data || !data.address) {
        return null;
      }

      const address = data.address;
      const pincode = address.postcode ? address.postcode.replace(/\D/g, "").slice(0, 6) : undefined;
      const areaName =
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        address.residential ||
        address.city_district ||
        address.road ||
        "Raipur";

      const city = address.city || address.town || address.county || "Raipur";
      const state = address.state || "Chhattisgarh";

      return {
        pincode,
        areaName,
        city,
        state,
        formattedAddress: data.display_name,
      };
    } catch (err) {
      console.error("[Nominatim Geocoder Error]", err);
      return null;
    }
  }
}

/**
 * Google Maps Geocoding Provider
 * Configured via GOOGLE_MAPS_API_KEY
 */
export class GoogleGeocoderProvider implements GeocoderProvider {
  name = "google";

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("[Google Geocoder] GOOGLE_MAPS_API_KEY not configured. Falling back to Nominatim.");
      return new NominatimGeocoderProvider().reverseGeocode(lat, lng);
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await response.json();

      if (!response.ok || data.status !== "OK" || !data.results?.[0]) {
        return null;
      }

      const first = data.results[0];
      let pincode: string | undefined;
      let areaName: string | undefined;
      let city: string | undefined;
      let state: string | undefined;

      for (const comp of first.address_components) {
        if (comp.types.includes("postal_code")) {
          pincode = comp.long_name.replace(/\D/g, "").slice(0, 6);
        }
        if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
          areaName = comp.long_name;
        }
        if (comp.types.includes("locality")) {
          city = comp.long_name;
        }
        if (comp.types.includes("administrative_area_level_1")) {
          state = comp.long_name;
        }
      }

      return {
        pincode,
        areaName: areaName || "Raipur",
        city: city || "Raipur",
        state: state || "Chhattisgarh",
        formattedAddress: first.formatted_address,
      };
    } catch (err) {
      console.error("[Google Geocoder Error]", err);
      return null;
    }
  }
}

/**
 * Factory to get configured geocoder with automatic in-memory caching
 */
export function getGeocoderProvider(): GeocoderProvider {
  const providerType = (process.env.GEOCODER_PROVIDER || "nominatim").toLowerCase();

  const provider: GeocoderProvider =
    providerType === "google"
      ? new GoogleGeocoderProvider()
      : new NominatimGeocoderProvider();

  // Return wrapped provider with caching
  return {
    name: provider.name,
    async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
      const key = getCacheKey(lat, lng);
      const cached = geocodeCache.get(key);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.result;
      }

      const result = await provider.reverseGeocode(lat, lng);
      if (result) {
        geocodeCache.set(key, { result, timestamp: Date.now() });
      }

      return result;
    },
  };
}
