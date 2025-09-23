import { NextRequest, NextResponse } from "next/server";

const OFFICE_SERVICE_URL =
	process.env.OFFICE_SERVICE_URL || "http://localhost:8002";

export async function GET(
	request: NextRequest,
	{ params }: { params: { params: string[] } },
) {
	try {
		// Extract session ID and filename from the params
		const [sessionId, filename] = params.params;

		if (!sessionId || !filename) {
			return NextResponse.json(
				{ error: "Invalid download path" },
				{ status: 400 },
			);
		}

		// Fetch the image from the office service
		const response = await fetch(
			`${OFFICE_SERVICE_URL}/download/${sessionId}/${filename}`,
		);

		if (!response.ok) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		// Get the image data
		const imageBuffer = await response.arrayBuffer();

		// Determine content type based on file extension
		const extension = filename.split(".").pop()?.toLowerCase();
		const contentType = extension === "png" ? "image/png" : "image/jpeg";

		// Return the image with proper headers
		return new NextResponse(imageBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=3600",
				"Content-Disposition": `inline; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Download error:", error);
		return NextResponse.json(
			{ error: "Failed to download file" },
			{ status: 500 },
		);
	}
}
