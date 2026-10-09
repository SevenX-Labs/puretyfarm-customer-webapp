const SUPABASE_URL = process.env.SUPABASE_URL || "https://pggwlhletpnrexdggqnv.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ3dsaGxldHBucmV4ZGdncW52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg0MDU3MCwiZXhwIjoyMTA2NDE2NTcwfQ.pkG9tHrqVye_1tNk8Z5jyxDCvGzR9QCdvrR-tSVyeo4";

export interface StateItem {
  id: string;
  name: string;
}

export interface CityItem {
  id: string;
  name: string;
  stateId: string;
}

export interface AreaItem {
  id: string;
  name: string;
  cityId: string;
  pincode: string;
}

// Fallback catalog in case of emergency connectivity issue
const FALLBACK_STATES: StateItem[] = [
  { id: "8277a58a-ff91-4163-b8a7-1c915af8d859", name: "Maharastra" },
];

const FALLBACK_CITIES: CityItem[] = [
  { id: "6875fc90-fe1d-4307-9271-bdf4b505c562", name: "Dombivali", stateId: "8277a58a-ff91-4163-b8a7-1c915af8d859" },
];

const FALLBACK_AREAS: AreaItem[] = [
  { id: "c89be936-7674-4e5b-b78d-bb844cff4160", name: "Star Colony", cityId: "6875fc90-fe1d-4307-9271-bdf4b505c562", pincode: "421204" },
];

export async function fetchStatesFromSupabase(): Promise<StateItem[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/states?select=id,name,isActive&isActive=eq.true&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        next: { revalidate: 30 },
      }
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_STATES;
  } catch (err) {
    console.error("[fetchStatesFromSupabase error]", err);
    return FALLBACK_STATES;
  }
}

export async function fetchCitiesFromSupabase(stateId: string): Promise<CityItem[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cities?select=id,name,stateId,isActive&isActive=eq.true&stateId=eq.${stateId}&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        next: { revalidate: 30 },
      }
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0
      ? data
      : FALLBACK_CITIES.filter((c) => c.stateId === stateId);
  } catch (err) {
    console.error("[fetchCitiesFromSupabase error]", err);
    return FALLBACK_CITIES.filter((c) => c.stateId === stateId);
  }
}

export async function fetchAreasFromSupabase(cityId: string): Promise<AreaItem[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/areas?select=id,name,cityId,pincode,isActive&isActive=eq.true&cityId=eq.${cityId}&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        next: { revalidate: 30 },
      }
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0
      ? data.map((a: { id: string; name: string; cityId: string; pincode?: string | null }) => ({
          id: a.id,
          name: a.name,
          cityId: a.cityId,
          pincode: a.pincode || "",
        }))
      : FALLBACK_AREAS.filter((a) => a.cityId === cityId);
  } catch (err) {
    console.error("[fetchAreasFromSupabase error]", err);
    return FALLBACK_AREAS.filter((a) => a.cityId === cityId);
  }
}
