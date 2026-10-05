import { ApiError, ApiResponse } from "@/types/api";
import { env } from "@/lib/config/env";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Resolves the full URL based on configured API mode:
 * - "proxy" (default): Uses relative path (e.g. /api/...) or configured proxy
 * - "direct": Prepend NEXT_PUBLIC_API_URL for cross-origin calls
 */
function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (env.NEXT_PUBLIC_API_MODE === "direct" && env.NEXT_PUBLIC_API_URL) {
    const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    return `${baseUrl}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Universal typed API client for PuretyFarm.
 * Handles timeouts, credentials, JSON parsing, 401 handling, and error normalization.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, params, headers, ...customConfig } = options;

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

  const defaultHeaders: HeadersInit = {
    Accept: "application/json",
  };

  // If request has a body and it is not FormData, set Content-Type to JSON
  if (customConfig.body && !(customConfig.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include", // Supports first-party cookies and cross-origin with CORS
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle 401 Unauthorized globally: redirect to /auth on client
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth") && currentPath !== "/") {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // Parse JSON safely
    const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok) {
      const errorMessage =
        (data && typeof data.error === "string" ? data.error : null) ||
        (data && typeof data.message === "string" ? data.message : null) ||
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

// HTTP method convenience helpers
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
