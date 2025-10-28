import { NextRequest } from "next/server";
import { verifyJwt, JWTPayload } from "./auth";

export type RoleCheckResult =
  | { ok: true; claims: JWTPayload }
  | { ok: false; status: number; body: { error: string } };

/**
 * Require specific role(s) for API route access
 * @param req - Next.js request object
 * @param roles - Array of allowed roles
 * @returns Result object with claims or error
 */
export function requireRole(req: NextRequest, roles: string[]): RoleCheckResult {
  const token = req.cookies.get("access_token")?.value || "";
  const claims = verifyJwt<JWTPayload>(token);

  if (!claims) {
    return {
      ok: false,
      status: 401,
      body: { error: "unauthenticated" },
    };
  }

  if (!roles.includes(claims.role)) {
    return {
      ok: false,
      status: 403,
      body: { error: "forbidden" },
    };
  }

  return { ok: true, claims };
}

/**
 * Extract user claims from request (without enforcing roles)
 * @param req - Next.js request object
 * @returns Claims or null if not authenticated
 */
export function getUserClaims(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get("access_token")?.value || "";
  return verifyJwt<JWTPayload>(token);
}
