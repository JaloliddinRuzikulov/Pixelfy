import { NextRequest, NextResponse } from "next/server";

const STORAGE_SERVICE_URL =
	process.env.STORAGE_SERVICE_URL || "http://127.0.0.1:9005";

// Proxy storage service file serving
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	try {
		const resolvedParams = await params;
		const filePath = resolvedParams.path.join("/");
		const storageUrl = `${STORAGE_SERVICE_URL}/serve/${filePath}`;

		console.log(`[STORAGE PROXY] Requesting: ${storageUrl}`);

		// Forward request to storage service
		const response = await fetch(storageUrl, {
			method: "GET",
			headers: {
				// Forward relevant headers
				"User-Agent": request.headers.get("User-Agent") || "",
			},
		});

		if (!response.ok) {
			console.error(
				`[STORAGE PROXY] Storage service error: ${response.status}`,
			);
			return NextResponse.json(
				{ error: "File not found" },
				{ status: response.status },
			);
		}

		// Get content type from storage service response
		const contentType =
			response.headers.get("Content-Type") || "application/octet-stream";
		const contentLength = response.headers.get("Content-Length");

		// Create response with proper headers
		const buffer = await response.arrayBuffer();
		const responseHeaders = new Headers({
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=31536000, immutable",
		});

		if (contentLength) {
			responseHeaders.set("Content-Length", contentLength);
		}

		return new NextResponse(buffer, {
			status: 200,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error("[STORAGE PROXY] Error serving file:", error);
		return NextResponse.json(
			{ error: "Failed to serve file" },
			{ status: 500 },
		);
	}
}
