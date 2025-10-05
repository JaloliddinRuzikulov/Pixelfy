import { NextRequest, NextResponse } from "next/server";

const PRESENTAI_SERVICE_URL =
	process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

export async function POST(request: NextRequest) {
	try {
		// Use intelligent Claude endpoint instead of external service
		const formData = await request.formData();

		console.log(
			"Using intelligent Claude endpoint for presentation generation",
		);
		console.log("FormData contents:", Object.fromEntries(formData.entries()));

		// Get the current request URL to determine the correct port
		const protocol = request.headers.get("x-forwarded-proto") || "http";
		const host = request.headers.get("host") || "localhost:3001";
		const baseUrl = `${protocol}://${host}`;

		// Forward to our intelligent Claude endpoint
		const response = await fetch(`${baseUrl}/api/presentai/generate-claude`, {
			method: "POST",
			body: formData,
		});

		console.log("Claude endpoint response status:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Claude endpoint error:", errorText);
			throw new Error(
				`Claude endpoint error: ${response.status} - ${errorText}`,
			);
		}

		const result = await response.json();

		// If there's a download URL, we need to proxy that through our domain
		if (result.download_url) {
			// Convert the download URL to use our proxy
			const filename = result.download_url.split("/").pop();
			result.download_url = `/api/presentai/download/${filename}`;
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("PresentAI API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to generate presentation",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		// Health check for PresentAI service
		const response = await fetch(`${PRESENTAI_SERVICE_URL}/`);
		const result = await response.json();

		return NextResponse.json({
			status: "connected",
			presentai_service: result,
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "disconnected",
				error: "PresentAI service not available",
			},
			{ status: 503 },
		);
	}
}
