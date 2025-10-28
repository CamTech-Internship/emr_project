import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected API route prefixes that require authentication
 */
const protectedApiPrefixes = [
  "/api/admin",
  "/api/doctor",
  "/api/front-desk",
  "/api/messages",
  "/api/patient/appointments",
  "/api/patient/triage",
];

/**
 * Protected dashboard routes that require authentication
 */
const protectedDashboardRoutes = ["/admin", "/doctor", "/front-desk", "/patient"];

/**
 * Public routes that should redirect authenticated users
 */
const publicRoutes = ["/login"];

/**
 * Middleware to protect routes and handle authentication
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  const isAuthenticated = Boolean(token);

  // Protect API routes
  if (protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!token) {
      return NextResponse.json(
        { error: "unauthenticated", message: "Access token required" },
        { status: 401 }
      );
    }
  }

  // Redirect authenticated users away from login page
  if (publicRoutes.includes(pathname) && isAuthenticated) {
    // Let the login page client redirect based on role; default to root
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (protectedDashboardRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // RBAC is enforced in server components (requireRole) per-dashboard.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/doctor/:path*",
    "/front-desk/:path*",
    "/patient/:path*",
    "/login",
  ],
};
