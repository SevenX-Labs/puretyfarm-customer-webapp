// Service area check — per documentation/service-area-check-spec.md
// Static client-side lookup, case-insensitive exact match, no partial matching.
// Future: replace static array with a fetch to backend without changing signature.

import { SERVICEABLE_AREAS } from "@/data/serviceableAreas";

export interface ServiceAreaResult {
  serviceable: boolean;
  message: string;
}

export function checkServiceArea(input: string): ServiceAreaResult {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { serviceable: false, message: "Please enter your locality." };
  }

  const normalized = trimmed.toLowerCase();
  const match = SERVICEABLE_AREAS.some(
    (area) => area.toLowerCase() === normalized
  );

  return match
    ? { serviceable: true, message: "Great news — we deliver to your area!" }
    : {
        serviceable: false,
        message:
          "We don't deliver here yet. Message us on WhatsApp to check upcoming coverage.",
      };
}
