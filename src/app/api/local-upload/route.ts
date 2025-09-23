import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Configure max body size for file uploads
export const maxDuration = 60; // Maximum function duration: 60 seconds
export const dynamic = "force-dynamic";

// Helper to ensure upload directory exists
async function ensureUploadDir(subDir: string = "") {
	const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
	await mkdir(uploadDir, { recursive: true });
	return uploadDir;
}

// Generate unique filename
function generateFileName(originalName: string): string {
	const ext = path.extname(originalName);
	const name = path.basename(originalName, ext);
	const timestamp = Date.now();
	const random = crypto.randomBytes(4).toString("hex");
	return `${name}_${timestamp}_${random}${ext}`;
}

// Handle file upload
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = (formData.get("folder") as string) || "";

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"video/mp4",
			"video/webm",
			"video/quicktime",
			"audio/mpeg",
			"audio/wav",
			"audio/webm",
		];

		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
		}

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Generate unique filename and save
		const fileName = generateFileName(file.name);
		const uploadDir = await ensureUploadDir(folder);
		const filePath = path.join(uploadDir, fileName);

		await writeFile(filePath, buffer);

		// Generate public URL
		const publicUrl = `/uploads/${folder ? folder + "/" : ""}${fileName}`;

		// Return format expected by upload-service
		return NextResponse.json({
			success: true,
			fileName: file.name,
			filePath: publicUrl,
			url: publicUrl,
			contentType: file.type,
			fileSize: file.size,
			folder: folder || null,
			uploadedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}

// Get presigned URL (mock for local)
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const fileName = searchParams.get("fileName");
	const folder = searchParams.get("folder") || "";

	if (!fileName) {
		return NextResponse.json(
			{ error: "File name is required" },
			{ status: 400 },
		);
	}

	// For local storage, we don't need presigned URLs
	// Just return the upload endpoint
	return NextResponse.json({
		uploadUrl: "/api/local-upload",
		method: "POST",
		fields: {
			folder,
			fileName,
		},
		expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour
	});
}
