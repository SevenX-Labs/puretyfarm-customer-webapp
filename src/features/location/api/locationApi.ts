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

export const locationApi = {
  /**
   * 2.1 Detect Location from GPS Coordinates (Server reverse-geocoding)
   */
  async detectLocation(payload: {
    latitude: number;
    longitude: number;
  }): Promise<DetectLocationResponse> {
    return apiClient.post<DetectLocationResponse>(
      "/api/v1/customer/locations/detect",
      payload
    );
  },

  /**
   * 2.2 Get Active States from Server
   */
  async getStates(): Promise<StateItem[]> {
    return apiClient.get<StateItem[]>("/api/v1/customer/locations/states");
  },

  /**
   * 2.3 Get Active Cities in a State from Server
   */
  async getCities(stateId: string): Promise<CityItem[]> {
    return apiClient.get<CityItem[]>(
      `/api/v1/customer/locations/states/${stateId}/cities`
    );
  },

  /**
   * 2.4 Get Active Areas in a City from Server
   */
  async getAreas(cityId: string): Promise<AreaItem[]> {
    return apiClient.get<AreaItem[]>(
      `/api/v1/customer/locations/cities/${cityId}/areas`
    );
  },

  /**
   * 2.5 Create Customer Address
   */
  async createAddress(payload: CreateAddressPayload): Promise<CustomerAddress> {
    return apiClient.post<CustomerAddress>(
      "/api/v1/customer/addresses",
      payload
    );
  },

  /**
   * 2.6 Get All Customer Addresses
   */
  async getAddresses(): Promise<CustomerAddress[]> {
    return apiClient.get<CustomerAddress[]>("/api/v1/customer/addresses");
  },

  async getAddressById(id: string): Promise<CustomerAddress> {
    return apiClient.get<CustomerAddress>(`/api/v1/customer/addresses/${id}`);
  },

  async updateAddress(
    id: string,
    payload: Partial<CreateAddressPayload>
  ): Promise<CustomerAddress> {
    return apiClient.patch<CustomerAddress>(
      `/api/v1/customer/addresses/${id}`,
      payload
    );
  },

  async deleteAddress(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/customer/addresses/${id}`);
  },
};
