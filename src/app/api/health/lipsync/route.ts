import { NextResponse } from "next/server";

const LIPSYNC_SERVICE_URL =
	process.env.LIPSYNC_SERVICE_URL || "http://localhost:9001";

export async function GET() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(`${LIPSYNC_SERVICE_URL}/`, {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return NextResponse.json(
				{ status: "offline", service: "lipsync" },
				{ status: 503 },
			);
		}

		return NextResponse.json({ status: "online", service: "lipsync" });
	} catch (error) {
		return NextResponse.json(
			{ status: "offline", service: "lipsync" },
			{ status: 503 },
		);
	}
}
