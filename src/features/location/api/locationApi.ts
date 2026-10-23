import { apiClient } from "@/lib/api/client";

export interface DetectLocationResponse {
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  area: string;
  pincode: string;
  country: string;
  formattedAddress: string;
}

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

export interface CreateAddressPayload {
  fullName: string;
  mobile: string;
  houseNumber: string;
  buildingName?: string;
  streetName?: string;
  landmark?: string;
  stateId: string;
  cityId: string;
  areaId: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  houseNumber: string;
  buildingName?: string;
  streetName?: string;
  landmark?: string;
  stateId: string;
  cityId: string;
  areaId: string;
  state: string;
  city: string;
  area: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Client-side in-memory cache for location catalogs (states, cities, areas)
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedStates: { data: StateItem[]; expiresAt: number } | null = null;
let statesPromise: Promise<StateItem[]> | null = null;

const cachedCities = new Map<string, { data: CityItem[]; expiresAt: number }>();
const citiesPromises = new Map<string, Promise<CityItem[]>>();

const cachedAreas = new Map<string, { data: AreaItem[]; expiresAt: number }>();
const areasPromises = new Map<string, Promise<AreaItem[]>>();

// Client-side addresses cache to prevent duplicate fetches across AuthContext and OnboardingFlow
let cachedAddresses: CustomerAddress[] | null = null;
let addressesPromise: Promise<CustomerAddress[]> | null = null;

export const locationApi = {
  /**
   * 2.1 Detect Location from GPS Coordinates (Reverse-geocoding)
   */
  async detectLocation(payload: {
    latitude: number;
    longitude: number;
  }): Promise<DetectLocationResponse> {
    return apiClient.post<DetectLocationResponse>(
      "/api/locations/detect",
      payload
    );
  },

  /**
   * 2.2 Get Active States from Server with in-memory cache
   */
  async getStates(forceRefresh = false): Promise<StateItem[]> {
    const now = Date.now();
    if (!forceRefresh && cachedStates && cachedStates.expiresAt > now) {
      return cachedStates.data;
    }
    if (!forceRefresh && statesPromise) {
      return statesPromise;
    }

    statesPromise = apiClient.get<StateItem[]>("/api/locations/states", {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    }).then((states) => {
      cachedStates = { data: states, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS };
      return states;
    }).finally(() => {
      statesPromise = null;
    });

    return statesPromise;
  },

  /**
   * 2.3 Get Active Cities in a State from Server with in-memory cache
   */
  async getCities(
    stateId: string,
    forceRefresh = false,
    signal?: AbortSignal
  ): Promise<CityItem[]> {
    const now = Date.now();
    const cached = cachedCities.get(stateId);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.data;
    }
    const inFlight = citiesPromises.get(stateId);
    if (!forceRefresh && inFlight) {
      return inFlight;
    }

    const promise = apiClient
      .get<CityItem[]>(
        `/api/locations/states/${encodeURIComponent(stateId)}/cities`,
        {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
          signal,
        }
      )
      .then((cities) => {
        cachedCities.set(stateId, {
          data: cities,
          expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
        });
        return cities;
      })
      .finally(() => {
        citiesPromises.delete(stateId);
      });

    citiesPromises.set(stateId, promise);
    return promise;
  },

  /**
   * 2.4 Get Active Areas in a City from Server with in-memory cache
   */
  async getAreas(
    cityId: string,
    forceRefresh = false,
    signal?: AbortSignal
  ): Promise<AreaItem[]> {
    const now = Date.now();
    const cached = cachedAreas.get(cityId);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.data;
    }
    const inFlight = areasPromises.get(cityId);
    if (!forceRefresh && inFlight) {
      return inFlight;
    }

    const promise = apiClient
      .get<AreaItem[]>(
        `/api/locations/cities/${encodeURIComponent(cityId)}/areas`,
        {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
          signal,
        }
      )
      .then((areas) => {
        cachedAreas.set(cityId, {
          data: areas,
          expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
        });
        return areas;
      })
      .finally(() => {
        areasPromises.delete(cityId);
      });

    areasPromises.set(cityId, promise);
    return promise;
  },

  /**
   * 2.5 Create Customer Address
   */
  async createAddress(payload: CreateAddressPayload): Promise<CustomerAddress> {
    const created = await apiClient.post<CustomerAddress>(
      "/api/v1/customer/addresses",
      payload
    );
    // Optimistically update/invalidate cached addresses
    if (created && created.id) {
      cachedAddresses = cachedAddresses ? [created, ...cachedAddresses.filter((a) => a.id !== created.id)] : [created];
    } else {
      cachedAddresses = null;
    }
    return created;
  },

  /**
   * 2.6 Get All Customer Addresses
   */
  async getAddresses(forceRefresh = false): Promise<CustomerAddress[]> {
    if (!forceRefresh && cachedAddresses) {
      return cachedAddresses;
    }
    if (!forceRefresh && addressesPromise) {
      return addressesPromise;
    }

    addressesPromise = apiClient.get<CustomerAddress[]>("/api/v1/customer/addresses")
      .then((addresses) => {
        cachedAddresses = addresses;
        return addresses;
      })
      .finally(() => {
        addressesPromise = null;
      });

    return addressesPromise;
  },

  async getAddressById(id: string): Promise<CustomerAddress> {
    if (cachedAddresses) {
      const match = cachedAddresses.find((a) => a.id === id);
      if (match) return match;
    }
    return apiClient.get<CustomerAddress>(`/api/v1/customer/addresses/${id}`);
  },

  async updateAddress(
    id: string,
    payload: Partial<CreateAddressPayload>
  ): Promise<CustomerAddress> {
    const updated = await apiClient.patch<CustomerAddress>(
      `/api/v1/customer/addresses/${id}`,
      payload
    );
    if (updated && updated.id) {
      cachedAddresses = cachedAddresses
        ? cachedAddresses.map((a) => (a.id === id ? updated : a))
        : [updated];
    } else {
      cachedAddresses = null;
    }
    return updated;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete<void>(`/api/v1/customer/addresses/${id}`);
    if (cachedAddresses) {
      cachedAddresses = cachedAddresses.filter((a) => a.id !== id);
    }
  },

  clearCatalogCache() {
    cachedStates = null;
    cachedCities.clear();
    cachedAreas.clear();
  },

  clearAddressesCache() {
    cachedAddresses = null;
  },
};
