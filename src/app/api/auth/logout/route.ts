import { NextRequest, NextResponse } from "next/server";
import { SessionRepository } from "@/lib/db";

export async function POST(request: NextRequest) {
	try {
		// Get session token from cookies
		const cookieHeader = request.headers.get("cookie");
		if (cookieHeader) {
			const cookies = cookieHeader.split(";").reduce(
				(acc, cookie) => {
					const [key, value] = cookie.trim().split("=");
					acc[key] = value;
					return acc;
				},
				{} as Record<string, string>,
			);

			const sessionToken = cookies["session-token"];
			if (sessionToken) {
				// Delete session from database
				await SessionRepository.deleteByToken(sessionToken);
			}
		}

		// Create response
		const response = NextResponse.json({ message: "Logout successful" });

		// Clear session cookie
		response.cookies.set("session-token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 0, // This will delete the cookie
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Logout error:", error);

		// Even if there's an error, clear the cookie
		const response = NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);

		response.cookies.set("session-token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 0,
			path: "/",
		});

		return response;
	}
}
