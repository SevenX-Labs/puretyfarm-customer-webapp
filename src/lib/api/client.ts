import { ApiError, ApiResponse } from "@/types/api";
import { env } from "@/lib/config/env";
import {
  endAuthSession,
  retryAfterUnauthorized,
} from "@/lib/auth/refreshSession";
import { tokenStorage } from "@/lib/auth/tokenStorage";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retries?: number;
}

const BACKEND_BASE_URL = (
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  env.NEXT_PUBLIC_API_URL ||
  "https://api-puretyfarm.onrender.com"
).replace(/\/+$/, "");

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Internal Next.js API endpoints (hosted by Next.js, not by the NestJS backend)
  const isInternalNextRoute =
    cleanPath.startsWith("/api/locations") ||
    cleanPath.startsWith("/api/serviceability") ||
    cleanPath.startsWith("/api/auth/send-otp") ||
    cleanPath.startsWith("/api/auth/verify-otp") ||
    cleanPath.startsWith("/api/auth/logout") ||
    cleanPath.startsWith("/api/upload");

  if (isInternalNextRoute) {
    return cleanPath;
  }

  // If in direct API mode or server-side execution, use full backend URL
  if (typeof window === "undefined" || env.NEXT_PUBLIC_API_MODE === "direct") {
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }

  // In browser with proxy mode (default), use same-origin relative URL
  return cleanPath;
}

function isAuthEndpoint(endpoint: string): boolean {
  return /\/auth\/customer\/(refresh|login|verify-otp|logout)(?:\/|$)/.test(
    endpoint
  );
}

function normalizeError(data: unknown, status: number): ApiError {
  const body = data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
  // In NestJS / standard HTTP errors, body.message contains the specific human error
  // (e.g. "The order cut-off for the 2026-10-15 delivery has passed"), while body.error is
  // just the generic HTTP status text (e.g. "Bad Request"). We must prioritize body.message!
  const messageValue = body.message || body.error;
  const message = Array.isArray(messageValue)
    ? messageValue.join(", ")
    : typeof messageValue === "string"
      ? messageValue
      : `Request failed with status ${status}`;

  return new ApiError(
    message,
    status,
    typeof body.code === "string" ? body.code : undefined,
    data
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok) throw normalizeError(data, response.status);
  return data as T;
}

// In-flight GET request deduplication to prevent duplicate network traffic
const inFlightGetMap = new Map<string, Promise<any>>();

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = 30000,
    params,
    headers,
    skipAuth = false,
    retries = 2,
    signal: callerSignal,
    ...customConfig
  } = options;

  let url = resolveUrl(endpoint);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) url += (url.includes("?") ? "&" : "?") + queryString;
  }

  const isGet = !customConfig.method || customConfig.method.toUpperCase() === "GET";
  const tokenForDedupe = skipAuth ? "" : (tokenStorage.getAccessToken() || "");
  const dedupeKey = isGet ? `${url}::${tokenForDedupe}` : "";

  if (dedupeKey && inFlightGetMap.has(dedupeKey)) {
    return inFlightGetMap.get(dedupeKey) as Promise<T>;
  }

  const doRequest = async (): Promise<T> => {
    let attempt = 0;
    const maxRetries = isGet ? Math.min(retries, 2) : 0; // Only retry idempotent GET requests

    while (attempt <= maxRetries) {
      attempt++;

      const requestOnce = async (accessToken?: string | null) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortFromCaller = () => controller.abort();
        callerSignal?.addEventListener("abort", abortFromCaller);

        const requestHeaders = new Headers(headers);
        requestHeaders.set("Accept", "application/json");
        if (
          customConfig.body &&
          !(typeof FormData !== "undefined" && customConfig.body instanceof FormData) &&
          !requestHeaders.has("Content-Type")
        ) {
          requestHeaders.set("Content-Type", "application/json");
        }

        const token = accessToken === undefined
          ? tokenStorage.getAccessToken()
          : accessToken;
        if (!skipAuth && token) {
          requestHeaders.set("Authorization", `Bearer ${token}`);
        }

        try {
          return await fetch(url, {
            ...customConfig,
            headers: requestHeaders,
            credentials: "include",
            signal: controller.signal,
          });
        } catch (error) {
          if (error instanceof ApiError) throw error;
          if (error instanceof Error && error.name === "AbortError") {
            throw new ApiError(
              "Request timeout. Please check your connection and try again.",
              408,
              "TIMEOUT"
            );
          }
          throw new ApiError(
            error instanceof Error
              ? error.message
              : "A network error occurred. Please try again.",
            500,
            "NETWORK_ERROR"
          );
        } finally {
          clearTimeout(timeoutId);
          callerSignal?.removeEventListener("abort", abortFromCaller);
        }
      };

      try {
        let response = await requestOnce();

        // 401 handling: refresh session and retry once
        if (
          response.status === 401 &&
          !skipAuth &&
          !isAuthEndpoint(endpoint) &&
          typeof window !== "undefined"
        ) {
          try {
            response = await retryAfterUnauthorized((accessToken) =>
              requestOnce(accessToken)
            );
          } catch (error) {
            if (
              typeof error === "object" &&
              error !== null &&
              "code" in error &&
              (error.code === "NO_REFRESH_TOKEN" ||
                error.code === "REFRESH_TOKEN_REJECTED")
            ) {
              endAuthSession();
            }
            throw error;
          }
        }

        // 429 Rate Limit: Read Retry-After, delay, retry once
        if (response.status === 429) {
          const retryAfterSec = parseInt(response.headers.get("Retry-After") || "2", 10) || 2;
          if (attempt <= maxRetries) {
            await new Promise((res) => setTimeout(res, Math.min(retryAfterSec, 5) * 1000));
            continue;
          }
        }

        // 5xx Server Error: Bounded retry for GET
        if (response.status >= 500 && attempt <= maxRetries) {
          const backoff = attempt === 1 ? 300 : 800;
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }

        return await parseResponse<T>(response);
      } catch (err: any) {
        const isNetworkErr = err?.status === 500 || err?.code === "NETWORK_ERROR";
        if (isNetworkErr && attempt <= maxRetries) {
          const backoff = attempt === 1 ? 300 : 800;
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }
        throw err;
      }
    }

    throw new ApiError("Maximum retries exceeded.", 500, "MAX_RETRIES");
  };

  if (dedupeKey) {
    const promise = doRequest().finally(() => {
      inFlightGetMap.delete(dedupeKey);
    });
    inFlightGetMap.set(dedupeKey, promise);
    return promise;
  }

  return doRequest();
}

apiClient.get = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body:
      typeof FormData !== "undefined" && body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

apiClient.patch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body:
      typeof FormData !== "undefined" && body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

apiClient.put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body:
      typeof FormData !== "undefined" && body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

apiClient.delete = <T = unknown>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });

export const api = apiClient;
