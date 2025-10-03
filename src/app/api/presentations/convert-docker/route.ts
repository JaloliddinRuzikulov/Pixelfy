import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

// Check if Docker service is running
async function checkDockerService(): Promise<boolean> {
	try {
		const converterUrl =
			process.env.LIBREOFFICE_CONVERTER_URL || "http://localhost:8080";
		const response = await fetch(`${converterUrl}/health`);
		if (response.ok) {
			const data = await response.json();
			return data.status === "healthy";
		}
	} catch (error) {
		console.log("Docker service not available:", error);
	}
	return false;
}

export async function POST(request: NextRequest) {
	try {
		const { filePath, jobId } = await request.json();

		if (!filePath || !jobId) {
			return NextResponse.json(
				{ error: "Missing parameters" },
				{ status: 400 },
			);
		}

		console.log(`Converting presentation via Docker: ${filePath}`);

		// Check if Docker service is available
		const serviceAvailable = await checkDockerService();
		if (!serviceAvailable) {
			return NextResponse.json(
				{
					error:
						"LibreOffice Docker service is not running. Please start it with: docker-compose up -d",
				},
				{ status: 503 },
			);
		}

		// Create output directory
		const outputDir = path.join(
			"public",
			"uploads",
			"presentation-pages",
			jobId,
		);
		await fs.mkdir(outputDir, { recursive: true });

		// Convert file path for Docker container
		const dockerInputPath = filePath.replace(
			process.cwd() + "/public/uploads",
			"/data",
		);
		const dockerOutputPath = `/data/presentation-pages/${jobId}`;

		// Call Docker service API
		console.log(`Calling Docker service API for conversion...`);

		try {
			const converterUrl =
				process.env.LIBREOFFICE_CONVERTER_URL || "http://localhost:8080";
			const response = await fetch(`${converterUrl}/convert`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input_file: dockerInputPath,
					output_dir: dockerOutputPath,
					format: "png",
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error("Docker API conversion failed:", error);
				throw new Error(error.error || "Conversion failed");
			}

			const result = await response.json();
			console.log(
				`Conversion successful: ${result.files?.length || 0} files generated`,
			);
		} catch (error) {
			console.error("Docker conversion failed:", error);
			throw new Error("Conversion failed in Docker service");
		}

		// Process generated images
		const imageFiles = await fs.readdir(outputDir);
		const sortedImages = imageFiles
			.filter((f) => f.endsWith(".png"))
			.sort((a, b) => {
				const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
				const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
				return aNum - bNum;
			});

		const pageImages: string[] = [];

		// Optimize images with Sharp
		for (const [index, imageFile] of sortedImages.entries()) {
			const sourcePath = path.join(outputDir, imageFile);
			const destFileName = `slide_${index + 1}.png`;
			const destPath = path.join(outputDir, destFileName);

			// Rename and optimize
			if (imageFile !== destFileName) {
				await sharp(sourcePath)
					.resize(1920, 1080, {
						fit: "inside",
						withoutEnlargement: true,
						background: { r: 255, g: 255, b: 255, alpha: 1 },
					})
					.png({ quality: 95, compressionLevel: 6 })
					.toFile(destPath);

				// Remove original
				if (sourcePath !== destPath) {
					await fs.unlink(sourcePath);
				}
			}

			pageImages.push(`/uploads/presentation-pages/${jobId}/${destFileName}`);
		}

		console.log(`Docker conversion completed: ${pageImages.length} slides`);

		return NextResponse.json({
			success: true,
			pageImages,
			slideCount: pageImages.length,
		});
	} catch (error) {
		console.error("Docker conversion API error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Conversion failed" },
			{ status: 500 },
		);
	}
}
