import { NextRequest, NextResponse } from "next/server";

// Disable timeout for long-running AI processing
export const maxDuration = 300; // 5 minutes (Vercel Pro)
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		// Get lipsync service URL from environment
		const lipsyncServiceUrl =
			process.env.LIPSYNC_SERVICE_URL || "http://localhost:11430";

		// Get API key from environment
		const apiKey =
			process.env.LIPSYNC_API_KEY || "wav2lip_default_dev_key_2024";

		console.log("📤 Forwarding text-to-speech request to:", lipsyncServiceUrl);
		console.log("🔑 Using API key:", apiKey.substring(0, 10) + "...");

		// Forward request to lipsync service
		// Note: For combined mode (Ollama + Lipsync), use /lipsync prefix
		// For standalone mode, check if URL already ends with /lipsync
		const apiUrl = lipsyncServiceUrl.includes('/lipsync')
			? `${lipsyncServiceUrl}/generate-from-text`
			: `${lipsyncServiceUrl}/lipsync/generate-from-text`;

		console.log("🌐 Full API URL:", apiUrl);

		const response = await fetch(
			apiUrl,
			{
				method: "POST",
				body: formData,
				headers: {
					"X-API-Key": apiKey,
					// Don't set Content-Type - let fetch handle it for FormData
				},
			},
		);

		console.log("📥 Response status from lipsync service:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Lipsync service error:", errorText);
			console.error("❌ Response status:", response.status);
			return NextResponse.json(
				{
					error: "Lipsync service error",
					details: errorText,
					status: response.status,
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
		console.error("❌ Error in lipsync API:", error);

		// Check if it's a network error
		if (error instanceof TypeError && error.message.includes("fetch")) {
			console.error("🌐 Network error - cannot reach lipsync service");
			return NextResponse.json(
				{
					error: "Cannot connect to AI service",
					details: "AI xizmati mavjud emas. Iltimos, xizmat ishga tushganini tekshiring.",
				},
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{
				error: "Failed to generate lip-sync video",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
