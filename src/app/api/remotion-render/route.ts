import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
		const { design, chromaKeySettings } = body;

		// Generate unique job ID
		const jobId = crypto.randomBytes(16).toString("hex");

		// Create render job
		renderJobs.set(jobId, {
			id: jobId,
			status: "pending",
			progress: 0,
			createdAt: new Date(),
		});

		// Start async rendering (in background)
		processRemotionRender(jobId, design, chromaKeySettings).catch((error) => {
			console.error("Render error:", error);
			const job = renderJobs.get(jobId);
			if (job) {
				job.status = "failed";
				job.error = error.message;
			}
		});

		return NextResponse.json({
			success: true,
			jobId,
			message: "Render job started",
		});
	} catch (error) {
		console.error("Remotion render API error:", error);
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

async function processRemotionRender(
	jobId: string,
	design: any,
	chromaKeySettings: any,
) {
	const job = renderJobs.get(jobId);
	if (!job) return;

	try {
		// Update status
		job.status = "processing";
		job.progress = 10;

		// Track memory usage before render
		const initialMemory = process.memoryUsage();
		console.log(`Starting render ${jobId} - Initial memory:`, {
			rss: Math.round(initialMemory.rss / 1024 / 1024) + "MB",
			heapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024) + "MB",
			external: Math.round(initialMemory.external / 1024 / 1024) + "MB",
		});

		// Force garbage collection before heavy render if available
		if (global.gc) {
			global.gc();
		}

		// Use the actual Remotion rendering function with real composition
		const { renderWithActualComposition } = await import(
			"@/lib/remotion-render-actual"
		);

		const outputUrl = await renderWithActualComposition(
			jobId,
			design,
			chromaKeySettings,
			(progress) => {
				job.progress = progress;

				// Periodically trigger garbage collection during render
				if (progress > 0 && progress % 25 === 0 && global.gc) {
					global.gc();
				}
			},
		);

		// Update job completion
		job.status = "completed";
		job.progress = 100;
		job.outputUrl = outputUrl;

		// Final memory cleanup and logging
		if (global.gc) {
			global.gc();
		}

		const finalMemory = process.memoryUsage();
		console.log(`Completed render ${jobId} - Final memory:`, {
			rss: Math.round(finalMemory.rss / 1024 / 1024) + "MB",
			heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024) + "MB",
			external: Math.round(finalMemory.external / 1024 / 1024) + "MB",
			freed:
				Math.round(
					(initialMemory.heapUsed - finalMemory.heapUsed) / 1024 / 1024,
				) + "MB",
		});
	} catch (error) {
		job.status = "failed";
		job.error = error instanceof Error ? error.message : "Unknown error";
		console.error("Remotion render job failed:", error);

		// Force garbage collection on error
		if (global.gc) {
			global.gc();
		}

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
