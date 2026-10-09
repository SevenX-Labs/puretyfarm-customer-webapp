const ACCESS_TOKEN_KEY = "purety_access_token";
const REFRESH_TOKEN_KEY = "purety_refresh_token";

let accessTokenInMemory: string | null = null;
let accessTokenRefreshToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    if (accessTokenInMemory) return accessTokenInMemory;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        accessTokenInMemory = stored;
        return stored;
      }
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }): void {
    if (!accessToken || !refreshToken) {
      throw new Error("Both access and refresh tokens are required.");
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    accessTokenInMemory = accessToken;
    accessTokenRefreshToken = refreshToken;
  },

  setAccessToken(accessToken: string, refreshToken?: string): void {
    accessTokenInMemory = accessToken || null;
    accessTokenRefreshToken = refreshToken || null;
    if (typeof window !== "undefined") {
      if (accessToken) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      } else {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      if (refreshToken) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  },

  getAccessTokenForRefresh(refreshToken: string): string | null {
    if (accessTokenRefreshToken === refreshToken && accessTokenInMemory) {
      return accessTokenInMemory;
    }
    return this.getAccessToken();
  },

  clearTokens(): void {
    accessTokenInMemory = null;
    accessTokenRefreshToken = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  hasAccessToken(): boolean {
    return Boolean(this.getAccessToken());
  },
};
