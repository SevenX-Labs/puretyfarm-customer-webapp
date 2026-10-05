import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
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
 * Cookie options conforming strictly to security requirements:
 * httpOnly: true
 * secure: true in production
 * sameSite: "lax"
 * maxAge: 30 days
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
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    return await verifySessionToken(cookie.value);
  } catch {
    return null;
  }
}
