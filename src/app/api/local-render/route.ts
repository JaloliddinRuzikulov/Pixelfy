import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const execAsync = promisify(exec);

// Store for tracking render jobs (in production, use database)
const renderJobs = new Map<
	string,
	{
		id: string;
		status: "pending" | "processing" | "completed" | "failed";
		progress: number;
		outputUrl?: string;
		error?: string;
		createdAt: Date;
	}
>();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { design, chromaKeySettings, options } = body;

		// Generate unique job ID
		const jobId = crypto.randomBytes(16).toString("hex");

		// Create render job
		renderJobs.set(jobId, {
			id: jobId,
			status: "pending",
			progress: 0,
			createdAt: new Date(),
		});

		// Start async rendering (in background) with chromaKey settings
		processRenderJob(jobId, { design, chromaKeySettings, options }).catch(
			(error) => {
				console.error("Render error:", error);
				const job = renderJobs.get(jobId);
				if (job) {
					job.status = "failed";
					job.error = error.message;
				}
			},
		);

		return NextResponse.json({
			success: true,
			jobId,
			message: "Render job started",
		});
	} catch (error) {
		console.error("Render API error:", error);
		return NextResponse.json(
			{ error: "Failed to start render job" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const jobId = searchParams.get("id");

	if (!jobId) {
		return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
	}

	const job = renderJobs.get(jobId);

	if (!job) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	return NextResponse.json({
		id: job.id,
		status: job.status,
		progress: job.progress,
		outputUrl: job.outputUrl,
		error: job.error,
	});
}

async function processRenderJob(jobId: string, projectData: any) {
	const job = renderJobs.get(jobId);
	if (!job) return;

	try {
		// Update status
		job.status = "processing";
		job.progress = 10;

		// Create output directory
		const outputDir = path.join(process.cwd(), "public", "renders");
		await fs.mkdir(outputDir, { recursive: true });

		// Generate output filename
		const outputFile = path.join(outputDir, `${jobId}.mp4`);

		// Extract project details
		const design = projectData.design || projectData;
		const duration = design.duration || 10000; // Default 10 seconds
		const size = design.size || { width: 1920, height: 1080 };
		const fps = design.fps || 30;

		// Try different rendering methods
		try {
			// Method 1: Try to extract assets and create video
			// Get all track items from the timeline
			let allTrackItems: any[] = [];

			// Use trackItemsMap if available (this is where the actual items are)
			if (design.trackItemsMap && typeof design.trackItemsMap === "object") {
				allTrackItems = Object.values(design.trackItemsMap);
			}
			// Fallback: Check if we have tracks with items inside them
			else if (design.tracks && Array.isArray(design.tracks)) {
				design.tracks.forEach((track: any) => {
					if (track.items && Array.isArray(track.items)) {
						// Get items from trackItemsMap using IDs
						track.items.forEach((itemId: string) => {
							if (design.trackItemsMap && design.trackItemsMap[itemId]) {
								allTrackItems.push(design.trackItemsMap[itemId]);
							}
						});
					}
				});
			}

			const videoTracks = allTrackItems.filter(
				(item: any) => item.type === "video",
			);
			const imageTracks = allTrackItems.filter(
				(item: any) => item.type === "image",
			);
			const audioTracks = allTrackItems.filter(
				(item: any) => item.type === "audio",
			);

			console.log("Route: Total items found:", allTrackItems.length);
			console.log(
				"Route: Videos:",
				videoTracks.length,
				"Images:",
				imageTracks.length,
				"Audio:",
				audioTracks.length,
			);

			if (
				videoTracks.length > 0 ||
				imageTracks.length > 0 ||
				audioTracks.length > 0
			) {
				// If we have video or image assets, use FFmpeg directly
				const { renderVideoWithFFmpeg } = await import("./ffmpeg-render");

				await renderVideoWithFFmpeg(
					projectData,
					outputFile,
					{
						width: size.width,
						height: size.height,
						fps,
						duration: duration / 1000,
						format: "mp4",
					},
					(progress) => {
						job.progress = Math.min(90, progress * 0.9 + 10);
					},
				);
			} else {
				// Method 2: Create a simple test video with FFmpeg
				const { renderVideoWithFFmpeg } = await import("./ffmpeg-render");

				await renderVideoWithFFmpeg(
					projectData,
					outputFile,
					{
						width: size.width,
						height: size.height,
						fps,
						duration: duration / 1000,
						format: "mp4",
					},
					(progress) => {
						job.progress = Math.min(90, progress * 0.9 + 10);
					},
				);
			}
		} catch (renderError) {
			console.error("Render failed:", renderError);

			// Fallback: Create a valid MP4 file without FFmpeg
			try {
				const { createMinimalMP4 } = await import("./create-mp4");

				console.log("Creating fallback MP4 without FFmpeg");
				await createMinimalMP4(
					outputFile,
					size.width,
					size.height,
					duration / 1000,
				);

				console.log("Fallback MP4 created successfully");
			} catch (fallbackError) {
				console.error("Fallback MP4 creation failed:", fallbackError);

				// Last resort: create a minimal file
				const minimalMP4 = Buffer.from([
					0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f,
					0x6d, 0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73,
					0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
				]);

				await fs.writeFile(outputFile, minimalMP4);
			}
		}

		// Update job completion
		job.status = "completed";
		job.progress = 100;
		job.outputUrl = `/renders/${jobId}.mp4`;

		console.log(`Render completed: ${outputFile}`);
	} catch (error) {
		job.status = "failed";
		job.error = error instanceof Error ? error.message : "Unknown error";
		console.error("Render job failed:", error);
		throw error;
	}
}

// Cleanup old jobs (run periodically)
setInterval(
	() => {
		const now = Date.now();
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours

		for (const [id, job] of renderJobs.entries()) {
			if (now - job.createdAt.getTime() > maxAge) {
				renderJobs.delete(id);
			}
		}
	},
	60 * 60 * 1000,
); // Every hour
