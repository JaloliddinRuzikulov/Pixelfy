import { NextRequest, NextResponse } from "next/server";

// Helper function to determine content type from file extension
function getContentType(fileName: string): string {
	const ext = fileName.split(".").pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		mp4: "video/mp4",
		webm: "video/webm",
		mov: "video/quicktime",
		mp3: "audio/mpeg",
		wav: "audio/wav",
		ogg: "audio/ogg",
	};
	return mimeTypes[ext || ""] || "application/octet-stream";
}

interface PresignRequest {
	userId: string;
	fileNames: string[];
}

interface ExternalPresignResponse {
	fileName: string;
	filePath: string;
	contentType: string;
	presignedUrl: string;
	folder?: string;
	url: string;
}

interface ExternalPresignsResponse {
	uploads: ExternalPresignResponse[];
}

export async function POST(request: NextRequest) {
	try {
		const body: PresignRequest = await request.json();
		const { userId, fileNames } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 },
			);
		}

		if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
			return NextResponse.json(
				{ error: "fileNames array is required and must not be empty" },
				{ status: 400 },
			);
		}

		// Use local upload service instead of external
		const uploads = fileNames.map((fileName) => ({
			fileName,
			filePath: `uploads/${userId}/${fileName}`,
			contentType: getContentType(fileName),
			presignedUrl: `/api/local-upload`,
			folder: userId,
			url: `/uploads/${userId}/${fileName}`,
		}));

		return NextResponse.json({
			success: true,
			uploads: uploads,
		});
	} catch (error) {
		console.error("Error in presign route:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
