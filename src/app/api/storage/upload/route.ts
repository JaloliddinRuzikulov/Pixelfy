import { NextRequest, NextResponse } from "next/server";

const STORAGE_SERVICE_URL =
	process.env.STORAGE_SERVICE_URL || "http://localhost:9005";
const STORAGE_API_KEY =
	process.env.STORAGE_API_KEY || "storage_service_secret_key_2024";

export async function POST(request: NextRequest) {
	try {
		// Get form data from request
		const formData = await request.formData();

		// Add service identifier to form data
		formData.set("service", "web");

		// Forward request to storage service
		const response = await fetch(`${STORAGE_SERVICE_URL}/upload`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${STORAGE_API_KEY}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Storage service error: ${response.status} - ${error}`);
		}

		const result = await response.json();

		// Transform response to match existing upload service format
		if (result.success && result.file) {
			return NextResponse.json({
				success: true,
				fileName: result.file.original_filename,
				filePath: result.file.public_url,
				url: result.file.public_url,
				contentType: result.file.mime_type,
				fileSize: result.file.file_size,
				folder: result.file.folder || null,
				uploadedAt: result.file.uploaded_at,
				storageId: result.file.file_id,
				thumbnail: result.file.thumbnail_path,
			});
		}

		throw new Error("Invalid response from storage service");
	} catch (error) {
		console.error("Storage upload error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to upload file",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const service = searchParams.get("service") || "web";
		const folder = searchParams.get("folder") || "";
		const limit = searchParams.get("limit") || "100";
		const offset = searchParams.get("offset") || "0";

		// Forward request to storage service
		const response = await fetch(
			`${STORAGE_SERVICE_URL}/files?service=${service}&folder=${folder}&limit=${limit}&offset=${offset}`,
			{
				headers: {
					Authorization: `Bearer ${STORAGE_API_KEY}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`Storage service error: ${response.status}`);
		}

		const result = await response.json();
		return NextResponse.json(result);
	} catch (error) {
		console.error("Storage list error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to list files",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
