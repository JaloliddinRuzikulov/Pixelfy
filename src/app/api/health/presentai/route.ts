import { NextResponse } from "next/server";

const PRESENTAI_SERVICE_URL =
	process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

export async function GET() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(`${PRESENTAI_SERVICE_URL}/`, {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return NextResponse.json(
				{ status: "offline", service: "presentai" },
				{ status: 503 },
			);
		}

		return NextResponse.json({ status: "online", service: "presentai" });
	} catch (error) {
		return NextResponse.json(
			{ status: "offline", service: "presentai" },
			{ status: 503 },
		);
	}
}
