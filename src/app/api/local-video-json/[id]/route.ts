import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Mock video JSON database - replace with actual database in production
const VIDEO_JSON_DB: Record<string, any> = {
	"example-1": {
		videoJson: {
			json: {
				name: "Sample Video",
				size: { width: 1920, height: 1080 },
				fps: 30,
				duration: 60,
				tracks: [],
			},
		},
	},
};

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		// First check if we have a local JSON file for this ID
		const jsonPath = path.join(
			process.cwd(),
			"public",
			"video-json",
			`${id}.json`,
		);

		try {
			const fileContent = await fs.readFile(jsonPath, "utf-8");
			const data = JSON.parse(fileContent);
			return NextResponse.json(data);
		} catch (fileError) {
			// File doesn't exist, check mock database
			if (VIDEO_JSON_DB[id]) {
				return NextResponse.json(VIDEO_JSON_DB[id]);
			}
		}

		// Return empty video JSON if not found
		return NextResponse.json({
			videoJson: {
				json: {
					name: "New Video",
					size: { width: 1920, height: 1080 },
					fps: 30,
					duration: 0,
					tracks: [],
				},
			},
		});
	} catch (error) {
		console.error("Error fetching video JSON:", error);
		return NextResponse.json(
			{ error: "Failed to fetch video JSON" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Save to local file system
		const jsonDir = path.join(process.cwd(), "public", "video-json");
		await fs.mkdir(jsonDir, { recursive: true });

		const jsonPath = path.join(jsonDir, `${id}.json`);
		await fs.writeFile(jsonPath, JSON.stringify(body, null, 2));

		return NextResponse.json({
			success: true,
			message: "Video JSON saved successfully",
		});
	} catch (error) {
		console.error("Error saving video JSON:", error);
		return NextResponse.json(
			{ error: "Failed to save video JSON" },
			{ status: 500 },
		);
	}
}
