NOTE: Adapted from "scoring-engine-spec" — this project has no scoring/matching algorithm. The closest equivalent is the brief's requirement to "show service-area availability before asking for other info." This is specified as a lightweight client-side eligibility check.

PURPOSE
Before or alongside CTA interaction, tell the visitor whether PuretyFarm currently delivers to their locality — without any backend call in this phase.
DATA SOURCE (static, current phase)

File: data/serviceableAreas.ts

typescript
export const SERVICEABLE_AREAS: string[] = [
  "Shankar Nagar",
  "Civil Lines",
  "Telibandha",
  "Pandri",
  "Amanaka",
  // full list to be provided by team lead — placeholder for now
];
FUNCTION CONTRACT

File: lib/serviceArea.ts

typescript
export interface ServiceAreaResult {
  serviceable: boolean;
  message: string;
}

export function checkServiceArea(input: string): ServiceAreaResult {
  const normalized = input.trim().toLowerCase();
  const match = SERVICEABLE_AREAS.some(
    (area) => area.toLowerCase() === normalized
  );

  return match
    ? { serviceable: true, message: "Great news — we deliver to your area!" }
    : {
        serviceable: false,
        message: "We don't deliver here yet. Message us on WhatsApp to check upcoming coverage.",
      };
}
MATCHING RULES
Case-insensitive, trimmed exact match against the static list (no fuzzy matching in this phase — avoids false positives).
No partial/substring matching (e.g. "Civil" should NOT match "Civil Lines") to prevent incorrect eligibility claims.
EDGE CASES
Empty input: return { serviceable: false, message: "Please enter your locality." }.
Unlisted locality: message must include a WhatsApp fallback CTA (per brief's requirement for WhatsApp as secondary support channel).
FUTURE EXTENSION (not built now)
Replace the static array lookup with a fetch to a backend endpoint (e.g. GET /api/service-areas?query=) without changing the function signature — callers remain unaffected.