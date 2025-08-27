import { NextRequest, NextResponse } from "next/server";

// Mock voice-over status check endpoint
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const params = await context.params;
		const { id } = params;

		if (!id) {
			return NextResponse.json(
				{ error: "Voice-over ID is required" },
				{ status: 400 },
			);
		}

		// Mock response - simulate completed status with a sample audio URL
		// In production, this would check the actual TTS service status
		return NextResponse.json({
			voiceOver: {
				id: id,
				status: "COMPLETED",
				// Using a sample audio file from the CDN
				url: "https://cdn.designcombo.dev/audio/lofi-study-112191.mp3",
				text: "Generated voice-over text",
				voiceId: "default",
				createdAt: new Date().toISOString(),
				completedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Voice-over status check error:", error);
		return NextResponse.json(
			{ error: "Failed to get voice-over status" },
			{ status: 500 },
		);
	}
}
