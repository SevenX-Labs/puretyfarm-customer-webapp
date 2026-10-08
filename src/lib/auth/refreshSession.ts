import { env } from "@/lib/config/env";
import { ApiError } from "@/types/api";
import { createRefreshCore } from "./refreshCore.mjs";
import { tokenStorage } from "./tokenStorage";

type SessionEvent =
  | { type: "rotated"; accessToken: string; refreshToken: string }
  | { type: "ended" };

type SessionListener = (event: SessionEvent) => void;

const REFRESH_ENDPOINT = `${env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/api/v1/auth/customer/refresh`;
const REFRESH_LOCK_KEY = "purety_auth_refresh_lock";
const SESSION_CHANNEL = "purety_auth_session";
const refreshChannel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(SESSION_CHANNEL)
    : null;
const listeners = new Set<SessionListener>();
const rotatedSessions = new Map<string, string>();
const rotationWaiters = new Map<
  string,
  Set<(accessToken: string) => void>
>();
function emitSessionEvent(event: SessionEvent): void {
  listeners.forEach((listener) => listener(event));
}

if (refreshChannel) {
  refreshChannel.addEventListener("message", (event: MessageEvent<SessionEvent>) => {
    const message = event.data;
    if (message?.type === "rotated") {
      rotatedSessions.set(message.refreshToken, message.accessToken);
      if (rotatedSessions.size > 8) {
        const oldest = rotatedSessions.keys().next().value;
        if (oldest) rotatedSessions.delete(oldest);
      }
      tokenStorage.setAccessToken(message.accessToken, message.refreshToken);
      rotationWaiters.get(message.refreshToken)?.forEach((resolve) =>
        resolve(message.accessToken)
      );
      rotationWaiters.delete(message.refreshToken);
      emitSessionEvent(message);
    } else if (message?.type === "ended") {
      tokenStorage.clearTokens();
      emitSessionEvent(message);
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (
      event.key === "purety_refresh_token" &&
      event.newValue === null
    ) {
      tokenStorage.setAccessToken("");
      emitSessionEvent({ type: "ended" });
    }
  });
}

function broadcastSessionEvent(event: SessionEvent): void {
  emitSessionEvent(event);
  refreshChannel?.postMessage(event);
}

function createNetworkError(message: string): ApiError {
  return new ApiError(message, 500, "NETWORK_ERROR");
}

function parseErrorMessage(data: unknown, status: number): {
  message: string;
  code?: string;
} {
  if (data && typeof data === "object") {
    const body = data as { message?: unknown; error?: unknown; code?: unknown };
    const message =
      (typeof body.message === "string" && body.message) ||
      (typeof body.error === "string" && body.error) ||
      `Refresh failed with status ${status}.`;
    return {
      message,
      code: typeof body.code === "string" ? body.code : undefined,
    };
  }
  return { message: `Refresh failed with status ${status}.` };
}

async function requestRefresh(refreshToken: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Refresh request timed out.", 408, "TIMEOUT");
    }
    throw createNetworkError("Could not connect while refreshing the session.");
  } finally {
    clearTimeout(timeout);
  }

  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const { message, code } = parseErrorMessage(data, response.status);
    throw new ApiError(message, response.status, code, data);
  }
  return data;
}

function waitForStorageLock(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      window.removeEventListener("storage", onStorage);
      clearTimeout(timeout);
      resolve();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === REFRESH_LOCK_KEY) finish();
    };
    window.addEventListener("storage", onStorage);
    const timeout = setTimeout(finish, timeoutMs);
  });
}

async function withStorageLock<T>(callback: () => Promise<T>): Promise<T> {
  const owner = crypto.randomUUID();
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    const current = window.localStorage.getItem(REFRESH_LOCK_KEY);
    let expiresAt = 0;
    if (current) {
      try {
        expiresAt = JSON.parse(current).expiresAt || 0;
      } catch {
        expiresAt = 0;
      }
    }

    if (!current || expiresAt <= Date.now()) {
      const claim = JSON.stringify({ owner, expiresAt: Date.now() + 60000 });
      window.localStorage.setItem(REFRESH_LOCK_KEY, claim);
      if (window.localStorage.getItem(REFRESH_LOCK_KEY) === claim) {
        try {
          return await callback();
        } finally {
          if (window.localStorage.getItem(REFRESH_LOCK_KEY) === claim) {
            window.localStorage.removeItem(REFRESH_LOCK_KEY);
          }
        }
      }
    }

    await waitForStorageLock(100);
  }

  throw createNetworkError("Timed out waiting for another tab to refresh the session.");
}

async function withCrossTabLock<T>(callback: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined") return callback();
  if (navigator.locks) {
    return navigator.locks.request(
      "puretyfarm-auth-refresh",
      { mode: "exclusive" },
      callback
    );
  }
  if (typeof window !== "undefined") return withStorageLock(callback);
  return callback();
}

function waitForRotatedAccess(refreshToken: string): Promise<string | null> {
  const cached =
    tokenStorage.getAccessTokenForRefresh(refreshToken) ||
    rotatedSessions.get(refreshToken);
  if (cached || !refreshChannel) return Promise.resolve(cached || null);

  return new Promise((resolve) => {
    const waiters = rotationWaiters.get(refreshToken) || new Set();
    const finish = (accessToken: string | null) => {
      clearTimeout(timeout);
      waiters.delete(onRotation);
      if (waiters.size === 0) rotationWaiters.delete(refreshToken);
      resolve(accessToken);
    };
    const onRotation = (accessToken: string) => finish(accessToken);
    waiters.add(onRotation);
    rotationWaiters.set(refreshToken, waiters);
    const timeout = setTimeout(() => finish(null), 300);
  });
}

const refreshCore = createRefreshCore({
  getRefreshToken: () => tokenStorage.getRefreshToken(),
  getAccessToken: (refreshToken: string) =>
    tokenStorage.getAccessTokenForRefresh(refreshToken),
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    tokenStorage.setTokens(tokens);
    refreshChannel?.postMessage({ type: "rotated", ...tokens });
  },
  clearTokens: () => tokenStorage.clearTokens(),
  requestRefresh,
  withLock: withCrossTabLock,
  waitForRotatedAccess,
  onRejected: () => broadcastSessionEvent({ type: "ended" }),
});

export const refreshSession = refreshCore.refresh;

export function bootstrapAuthSession(
  loadAuthenticatedSession: (accessToken: string) => Promise<unknown>
) {
  return refreshCore.bootstrap(loadAuthenticatedSession);
}

export function retryAfterUnauthorized<T>(
  replayRequest: (accessToken: string) => Promise<T>
): Promise<T> {
  return refreshCore.retryAfterUnauthorized(replayRequest);
}

export function subscribeToAuthSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function endAuthSession(): void {
  try {
    tokenStorage.clearTokens();
  } finally {
    broadcastSessionEvent({ type: "ended" });
  }
}
