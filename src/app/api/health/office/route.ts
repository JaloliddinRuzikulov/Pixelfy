import { NextResponse } from "next/server";

const OFFICE_SERVICE_URL =
	process.env.OFFICE_SERVICE_URL || "http://localhost:9002";

export async function GET() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(`${OFFICE_SERVICE_URL}/`, {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return NextResponse.json(
				{ status: "offline", service: "office" },
				{ status: 503 },
			);
		}

		return NextResponse.json({ status: "online", service: "office" });
	} catch (error) {
		return NextResponse.json(
			{ status: "offline", service: "office" },
			{ status: 503 },
		);
	}
}
