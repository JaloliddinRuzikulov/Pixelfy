import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { url } = body;

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		// Fetch the file from URL
		const response = await fetch(url);

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch file from URL" },
				{ status: 400 },
			);
		}

		// Get file info
		const contentType =
			response.headers.get("content-type") || "application/octet-stream";
		const buffer = Buffer.from(await response.arrayBuffer());

		// Generate filename from URL or use random name
		const urlPath = new URL(url).pathname;
		const originalName = path.basename(urlPath) || "download";
		const extension =
			path.extname(originalName) || getExtensionFromMimeType(contentType);
		const randomName = crypto.randomBytes(16).toString("hex");
		const fileName = `${randomName}${extension}`;

		// Determine upload directory based on content type
		let uploadDir = "uploads";
		if (contentType.startsWith("image/")) {
			uploadDir = "uploads/images";
		} else if (contentType.startsWith("video/")) {
			uploadDir = "uploads/videos";
		} else if (contentType.startsWith("audio/")) {
			uploadDir = "uploads/audio";
		}

		const uploadPath = path.join(process.cwd(), "public", uploadDir);
		await fs.mkdir(uploadPath, { recursive: true });

		const filePath = path.join(uploadPath, fileName);

		// Save file
		await fs.writeFile(filePath, buffer);

		const publicUrl = `/${uploadDir}/${fileName}`;

		return NextResponse.json({
			success: true,
			fileName: originalName,
			filePath: publicUrl,
			url: publicUrl,
			contentType,
			fileSize: buffer.length,
			folder: uploadDir,
		});
	} catch (error) {
		console.error("URL upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload from URL" },
			{ status: 500 },
		);
	}
}

function getExtensionFromMimeType(mimeType: string): string {
	const mimeToExt: Record<string, string> = {
		"image/jpeg": ".jpg",
		"image/png": ".png",
		"image/gif": ".gif",
		"image/webp": ".webp",
		"video/mp4": ".mp4",
		"video/webm": ".webm",
		"video/quicktime": ".mov",
		"audio/mpeg": ".mp3",
		"audio/wav": ".wav",
		"audio/ogg": ".ogg",
		"application/pdf": ".pdf",
	};

	return mimeToExt[mimeType] || ".bin";
}
