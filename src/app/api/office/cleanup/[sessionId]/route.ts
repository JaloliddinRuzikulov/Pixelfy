import { NextRequest, NextResponse } from "next/server";

const OFFICE_SERVICE_URL =
	process.env.OFFICE_SERVICE_URL || "http://localhost:9002";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { sessionId: string } },
) {
	try {
		const { sessionId } = params;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		// Send cleanup request to the office service
		const response = await fetch(`${OFFICE_SERVICE_URL}/cleanup/${sessionId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json(
				{ error: `Cleanup failed: ${error}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Cleanup error:", error);
		return NextResponse.json(
			{ error: "Failed to cleanup session" },
			{ status: 500 },
		);
	}
}
