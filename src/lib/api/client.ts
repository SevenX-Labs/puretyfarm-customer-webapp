import { ApiError, ApiResponse } from "@/types/api";
import { env } from "@/lib/config/env";
import { tokenStorage } from "@/lib/auth/tokenStorage";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

const BACKEND_BASE_URL = (
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  env.NEXT_PUBLIC_API_URL ||
  "https://api-puretyfarm.onrender.com"
).replace(/\/+$/, "");

/**
 * Resolves the full URL based on configured API mode and endpoint path:
 * - Paths starting with /api/v1/ or /auth/ are routed directly to backend base URL
 * - If NEXT_PUBLIC_API_MODE is 'direct', relative paths are routed to backend base URL
 * - Otherwise relative paths remain local (Next.js API routes)
 */
function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (
    cleanPath.startsWith("/api/v1/") ||
    cleanPath.startsWith("/auth/") ||
    cleanPath.includes("/auth/customer") ||
    env.NEXT_PUBLIC_API_MODE === "direct"
  ) {
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }

  return cleanPath;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/**
 * Universal typed API client for PuretyFarm.
 * Handles timeouts, Bearer token injection, automatic token rotation on 401, credentials, and error normalization.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, params, headers, skipAuth = false, ...customConfig } = options;

  let url = resolveUrl(endpoint);

  // Append query parameters if present
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  // If request has a body and it is not FormData, set Content-Type to JSON
  if (customConfig.body && !(customConfig.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Automatically attach Bearer token from tokenStorage if available and not skipped
  if (!skipAuth && typeof window !== "undefined") {
    const token = tokenStorage.getAccessToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    credentials: "include", // Supports first-party cookies and cross-origin with CORS
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // If 401 Unauthorized occurs on an authenticated request and we have a refreshToken, attempt refresh once
    const isAuthEndpoint =
      endpoint.includes("/refresh") ||
      endpoint.includes("/login") ||
      endpoint.includes("/verify-otp");

    if (response.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/customer/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.accessToken && refreshData.refreshToken) {
              tokenStorage.setTokens({
                accessToken: refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
              });
              onTokenRefreshed(refreshData.accessToken);
              isRefreshing = false;

              // Retry original request with new access token
              return apiClient<T>(endpoint, {
                ...options,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${refreshData.accessToken}`,
                },
              });
            }
          }
        } catch (refreshErr) {
          console.error("Token refresh failed:", refreshErr);
        } finally {
          isRefreshing = false;
        }

        // If refresh failed, clear tokens
        tokenStorage.clearTokens();
      }
    }

    // Parse JSON safely
    const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok) {
      const errorMessage =
        (data && typeof data.error === "string" ? data.error : null) ||
        (data && typeof data.message === "string" ? data.message : null) ||
        (data && Array.isArray((data as any).message) ? (data as any).message.join(", ") : null) ||
        `Request failed with status ${response.status}`;

      throw new ApiError(
        errorMessage,
        response.status,
        typeof data.code === "string" ? data.code : undefined,
        data
      );
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timeout. Please check your connection and try again.", 408, "TIMEOUT");
    }

    const message = err instanceof Error ? err.message : "A network error occurred. Please try again.";
    throw new ApiError(message, 500, "NETWORK_ERROR");
  }
}

// Attach HTTP method convenience helpers directly to apiClient
apiClient.get = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

apiClient.patch = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

apiClient.put = <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

apiClient.delete = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });

export const api = apiClient;
