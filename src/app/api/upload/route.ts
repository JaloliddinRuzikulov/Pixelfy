import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const type = formData.get("type") as string | null;

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 },
			);
		}

		// Create uploads directory structure
		const uploadsDir = join(process.cwd(), "public", "uploads");
		const typeDir = type ? join(uploadsDir, type) : uploadsDir;

		if (!existsSync(typeDir)) {
			await mkdir(typeDir, { recursive: true });
		}

		// Get file buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Save file with original or provided filename
		const filename = file.name || `file_${Date.now()}.mp4`;
		const filepath = join(typeDir, filename);

		await writeFile(filepath, buffer);

		// Return public URL
		const url = type
			? `/uploads/${type}/${filename}`
			: `/uploads/${filename}`;

		console.log("✅ File saved successfully:", url);

		return NextResponse.json({
			success: true,
			url,
			filename,
		});
	} catch (error) {
		console.error("❌ Error saving file:", error);
		return NextResponse.json(
			{
				error: "Failed to save file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
