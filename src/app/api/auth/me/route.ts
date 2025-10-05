import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user) {
			// Clear invalid session cookie automatically
			const response = NextResponse.json(
				{ error: "No valid session found" },
				{ status: 401 },
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

		return NextResponse.json({ user });
	} catch (error) {
		console.error("Get user error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
