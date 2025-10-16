import { NextRequest, NextResponse } from "next/server";

// Short timeout for job submission (just returns job_id)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		// Get lipsync service URL from environment
		const lipsyncServiceUrl =
			process.env.LIPSYNC_SERVICE_URL || "http://localhost:11430";

		// Get API key from environment
		const apiKey =
			process.env.LIPSYNC_API_KEY || "wav2lip_default_dev_key_2024";

		console.log("📤 Submitting job to lipsync service:", lipsyncServiceUrl);
		console.log("🔑 Using API key:", apiKey.substring(0, 10) + "...");

		// Build API URL for job submission
		const apiUrl = lipsyncServiceUrl.includes('/lipsync')
			? `${lipsyncServiceUrl}/submit-job`
			: `${lipsyncServiceUrl}/lipsync/submit-job`;

		console.log("🌐 Full API URL:", apiUrl);

		const response = await fetch(apiUrl, {
			method: "POST",
			body: formData,
			headers: {
				"X-API-Key": apiKey,
			},
		});

		console.log("📥 Response status from lipsync service:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Lipsync service error:", errorText);
			console.error("❌ Response status:", response.status);
			return NextResponse.json(
				{
					error: "Failed to submit job",
					details: errorText,
					status: response.status,
				},
				{ status: response.status },
			);
		}

		// Get the job_id from response
		const data = await response.json();
		console.log("✅ Job submitted successfully:", data.job_id);

		return NextResponse.json(data);
	} catch (error) {
		console.error("❌ Error in submit-job API:", error);

		// Check if it's a network error
		if (error instanceof TypeError && error.message.includes("fetch")) {
			console.error("🌐 Network error - cannot reach lipsync service");
			return NextResponse.json(
				{
					error: "Cannot connect to AI service",
					details: "AI xizmati mavjud emas. Iltimos, xizmat ishga tushganini tekshiring.",
				},
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{
				error: "Failed to submit job",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
