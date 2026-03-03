import { betterFetch } from "@better-fetch/fetch";
import type { Session, User } from "better-auth/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that should redirect non-owners to maintenance
const MAINTENANCE_PROTECTED_ROUTES = [
  "/",
  "/topical",
  "/search",
  "/dashboard",
  "/admin",
  "/resources",
  "/disclaimer",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this path should be protected and redirect to maintenance
  const isMaintenanceProtected = MAINTENANCE_PROTECTED_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );

  if (!isMaintenanceProtected) {
    return NextResponse.next();
  }

  // Get session from better-auth
  const { data: session } = await betterFetch<{
    session: Session;
    user: User & { role?: string };
  }>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  // If user is owner, allow access
  if (session?.user?.role === "owner") {
    return NextResponse.next();
  }

  // Redirect non-owners to maintenance
  return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - maintenance page itself
     * - api routes (needed for auth to work)
     * - public folder assets (assets/, lib/, .well-known/)
     */
    "/((?!_next/static|_next/image|favicon.ico|maintenance|api|assets|lib|\\.well-known).*)",
  ],
};
