import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-edge";

// Routes that require authentication
const protectedRoutes = [
	"/dashboard",
	"/projects",
	"/profile",
	"/settings",
	"/edit",
];

// Routes that should redirect authenticated users away
const authRoutes = ["/auth/login", "/auth/register"];

// Public routes that don't require authentication (these override protected routes)
const publicRoutes = [
	"/auth/verify-email",
	"/api/auth",
	"/test-width",
	"/test-auth-width",
];

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	console.log(`[Middleware] Processing request for: ${pathname}`);

	// Allow all API routes to pass through
	if (pathname.startsWith("/api/")) {
		console.log(`[Middleware] Allowing API route: ${pathname}`);
		return NextResponse.next();
	}

	// Allow public routes
	if (publicRoutes.some((route) => pathname.startsWith(route))) {
		console.log(`[Middleware] Allowing public route: ${pathname}`);
		return NextResponse.next();
	}

	// Get session token from cookie
	const sessionToken = request.cookies.get("session-token")?.value;
	let isAuthenticated = false;

	if (sessionToken) {
		try {
			// Only verify JWT token signature (no database call in middleware)
			isAuthenticated = verifySessionToken(sessionToken);
			console.log(`[Middleware] Token found for ${pathname}, verified:`, isAuthenticated);
		} catch (error) {
			console.error(`[Middleware] Session verification failed for ${pathname}:`, error);
			isAuthenticated = false;
		}
	} else {
		console.log(`[Middleware] No session token found for ${pathname}`);
	}

	// Handle auth routes FIRST (before protected routes check)
	// This prevents authenticated users from accessing login/register pages
	if (authRoutes.some((route) => pathname.startsWith(route))) {
		console.log(`[Middleware] Auth route detected: ${pathname}, isAuthenticated:`, isAuthenticated);

		if (isAuthenticated) {
			// Check if there's a return URL
			const returnTo = request.nextUrl.searchParams.get("returnTo");
			console.log(`[Middleware] User is authenticated, returnTo:`, returnTo);

			if (
				returnTo &&
				protectedRoutes.some((route) => returnTo.startsWith(route))
			) {
				console.log(`[Middleware] Redirecting to returnTo: ${returnTo}`);
				return NextResponse.redirect(new URL(returnTo, request.url));
			}
			// Default redirect to projects page for authenticated users
			console.log(`[Middleware] Redirecting authenticated user to /projects`);
			return NextResponse.redirect(new URL("/projects", request.url));
		}

		// Allow unauthenticated users to access auth pages
		console.log(`[Middleware] Allowing unauthenticated access to auth page: ${pathname}`);
		return NextResponse.next();
	}

	// Handle protected routes
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		console.log(`[Middleware] Protected route detected: ${pathname}, isAuthenticated:`, isAuthenticated);

		if (!isAuthenticated) {
			console.log(`[Middleware] Redirecting ${pathname} to login page (not authenticated)`);
			// Redirect to login page with return URL
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("returnTo", pathname);
			return NextResponse.redirect(loginUrl);
		}

		console.log(`[Middleware] Allowing access to protected route ${pathname} (authenticated)`);
		return NextResponse.next();
	}

	// Default: allow request to continue
	console.log(`[Middleware] Allowing request to ${pathname} (no specific rules matched)`);
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
