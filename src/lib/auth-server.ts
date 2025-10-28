import { cookies } from "next/headers";
import { verifyJwt, JWTPayload } from "./auth";
import { redirect } from "next/navigation";

/**
 * Get current user from cookies (server-side)
 * Returns user claims or null if not authenticated
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  const claims = verifyJwt<JWTPayload>(token);
  return claims;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Require specific role - redirect if not authorized
 */
export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/"); // Redirect to home if wrong role
  }

  return user;
}

/**
 * Redirect if already authenticated
 * Useful for login page
 */
export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    const roleRoutes: Record<string, string> = {
      ADMIN: "/admin",
      DOCTOR: "/doctor",
      FRONT_DESK: "/front-desk",
      PATIENT: "/patient",
    };

    redirect(roleRoutes[user.role] || "/");
  }
}
