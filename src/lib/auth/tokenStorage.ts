/**
 * PuretyFarm Token Storage Manager
 * Handles client-side storage of JWT Access and Refresh Tokens with cookie & localStorage synchronization.
 */

const ACCESS_TOKEN_KEY = "purety_access_token";
const REFRESH_TOKEN_KEY = "purety_refresh_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY) || null;
    } catch {
      return getCookie(ACCESS_TOKEN_KEY) || null;
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY) || null;
    } catch {
      return getCookie(REFRESH_TOKEN_KEY) || null;
    }
  },

  setTokens({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }): void {
    if (typeof window === "undefined") return;
    try {
      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        setCookie(ACCESS_TOKEN_KEY, accessToken, 30);
      }
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        setCookie(REFRESH_TOKEN_KEY, refreshToken, 30);
      }
    } catch (err) {
      console.warn("Failed to write tokens to storage:", err);
      if (accessToken) setCookie(ACCESS_TOKEN_KEY, accessToken, 30);
      if (refreshToken) setCookie(REFRESH_TOKEN_KEY, refreshToken, 30);
    }
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn("Failed to remove tokens from storage:", err);
    }
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
  },

  hasAccessToken(): boolean {
    return Boolean(this.getAccessToken());
  },
};
