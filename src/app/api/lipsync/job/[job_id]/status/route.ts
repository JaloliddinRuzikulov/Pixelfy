import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: { job_id: string } }
) {
	try {
		const { job_id } = params;

		// Get lipsync service URL from environment
		const lipsyncServiceUrl =
			process.env.LIPSYNC_SERVICE_URL || "http://localhost:11430";

		// Get API key from environment
		const apiKey =
			process.env.LIPSYNC_API_KEY || "wav2lip_default_dev_key_2024";

		// Build API URL for status check
		const apiUrl = lipsyncServiceUrl.includes('/lipsync')
			? `${lipsyncServiceUrl}/job/${job_id}/status`
			: `${lipsyncServiceUrl}/lipsync/job/${job_id}/status`;

		console.log("🔍 Checking job status:", apiUrl);

		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				"X-API-Key": apiKey,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Status check error:", errorText);
			return NextResponse.json(
				{
					error: "Failed to check job status",
					details: errorText,
				},
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("❌ Error in status check API:", error);

		if (error instanceof TypeError && error.message.includes("fetch")) {
			return NextResponse.json(
				{
					error: "Cannot connect to AI service",
					details: "AI xizmati mavjud emas.",
				},
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{
				error: "Failed to check job status",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
