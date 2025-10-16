import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
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

		// Build API URL for download
		const apiUrl = lipsyncServiceUrl.includes('/lipsync')
			? `${lipsyncServiceUrl}/job/${job_id}/download`
			: `${lipsyncServiceUrl}/lipsync/job/${job_id}/download`;

		console.log("⬇️ Downloading job result:", apiUrl);

		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				"X-API-Key": apiKey,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Download error:", errorText);
			return NextResponse.json(
				{
					error: "Failed to download result",
					details: errorText,
				},
				{ status: response.status },
			);
		}

		// Get the video file from response
		const blob = await response.blob();
		console.log("✅ Video downloaded successfully, size:", blob.size);

		// Return the video file
		return new NextResponse(blob, {
			headers: {
				"Content-Type": response.headers.get("Content-Type") || "video/mp4",
				"Content-Disposition":
					response.headers.get("Content-Disposition") ||
					`attachment; filename="lipsync_${job_id}.mp4"`,
			},
		});
	} catch (error) {
		console.error("❌ Error in download API:", error);

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
				error: "Failed to download result",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
