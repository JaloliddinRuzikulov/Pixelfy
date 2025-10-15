import { NextResponse } from "next/server";

const LIPSYNC_SERVICE_URL =
	process.env.LIPSYNC_SERVICE_URL || "http://localhost:9001";

export async function GET() {
	try {
		const response = await fetch(`${LIPSYNC_SERVICE_URL}/tts-config`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch TTS config: ${response.statusText}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching TTS config:", error);
		return NextResponse.json(
			{ error: "Failed to fetch TTS configuration" },
			{ status: 500 },
		);
	}
}
