import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const prompt = formData.get("prompt") as string;
		const slideCount = parseInt(formData.get("slide_count") as string) || 10;
		const language = (formData.get("language") as string) || "en";
		const templateStyle =
			(formData.get("template_style") as string) || "modern";

		if (!prompt?.trim()) {
			return NextResponse.json(
				{ success: false, error: "Prompt is required" },
				{ status: 400 },
			);
		}

		console.log("Creating PowerPoint presentation with PresentAI service...");
		const startTime = Date.now();

		// Step 1: Create PowerPoint file via PresentAI service
		const PRESENTAI_SERVICE_URL =
			process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

		const pptxFormData = new FormData();
		pptxFormData.append("prompt", prompt);
		pptxFormData.append("slide_count", slideCount.toString());
		pptxFormData.append("language", language);
		pptxFormData.append("template_style", templateStyle);
		pptxFormData.append("format", "pptx");

		const pptxResponse = await fetch(`${PRESENTAI_SERVICE_URL}/generate`, {
			method: "POST",
			body: pptxFormData,
		});

		if (!pptxResponse.ok) {
			console.error(
				"PresentAI PPTX generation failed:",
				await pptxResponse.text(),
			);
			return NextResponse.json(
				{ success: false, error: "Failed to generate PowerPoint file" },
				{ status: 500 },
			);
		}

		const pptxResult = await pptxResponse.json();
		if (!pptxResult.success || !pptxResult.download_url) {
			console.error("PresentAI returned no download URL");
			return NextResponse.json(
				{ success: false, error: "PowerPoint generation failed" },
				{ status: 500 },
			);
		}

		console.log("PowerPoint file created:", pptxResult.download_url);

		// Step 2: Download the PPTX file
		const fileResponse = await fetch(
			`${PRESENTAI_SERVICE_URL}${pptxResult.download_url}`,
		);
		if (!fileResponse.ok) {
			console.error("Failed to download PPTX file");
			return NextResponse.json(
				{ success: false, error: "Failed to download PowerPoint file" },
				{ status: 500 },
			);
		}

		const pptxBuffer = await fileResponse.arrayBuffer();
		console.log("Downloaded PPTX file:", pptxBuffer.byteLength, "bytes");

		// Step 3: Convert PPTX to PNG images using Office service
		const OFFICE_SERVICE_URL =
			process.env.OFFICE_SERVICE_URL || "http://localhost:9002";

		const officeFormData = new FormData();
		officeFormData.append("file", new Blob([pptxBuffer]), "presentation.pptx");
		officeFormData.append("output_format", "png");
		officeFormData.append("dpi", "150"); // Good quality for video

		const conversionResponse = await fetch(
			`${OFFICE_SERVICE_URL}/convert/powerpoint`,
			{
				method: "POST",
				body: officeFormData,
			},
		);

		if (!conversionResponse.ok) {
			console.error(
				"Office service conversion failed:",
				await conversionResponse.text(),
			);
			return NextResponse.json(
				{ success: false, error: "Failed to convert PowerPoint to images" },
				{ status: 500 },
			);
		}

		// Step 4: Extract PNG files from ZIP response
		const zipBuffer = await conversionResponse.arrayBuffer();
		console.log(
			"Received converted images ZIP:",
			zipBuffer.byteLength,
			"bytes",
		);

		// Extract PNG files using JSZip
		const zip = new JSZip();
		const zipContents = await zip.loadAsync(zipBuffer);

		const slideImages: Array<{
			name: string;
			data: string; // base64 encoded
			index: number;
		}> = [];

		// Extract all PNG files
		for (const [filename, file] of Object.entries(zipContents.files)) {
			if (filename.toLowerCase().endsWith(".png") && !file.dir) {
				console.log("Found slide image:", filename);
				const imageBuffer = await file.async("nodebuffer");
				const base64Data = imageBuffer.toString("base64");

				// Extract slide number from filename (e.g., "slide_1.png" -> 1)
				const slideNumber = parseInt(filename.match(/(\d+)/)?.[1] || "0");

				slideImages.push({
					name: filename,
					data: base64Data,
					index: slideNumber,
				});
			}
		}

		// Sort by slide index
		slideImages.sort((a, b) => a.index - b.index);
		console.log(`Extracted ${slideImages.length} slide images`);

		return NextResponse.json({
			success: true,
			powerpoint_created: true,
			powerpoint_url: pptxResult.download_url,
			powerpoint_size: pptxBuffer.byteLength,
			images_converted: true,
			images_count: slideImages.length,
			slide_images: slideImages,
			metadata: {
				original_prompt: prompt,
				language: language,
				template_style: templateStyle,
				generated_at: new Date().toISOString(),
				processing_time: Date.now() - startTime,
			},
		});
	} catch (error) {
		console.error("PowerPoint generation error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to generate PowerPoint presentation",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
