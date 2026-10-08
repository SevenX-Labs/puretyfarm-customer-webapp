const ACCESS_TOKEN_KEY = "purety_access_token";
const REFRESH_TOKEN_KEY = "purety_refresh_token";
const LEGACY_ACCESS_COOKIE = "purety_access_token";
const LEGACY_REFRESH_COOKIE = "purety_refresh_token";

let accessTokenInMemory: string | null = null;
let accessTokenRefreshToken: string | null = null;

function removeLegacyCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    removeLegacyCookie(LEGACY_ACCESS_COOKIE);
    removeLegacyCookie(LEGACY_REFRESH_COOKIE);
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
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      removeLegacyCookie(LEGACY_ACCESS_COOKIE);
      removeLegacyCookie(LEGACY_REFRESH_COOKIE);
    }
    accessTokenInMemory = accessToken;
    accessTokenRefreshToken = refreshToken;
  },

  setAccessToken(accessToken: string, refreshToken?: string): void {
    accessTokenInMemory = accessToken;
    accessTokenRefreshToken = refreshToken || null;
  },

  getAccessTokenForRefresh(refreshToken: string): string | null {
    return accessTokenRefreshToken === refreshToken ? accessTokenInMemory : null;
  },

  clearTokens(): void {
    accessTokenInMemory = null;
    accessTokenRefreshToken = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      removeLegacyCookie(LEGACY_ACCESS_COOKIE);
      removeLegacyCookie(LEGACY_REFRESH_COOKIE);
    }
  },

  hasAccessToken(): boolean {
    return Boolean(accessTokenInMemory);
  },
};
