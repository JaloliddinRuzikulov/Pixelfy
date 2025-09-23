import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Define MIME types based on file extensions
const mimeTypes: Record<string, string> = {
	// Videos
	".mp4": "video/mp4",
	".webm": "video/webm",
	".ogg": "video/ogg",
	".mov": "video/quicktime",
	".avi": "video/x-msvideo",
	".wmv": "video/x-ms-wmv",
	".flv": "video/x-flv",
	".mkv": "video/x-matroska",

	// Audio
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".ogg": "audio/ogg",
	".m4a": "audio/mp4",
	".weba": "audio/webm",
	".aac": "audio/aac",

	// Images (for thumbnails)
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",

	// Documents
	".json": "application/json",
};

// Serve static files from the renders directory
export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	try {
		// Reconstruct the file path from the URL segments
		const filePath = params.path.join("/");

		// Decode URL-encoded characters
		const decodedPath = decodeURIComponent(filePath);

		// Construct the full file path
		const fullPath = path.join(process.cwd(), "public", "renders", decodedPath);

		// Security check: ensure the path is within the renders directory
		const rendersDir = path.join(process.cwd(), "public", "renders");
		const resolvedPath = path.resolve(fullPath);

		if (!resolvedPath.startsWith(rendersDir)) {
			return new NextResponse("Forbidden", { status: 403 });
		}

		// Check if file exists
		if (!existsSync(resolvedPath)) {
			return new NextResponse("File not found", { status: 404 });
		}

		// Read the file
		const fileBuffer = await readFile(resolvedPath);

		// Determine content type
		const ext = path.extname(resolvedPath).toLowerCase();
		const contentType = mimeTypes[ext] || "application/octet-stream";

		// Return the file with appropriate headers for streaming
		return new NextResponse(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*",
				"Accept-Ranges": "bytes",
				"Content-Length": fileBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("Error serving render file:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Range",
		},
	});
}