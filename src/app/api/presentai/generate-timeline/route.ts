import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const prompt = formData.get("prompt") as string;
		const slideCount = formData.get("slide_count") as string;
		const language = formData.get("language") as string;
		const templateStyle = formData.get("template_style") as string;

		if (!prompt?.trim()) {
			return NextResponse.json(
				{ success: false, error: "Prompt is required" },
				{ status: 400 },
			);
		}

		console.log("🚀 Forwarding request to PresentAI service...");
		console.log(`📝 Prompt: ${prompt}`);
		console.log(`📊 Slides: ${slideCount || 10}`);
		console.log(`🌐 Language: ${language || "en"}`);

		// Forward request to PresentAI service
		const presentaiFormData = new FormData();
		presentaiFormData.append("prompt", prompt);
		presentaiFormData.append("slide_count", slideCount || "10");
		presentaiFormData.append("language", language || "en");
		presentaiFormData.append("template_style", templateStyle || "modern");

		const PRESENTAI_SERVICE_URL =
			process.env.PRESENTAI_SERVICE_URL || "http://localhost:9004";

		const response = await fetch(
			`${PRESENTAI_SERVICE_URL}/generate-timeline-images`,
			{
				method: "POST",
				body: presentaiFormData,
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ PresentAI service error:", response.status, errorText);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to generate timeline images",
					details: errorText,
				},
				{ status: response.status },
			);
		}

		const result = await response.json();
		console.log(`✅ Timeline images generated: ${result.total_slides} slides`);
		console.log(`🔑 Response keys: ${Object.keys(result).join(", ")}`);

		// Convert base64 images to real files for Remotion compatibility
		const sessionId = nanoid(10);
		const uploadsDir = path.join(
			process.cwd(),
			"public",
			"uploads",
			"presentai",
			sessionId,
		);

		// Create directory
		await fs.mkdir(uploadsDir, { recursive: true });
		console.log(`📁 Created uploads directory: ${uploadsDir}`);

		// Process slide images directly (response structure has slide_images at root level)
		console.log(
			`🔍 Checking slide_images: exists=${!!result.slide_images}, isArray=${Array.isArray(result.slide_images)}, length=${result.slide_images?.length}`,
		);

		if (result.slide_images && Array.isArray(result.slide_images)) {
			console.log(`🔄 Processing ${result.slide_images.length} slides...`);

			for (let i = 0; i < result.slide_images.length; i++) {
				const slide = result.slide_images[i];
				console.log(
					`📋 Slide ${i + 1}: has image_data=${!!slide.image_data}, slide_number=${slide.slide_number}`,
				);

				if (slide.image_data) {
					// Decode base64 and save as file
					const base64Data = slide.image_data.replace(
						/^data:image\/\w+;base64,/,
						"",
					);
					const buffer = Buffer.from(base64Data, "base64");

					const filename = `slide-${slide.slide_number || i + 1}.png`;
					const filepath = path.join(uploadsDir, filename);

					await fs.writeFile(filepath, buffer);

					// Replace base64 with public URL
					slide.image_url = `/uploads/presentai/${sessionId}/${filename}`;
					delete slide.image_data; // Remove base64 to reduce response size

					console.log(
						`💾 Saved slide ${slide.slide_number || i + 1}: ${slide.image_url}`,
					);
				}
			}
		} else {
			console.log(`⚠️ No slide_images to process`);
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("❌ Timeline generation error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Timeline generation failed",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
