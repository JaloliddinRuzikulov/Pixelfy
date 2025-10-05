import { NextRequest, NextResponse } from "next/server";

// Force logout - clear cookie without verification
export async function POST(request: NextRequest) {
	console.log("[Force Logout] Clearing session cookie...");

	const response = NextResponse.json({
		message: "Logged out successfully - please login again",
	});

	// Clear the session cookie
	response.cookies.set("session-token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0, // Expire immediately
		path: "/",
	});

	return response;
}

// Also support GET for easy browser access
export async function GET(request: NextRequest) {
	return POST(request);
}
