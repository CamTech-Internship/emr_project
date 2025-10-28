import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface JWTPayload {
  sub: string;
  role: string;
  hospitalId: string;
  type?: string;
}

/**
 * Sign a JWT token
 * @param payload - Token payload
 * @param expiresIn - Token expiration (default: 15m)
 */
export function signJwt(payload: object, expiresIn = "15m"): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

/**
 * Set authentication cookies (access + refresh tokens)
 * @param token - Access token
 * @param refresh - Refresh token
 */
export async function setAuthCookies(token: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
  cookieStore.set("refresh_token", refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Get the access token from cookies
 * @returns Access token or null if not found
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
