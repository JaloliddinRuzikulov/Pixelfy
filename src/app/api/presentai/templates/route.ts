import { NextRequest, NextResponse } from "next/server";

const PRESENTAI_SERVICE_URL =
	process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

export async function GET(request: NextRequest) {
	try {
		// Forward the request to PresentAI service
		const response = await fetch(`${PRESENTAI_SERVICE_URL}/templates`);

		if (!response.ok) {
			throw new Error(`PresentAI service error: ${response.status}`);
		}

		const result = await response.json();
		return NextResponse.json(result);
	} catch (error) {
		console.error("PresentAI templates API error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch templates",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
