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

export async function fetchStatesFromSupabase(): Promise<StateItem[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/states?select=id,name,isActive&isActive=eq.true&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.warn(`[fetchStatesFromSupabase] HTTP error ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[fetchStatesFromSupabase error]", err);
    return [];
  }
}

export async function fetchCitiesFromSupabase(stateId: string): Promise<CityItem[]> {
  if (!stateId) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cities?select=id,name,stateId,isActive&isActive=eq.true&stateId=eq.${stateId}&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.warn(`[fetchCitiesFromSupabase] HTTP error ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[fetchCitiesFromSupabase error]", err);
    return [];
  }
}

export async function fetchAreasFromSupabase(cityId: string): Promise<AreaItem[]> {
  if (!cityId) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/areas?select=id,name,cityId,pincode,isActive&isActive=eq.true&cityId=eq.${cityId}&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.warn(`[fetchAreasFromSupabase] HTTP error ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((a: { id: string; name: string; cityId: string; pincode?: string | null }) => ({
      id: a.id,
      name: a.name,
      cityId: a.cityId,
      pincode: a.pincode || "",
    }));
  } catch (err) {
    console.error("[fetchAreasFromSupabase error]", err);
    return [];
  }
}
