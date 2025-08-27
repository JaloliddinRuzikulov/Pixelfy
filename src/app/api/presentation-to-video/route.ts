import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const execAsync = promisify(exec);

// Store for conversion jobs
const conversionJobs = new Map<
	string,
	{
		id: string;
		status: "processing" | "completed" | "failed";
		progress: number;
		videoUrl?: string;
		pageImages?: string[];
		error?: string;
		createdAt: Date;
		conversionType: "video" | "images";
	}
>();

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const conversionType = "images"; // Always convert to images

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Generate unique job ID
		const jobId = crypto.randomBytes(16).toString("hex");

		// Create directories
		const uploadsDir = path.join(
			process.cwd(),
			"public",
			"uploads",
			"presentations",
		);
		const outputDir = path.join(
			process.cwd(),
			"public",
			"uploads",
			"presentation-videos",
		);

		await fs.mkdir(uploadsDir, { recursive: true });
		await fs.mkdir(outputDir, { recursive: true });

		// Save uploaded file
		const fileName = `${jobId}_${file.name}`;
		const filePath = path.join(uploadsDir, fileName);
		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.writeFile(filePath, buffer);

		// Create job
		conversionJobs.set(jobId, {
			id: jobId,
			status: "processing",
			progress: 0,
			createdAt: new Date(),
			conversionType: conversionType as "video" | "images",
		});

		// Start conversion in background
		convertPresentation(
			jobId,
			filePath,
			outputDir,
			conversionType as "video" | "images",
		).catch((error) => {
			console.error("Conversion error:", error);
			const job = conversionJobs.get(jobId);
			if (job) {
				job.status = "failed";
				job.error = error.message;
			}
		});

		return NextResponse.json({
			success: true,
			jobId,
			message: "Conversion started",
		});
	} catch (error) {
		console.error("Presentation API error:", error);
		return NextResponse.json(
			{ error: "Failed to process presentation" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const jobId = searchParams.get("jobId");

	if (!jobId) {
		return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
	}

	const job = conversionJobs.get(jobId);

	if (!job) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	return NextResponse.json({
		id: job.id,
		status: job.status,
		progress: job.progress,
		videoUrl: job.videoUrl,
		pageImages: job.pageImages,
		error: job.error,
	});
}

async function convertPresentation(
	jobId: string,
	filePath: string,
	outputDir: string,
	conversionType: "video" | "images",
) {
	const job = conversionJobs.get(jobId);
	if (!job) return;

	try {
		const fileExt = path.extname(filePath).toLowerCase();

		// Update progress
		job.progress = 10;

		if (fileExt === ".pdf") {
			// Convert PDF to video using ImageMagick and FFmpeg

			// First, convert PDF pages to images
			const imagesDir = path.join(outputDir, `${jobId}_images`);
			await fs.mkdir(imagesDir, { recursive: true });

			console.log("Converting PDF to images...");

			// Use ImageMagick to convert PDF to images
			// Note: ImageMagick might need to be installed: sudo apt-get install imagemagick
			try {
				// First try pdftoppm as it's more reliable for PDFs
				console.log("Using pdftoppm for PDF conversion...");
				await execAsync(
					`pdftoppm -png -r 150 "${filePath}" "${imagesDir}/page"`,
				);
			} catch (error) {
				// Fallback to ImageMagick with proper environment
				console.log("pdftoppm failed, trying ImageMagick...");
				const convertCommand = `env -i PATH=/usr/bin:/bin LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu convert -density 150 "${filePath}" "${imagesDir}/page-%03d.png"`;
				await execAsync(convertCommand);
			}

			job.progress = 50;

			// Convert images for individual use
			console.log("Processing PDF images for timeline...");

			const pageImagesDir = path.join(
				process.cwd(),
				"public",
				"uploads",
				"presentation-pages",
				jobId,
			);
			await fs.mkdir(pageImagesDir, { recursive: true });

			// Get all image files
			const imageFiles = await fs.readdir(imagesDir);
			const sortedImages = imageFiles
				.filter((f) => f.endsWith(".png"))
				.sort((a, b) => {
					// Sort by page number
					const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
					const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
					return aNum - bNum;
				});

			const pageImages: string[] = [];

			for (const [index, imageFile] of sortedImages.entries()) {
				const sourcePath = path.join(imagesDir, imageFile);
				const destPath = path.join(pageImagesDir, `page_${index + 1}.png`);

				// Copy image to public directory
				await fs.copyFile(sourcePath, destPath);

				// Add to pageImages array
				pageImages.push(
					`/uploads/presentation-pages/${jobId}/page_${index + 1}.png`,
				);
			}

			// Clean up temporary images
			await fs.rm(imagesDir, { recursive: true, force: true });

			// Store page images in job
			job.pageImages = pageImages;
		} else if (fileExt === ".ppt" || fileExt === ".pptx") {
			// Convert PowerPoint to PDF using alternative method
			console.log("Converting PowerPoint to PDF...");

			// Try different conversion approaches
			const pdfPath = filePath.replace(/\.(ppt|pptx)$/i, ".pdf");
			let conversionSuccess = false;

			// Method 1: Try unoconv (Universal Office Converter)
			try {
				console.log("Attempting conversion with unoconv...");
				await execAsync(
					`unoconv -f pdf -o "${path.dirname(filePath)}" "${filePath}"`,
				);
				conversionSuccess = true;
				console.log("unoconv conversion successful");
			} catch (error) {
				console.error("unoconv failed:", error);
			}

			// Method 2: Try pandoc with --to=pdf if unoconv fails
			if (!conversionSuccess) {
				try {
					console.log("Attempting conversion with pandoc...");
					await execAsync(`pandoc "${filePath}" -o "${pdfPath}"`);
					conversionSuccess = true;
					console.log("pandoc conversion successful");
				} catch (error) {
					console.error("pandoc failed:", error);
				}
			}

			// Method 3: Try simple python script
			if (!conversionSuccess) {
				try {
					console.log("Attempting Python-based conversion...");
					// Create a simple Python script for conversion
					const pythonScript = `
import sys
from pathlib import Path

try:
    from pptx import Presentation
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Load presentation
    prs = Presentation(input_file)
    
    # Create PDF
    doc = SimpleDocTemplate(output_file, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Add slides as text (basic conversion)
    for i, slide in enumerate(prs.slides):
        story.append(Paragraph(f"Slide {i+1}", styles['Heading1']))
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text:
                story.append(Paragraph(shape.text, styles['Normal']))
    
    doc.build(story)
    print("Python conversion successful")
    
except Exception as e:
    print(f"Python conversion failed: {e}")
    sys.exit(1)
`;

					const scriptPath = path.join(outputDir, "convert_pptx.py");
					await fs.writeFile(scriptPath, pythonScript);

					await execAsync(`python3 "${scriptPath}" "${filePath}" "${pdfPath}"`);
					conversionSuccess = true;
					console.log("Python conversion successful");

					// Clean up script
					await fs.unlink(scriptPath).catch(() => {});
				} catch (error) {
					console.error("Python conversion failed:", error);
				}
			}

			if (!conversionSuccess) {
				throw new Error(
					"PowerPoint conversion failed. All conversion methods were unsuccessful. Please ensure your PowerPoint file is not corrupted.",
				);
			}

			job.progress = 30;

			// Continue with PDF to images conversion
			const imagesDir = path.join(outputDir, `${jobId}_images`);
			await fs.mkdir(imagesDir, { recursive: true });

			console.log("Converting PDF to images...");

			try {
				// Use pdftoppm first
				await execAsync(
					`pdftoppm -png -r 150 "${pdfPath}" "${imagesDir}/page"`,
				);
			} catch (error) {
				// Fallback to ImageMagick
				const convertCommand = `env -i PATH=/usr/bin:/bin LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu convert -density 150 "${pdfPath}" "${imagesDir}/page-%03d.png"`;
				await execAsync(convertCommand);
			}

			job.progress = 60;

			// Process PowerPoint images for timeline
			console.log("Processing PowerPoint images for timeline...");

			const pageImagesDir = path.join(
				process.cwd(),
				"public",
				"uploads",
				"presentation-pages",
				jobId,
			);
			await fs.mkdir(pageImagesDir, { recursive: true });

			// Get all image files
			const imageFiles = await fs.readdir(imagesDir);
			const sortedImages = imageFiles
				.filter((f) => f.endsWith(".png"))
				.sort((a, b) => {
					const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
					const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
					return aNum - bNum;
				});

			const pageImages: string[] = [];

			for (const [index, imageFile] of sortedImages.entries()) {
				const sourcePath = path.join(imagesDir, imageFile);
				const destPath = path.join(pageImagesDir, `page_${index + 1}.png`);

				await fs.copyFile(sourcePath, destPath);
				pageImages.push(
					`/uploads/presentation-pages/${jobId}/page_${index + 1}.png`,
				);
			}

			// Clean up
			await fs.rm(imagesDir, { recursive: true, force: true });
			await fs.unlink(pdfPath).catch(() => {});

			job.pageImages = pageImages;
		} else {
			throw new Error("Unsupported file format");
		}

		job.progress = 90;

		// Check if page images were created
		if (!job.pageImages || job.pageImages.length === 0) {
			throw new Error("Failed to create slide images");
		}

		// Update job completion
		job.status = "completed";
		job.progress = 100;

		console.log(
			`Conversion completed: ${job.pageImages.length} slides converted`,
		);

		// Clean up original file
		await fs.unlink(filePath).catch(() => {});
	} catch (error) {
		job.status = "failed";
		job.error = error instanceof Error ? error.message : "Unknown error";
		console.error("Conversion job failed:", error);
		throw error;
	}
}

// Cleanup old jobs (run periodically)
setInterval(
	() => {
		const now = Date.now();
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours

		for (const [id, job] of conversionJobs.entries()) {
			if (now - job.createdAt.getTime() > maxAge) {
				conversionJobs.delete(id);
			}
		}
	},
	60 * 60 * 1000,
); // Every hour
