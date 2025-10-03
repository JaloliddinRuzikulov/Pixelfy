import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Define MIME types based on file extensions
const mimeTypes: Record<string, string> = {
	// Images
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",

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

	// Documents
	".pdf": "application/pdf",
	".json": "application/json",
	".xml": "application/xml",
	".txt": "text/plain",
};

// Serve static files from the uploads directory
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	try {
		// Await params in Next.js 15+
		const resolvedParams = await params;

		// Reconstruct the file path from the URL segments
		const filePath = resolvedParams.path.join("/");

		// Decode URL-encoded characters
		const decodedPath = decodeURIComponent(filePath);

		// Construct the full file path
		const fullPath = path.join(process.cwd(), "public", "uploads", decodedPath);

		// Security check: ensure the path is within the uploads directory
		const uploadsDir = path.join(process.cwd(), "public", "uploads");
		const resolvedPath = path.resolve(fullPath);

		if (!resolvedPath.startsWith(uploadsDir)) {
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

		// Return the file with appropriate headers
		return new NextResponse(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("Error serving file:", error);
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
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
