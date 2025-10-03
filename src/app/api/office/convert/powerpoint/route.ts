import { NextRequest, NextResponse } from "next/server";

const OFFICE_SERVICE_URL =
	process.env.OFFICE_SERVICE_URL || "http://localhost:9002";

export async function POST(request: NextRequest) {
	try {
		// Get the form data from the request
		const formData = await request.formData();

		// Forward the request to the office service with API key
		const response = await fetch(`${OFFICE_SERVICE_URL}/convert/powerpoint`, {
			method: "POST",
			body: formData,
			headers: {
				"X-API-Key": "office_default_dev_key_2024",
			},
		});

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json(
				{ error: `Office service error: ${error}` },
				{ status: response.status },
			);
		}

		const data = await response.json();

		// Transform the download URLs to use our proxy endpoint
		if (data.download_urls && Array.isArray(data.download_urls)) {
			data.images = data.download_urls.map((url: string) => {
				const parts = url.split("/");
				const sessionId = parts[parts.length - 2];
				const filename = parts[parts.length - 1];
				return `/api/office/download/${sessionId}/${filename}`;
			});
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("PowerPoint conversion error:", error);
		return NextResponse.json(
			{ error: "Failed to convert PowerPoint" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
