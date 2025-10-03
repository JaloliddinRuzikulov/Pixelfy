import { NextRequest, NextResponse } from "next/server";

const PRESENTAI_SERVICE_URL =
	process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

export async function GET(
	request: NextRequest,
	{ params }: { params: { filename: string } },
) {
	try {
		const { filename } = params;

		// Validate filename to prevent path traversal
		if (!filename || filename.includes("..") || filename.includes("/")) {
			return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
		}

		// Forward the download request to PresentAI service
		const response = await fetch(
			`${PRESENTAI_SERVICE_URL}/download/${filename}`,
		);

		if (!response.ok) {
			throw new Error(`File not found: ${response.status}`);
		}

		// Get the file stream and headers
		const fileBuffer = await response.arrayBuffer();
		const contentType =
			response.headers.get("content-type") || "application/octet-stream";
		const contentLength = response.headers.get("content-length");

		// Create response with proper headers
		const headers = new Headers({
			"Content-Type": contentType,
			"Content-Disposition": `attachment; filename="${filename}"`,
		});

		if (contentLength) {
			headers.set("Content-Length", contentLength);
		}

		return new NextResponse(fileBuffer, {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("PresentAI download error:", error);
		return NextResponse.json(
			{
				error: "Failed to download file",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 404 },
		);
	}
}
