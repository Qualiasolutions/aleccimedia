import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";
import { env } from "./lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/ping",
    "/api/health",
    "/api/auth",
    "/login",
    "/register",
    "/demo",
    "/_next",
    "/favicon.ico",
    "/sitemap.xml",
    "/robots.txt",
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Get the authentication token
    const token = await getToken({
      req: request,
      secret: env.AUTH_SECRET,
      secureCookie: !isDevelopmentEnvironment,
    });

    if (!token) {
      const redirectUrl = encodeURIComponent(request.url);
      return NextResponse.redirect(
        new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
      );
    }

    const isGuest = guestRegex.test(token?.email ?? "");

    // Redirect authenticated users away from auth pages
    if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow authenticated requests to proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // If token verification fails, redirect to guest auth
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - /login, /register, and /demo (allow access without authentication)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register|demo).*)",
  ],
};
