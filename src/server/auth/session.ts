import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { User } from "../db/types";

export const SESSION_COOKIE_NAME = "pf_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "puretyfarm-production-jwt-secret-key-min-32-chars!";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  phone: string;
  name: string;
}

/**
 * Signs and creates a 30-day JWT session token
 */
export async function createSessionToken(user: Pick<User, "id" | "phone" | "name">): Promise<string> {
  const key = getSecretKey();
  const token = await new SignJWT({
    userId: user.id,
    phone: user.phone,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);

  return token;
}

/**
 * Verifies a JWT session token and returns the payload if valid
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId === "string" &&
      typeof payload.phone === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        userId: payload.userId,
        phone: payload.phone,
        name: payload.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decodes bearer token payload without throwing
 */
function decodeBearerPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Cookie options conforming strictly to security requirements
 */
export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

/**
 * Server-side helper to read the current session from Next.js headers/cookies
 * Supports both internal pf_session cookies and Authorization: Bearer tokens
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    // 1. Check HTTP-only cookie
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (cookie?.value) {
      const verified = await verifySessionToken(cookie.value);
      if (verified) return verified;
    }

    // 2. Fall back to Authorization: Bearer <token> header
    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.slice(7).trim();
      const verified = await verifySessionToken(bearerToken);
      if (verified) return verified;

      // Also support NestJS JWT format (where userId is in 'sub')
      const payload = decodeBearerPayload(bearerToken);
      if (payload && (payload.sub || payload.userId)) {
        return {
          userId: String(payload.sub || payload.userId),
          phone: String(payload.phone || payload.mobile || ""),
          name: String(payload.name || "Customer"),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
