import { NextRequest, NextResponse } from "next/server";

const STORAGE_SERVICE_URL =
	process.env.STORAGE_SERVICE_URL || "http://localhost:9005";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } },
) {
	try {
		const filePath = params.path.join("/");

		// Forward request to storage service
		const response = await fetch(`${STORAGE_SERVICE_URL}/serve/${filePath}`, {
			headers: {
				// Forward relevant headers
				"User-Agent": request.headers.get("user-agent") || "",
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return NextResponse.json({ error: "File not found" }, { status: 404 });
			}
			throw new Error(`Storage service error: ${response.status}`);
		}

		// Stream the file content
		const fileContent = await response.arrayBuffer();
		const contentType =
			response.headers.get("content-type") || "application/octet-stream";

		return new NextResponse(fileContent, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Storage serve error:", error);
		return NextResponse.json(
			{
				error: "Failed to serve file",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
