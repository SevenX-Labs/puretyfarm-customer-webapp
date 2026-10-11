const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://pggwlhletpnrexdggqnv.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "******";

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

async function fetchLocationRows(
  source: string,
  urls: string[]
): Promise<Record<string, unknown>[]> {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: "Bearer " + SUPABASE_SECRET_KEY,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[${source}] HTTP error ${res.status}`);
        continue;
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`[${source} error]`, err);
    }
  }

  return [];
}

export async function fetchStatesFromSupabase(): Promise<StateItem[]> {
  const rows = await fetchLocationRows("fetchStatesFromSupabase", [
    `${SUPABASE_URL}/rest/v1/states?select=id,name,isActive&isActive=eq.true&order=name.asc`,
    `${SUPABASE_URL}/rest/v1/states?select=id,name,isActive:is_active&is_active=eq.true&order=name.asc`,
  ]);

  return rows
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
    }))
    .filter((state) => Boolean(state.id && state.name));
}

export async function fetchCitiesFromSupabase(
  stateId: string
): Promise<CityItem[]> {
  if (!stateId) return [];

  const encodedStateId = encodeURIComponent(stateId);
  const rows = await fetchLocationRows("fetchCitiesFromSupabase", [
    `${SUPABASE_URL}/rest/v1/cities?select=id,name,stateId,isActive&isActive=eq.true&stateId=eq.${encodedStateId}&order=name.asc`,
    `${SUPABASE_URL}/rest/v1/cities?select=id,name,stateId:state_id,isActive:is_active&is_active=eq.true&state_id=eq.${encodedStateId}&order=name.asc`,
  ]);

  return rows
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      stateId: String(row.stateId ?? ""),
    }))
    .filter((city) => Boolean(city.id && city.name && city.stateId));
}

export async function fetchAreasFromSupabase(cityId: string): Promise<AreaItem[]> {
  if (!cityId) return [];

  const encodedCityId = encodeURIComponent(cityId);
  const rows = await fetchLocationRows("fetchAreasFromSupabase", [
    `${SUPABASE_URL}/rest/v1/areas?select=id,name,cityId,pincode,isActive&isActive=eq.true&cityId=eq.${encodedCityId}&order=name.asc`,
    `${SUPABASE_URL}/rest/v1/areas?select=id,name,cityId:city_id,pincode,isActive:is_active&is_active=eq.true&city_id=eq.${encodedCityId}&order=name.asc`,
  ]);

  return rows
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      cityId: String(row.cityId ?? ""),
      pincode: String(row.pincode ?? ""),
    }))
    .filter((area) => Boolean(area.id && area.name && area.cityId));
}
