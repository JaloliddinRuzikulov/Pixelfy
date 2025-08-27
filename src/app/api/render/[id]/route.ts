import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ message: "id parameter is required" },
				{ status: 400 },
			);
		}

		// Use local render API instead of Combo.sh
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/local-render?id=${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json(
				{ message: error || "Failed to get render status" },
				{ status: response.status },
			);
		}

		const statusData = await response.json();

		// Transform to match expected format
		const transformedData = {
			video: {
				id: statusData.id,
				status:
					statusData.status === "completed"
						? "COMPLETED"
						: statusData.status === "processing"
							? "PENDING"
							: statusData.status.toUpperCase(),
				progress: statusData.progress,
				url: statusData.outputUrl,
				error: statusData.error,
			},
		};

		return NextResponse.json(transformedData, { status: 200 });
	} catch (error: any) {
		console.error("Render status error:", error);

		return NextResponse.json(
			{ message: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
