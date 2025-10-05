import { NextResponse } from "next/server";

const STORAGE_SERVICE_URL =
	process.env.STORAGE_SERVICE_URL || "http://localhost:9005";

export async function GET() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(`${STORAGE_SERVICE_URL}/`, {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return NextResponse.json(
				{ status: "offline", service: "storage" },
				{ status: 503 },
			);
		}

		return NextResponse.json({ status: "online", service: "storage" });
	} catch (error) {
		return NextResponse.json(
			{ status: "offline", service: "storage" },
			{ status: 503 },
		);
	}
}
