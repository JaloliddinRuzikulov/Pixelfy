import { NextRequest, NextResponse } from "next/server";
import subscriptionManager from "@/lib/subscription-manager";

// GET /api/subscriptions/plans - Get all active subscription plans for users
export async function GET(request: NextRequest) {
	try {
		// Get all plans from subscription manager
		const allPlans = subscriptionManager.getAllPlans();

		// Filter only active plans for public display
		const activePlans = allPlans.filter((plan) => plan.active);

		return NextResponse.json({
			plans: activePlans,
		});
	} catch (error) {
		console.error("Error fetching subscription plans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscription plans" },
			{ status: 500 },
		);
	}
}
