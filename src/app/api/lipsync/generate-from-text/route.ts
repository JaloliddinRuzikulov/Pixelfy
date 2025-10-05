import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		// Get lipsync service URL from environment
		const lipsyncServiceUrl =
			process.env.LIPSYNC_SERVICE_URL || "http://localhost:11430";

		// Get API key from environment
		const apiKey =
			process.env.LIPSYNC_API_KEY || "wav2lip_default_dev_key_2024";

		// Forward request to lipsync service
		const response = await fetch(
			`${lipsyncServiceUrl}/lipsync/generate-from-text`,
			{
				method: "POST",
				body: formData,
				headers: {
					"X-API-Key": apiKey,
					// Don't set Content-Type - let fetch handle it for FormData
				},
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Lipsync service error:", errorText);
			return NextResponse.json(
				{
					error: "Lipsync service error",
					details: errorText,
				},
				{ status: response.status },
			);
		}

		// Get the video file from response
		const blob = await response.blob();

		// Return the video file
		return new NextResponse(blob, {
			headers: {
				"Content-Type": response.headers.get("Content-Type") || "video/mp4",
				"Content-Disposition":
					response.headers.get("Content-Disposition") ||
					'attachment; filename="lipsync_output.mp4"',
			},
		});
	} catch (error) {
		console.error("Error in lipsync API:", error);
		return NextResponse.json(
			{
				error: "Failed to generate lip-sync video",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
