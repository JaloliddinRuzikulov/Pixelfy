import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth-edge";

// Routes that require authentication
const protectedRoutes = ["/", "/edit", "/dashboard", "/projects", "/profile", "/settings"];

// Routes that should redirect authenticated users away
const authRoutes = ["/auth/login", "/auth/register"];

// Public routes that don't require authentication (these override protected routes)
const publicRoutes = ["/auth/verify-email", "/api/auth", "/test-width", "/test-auth-width"];

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Allow all API routes to pass through
	if (pathname.startsWith("/api/")) {
		return NextResponse.next();
	}

	// Allow public routes
	if (publicRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// Get session token from cookie
	const sessionToken = request.cookies.get("session-token")?.value;
	let isAuthenticated = false;

	if (sessionToken) {
		try {
			// Only verify JWT token signature (no database call in middleware)
			isAuthenticated = verifySessionToken(sessionToken);
		} catch (error) {
			console.error("Session verification failed:", error);
			isAuthenticated = false;
		}
	}

	// Handle protected routes
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!isAuthenticated) {
			// Redirect to login with return URL (but only if not already on auth route)
			if (!authRoutes.some((route) => pathname.startsWith(route))) {
				const loginUrl = new URL("/auth/login", request.url);
				loginUrl.searchParams.set("returnTo", pathname);
				return NextResponse.redirect(loginUrl);
			}
		}
		return NextResponse.next();
	}

	// Handle auth routes (redirect authenticated users)
	if (authRoutes.some((route) => pathname.startsWith(route))) {
		if (isAuthenticated) {
			// Check if there's a return URL
			const returnTo = request.nextUrl.searchParams.get("returnTo");
			if (
				returnTo &&
				protectedRoutes.some((route) => returnTo.startsWith(route))
			) {
				return NextResponse.redirect(new URL(returnTo, request.url));
			}
			// Default redirect to editor
			return NextResponse.redirect(new URL("/edit", request.url));
		}
		return NextResponse.next();
	}

	// Default: allow request to continue
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
