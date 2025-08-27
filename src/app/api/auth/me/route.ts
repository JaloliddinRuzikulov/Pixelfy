import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user) {
			return NextResponse.json(
				{ error: "No valid session found" },
				{ status: 401 },
			);
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
