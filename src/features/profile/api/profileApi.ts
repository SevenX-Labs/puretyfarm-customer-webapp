import { apiClient } from "@/lib/api/client";

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  profileImageUrl: string | null;
  whatsappNumber: string | null;
  mobile: string;
  email: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  whatsappNumber: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  whatsappNumber?: string;
}

export const profileApi = {
  /**
   * 2.2 Get Current Profile
   * GET /api/v1/customer/profile/me
   * Returns null if 404 (profile not created yet)
   */
  async getProfile(): Promise<CustomerProfile | null> {
    try {
      return await apiClient.get<CustomerProfile>("/api/v1/customer/profile/me");
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * 2.1 Create Customer Profile
   * POST /api/v1/customer/profile/create-profile
   */
  async createProfile(payload: CreateProfileDto): Promise<CustomerProfile> {
    return apiClient.post<CustomerProfile>(
      "/api/v1/customer/profile/create-profile",
      payload
    );
  },

  /**
   * 2.3 Update Profile Details
   * PATCH /api/v1/customer/profile/update-profile
   */
  async updateProfile(payload: UpdateProfileDto): Promise<CustomerProfile> {
    return apiClient.patch<CustomerProfile>(
      "/api/v1/customer/profile/update-profile",
      payload
    );
  },

  /**
   * Smart Save Profile (attempts create; if 409 Conflict, updates)
   */
  async saveProfile(payload: {
    firstName: string;
    lastName: string;
    gender?: string;
    dateOfBirth?: string;
    whatsappNumber?: string;
  }): Promise<CustomerProfile> {
    const rawGender = (payload.gender || "").toUpperCase();
    const gender = (
      rawGender === "FEMALE" ? "FEMALE" : rawGender === "OTHER" ? "OTHER" : "MALE"
    ) as "MALE" | "FEMALE" | "OTHER";

    const dateOfBirth =
      payload.dateOfBirth && payload.dateOfBirth.trim()
        ? payload.dateOfBirth.trim().split("T")[0]
        : "2000-01-01";

    const whatsappNumber = (payload.whatsappNumber || "").trim();

    const dto: CreateProfileDto = {
      firstName: payload.firstName.trim() || "Customer",
      lastName: payload.lastName.trim() || "User",
      gender,
      dateOfBirth,
      whatsappNumber,
    };

    try {
      return await this.updateProfile(dto);
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404) {
        return await this.createProfile(dto);
      }
      if (err?.status === 409 || err?.statusCode === 409) {
        return await this.updateProfile(dto);
      }
      throw err;
    }
  },

  /**
   * Helper to convert base64 data URL to a WebP or JPEG Blob
   */
  dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/webp";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },

  /**
   * 2.4 Upload / Replace Avatar
   * POST /api/v1/customer/profile/update-avatar
   */
  async uploadAvatar(file: Blob | File): Promise<CustomerProfile> {
    const formData = new FormData();
    formData.append("avatar", file, "avatar.webp");
    return apiClient.post<CustomerProfile>(
      "/api/v1/customer/profile/update-avatar",
      formData
    );
  },

  /**
   * Upload Avatar from Data URL (base64 string)
   */
  async uploadAvatarFromDataUrl(dataUrl: string): Promise<CustomerProfile | null> {
    try {
      const blob = this.dataUrlToBlob(dataUrl);
      return await this.uploadAvatar(blob);
    } catch (err) {
      console.warn("Failed to upload avatar from dataUrl:", err);
      return null;
    }
  },

  /**
   * 2.5 Remove Avatar
   * DELETE /api/v1/customer/profile/remove-avatar
   */
  async removeAvatar(): Promise<CustomerProfile> {
    return apiClient.delete<CustomerProfile>(
      "/api/v1/customer/profile/remove-avatar"
    );
  },
};
