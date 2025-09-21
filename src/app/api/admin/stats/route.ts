import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin";
import {
	getDashboardStats,
	getUserStats,
	getProjectStats,
	getSystemHealth,
} from "@/app/admin/utils/stats";

export async function GET(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type") || "dashboard";

		let stats;

		switch (type) {
			case "users":
				stats = await getUserStats();
				break;
			case "projects":
				stats = await getProjectStats();
				break;
			case "system":
				stats = await getSystemHealth();
				break;
			case "dashboard":
			default:
				stats = await getDashboardStats();
				break;
		}

		return NextResponse.json({
			success: true,
			stats,
		});
	} catch (error) {
		console.error("Error fetching stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statistics" },
			{ status: 500 },
		);
	}
}
