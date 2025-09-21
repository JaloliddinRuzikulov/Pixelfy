import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenFromCookies } from "@/lib/auth";
import { SessionRepository, UserRepository } from "@/lib/db";
import { isAdmin } from "@/lib/role-utils";
import subscriptionManager from "@/lib/subscription-manager";

// GET /api/admin/subscriptions - Get all subscription plans and user subscriptions
export async function GET(request: NextRequest) {
	try {
		const sessionToken = await getSessionTokenFromCookies();

		if (!sessionToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const session = await SessionRepository.findByToken(sessionToken);
		if (!session) {
			return NextResponse.json({ error: "Invalid session" }, { status: 401 });
		}

		const user = await UserRepository.findById(session.userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Admin access required" },
				{ status: 403 },
			);
		}

		// Get data from subscription manager
		const plans = subscriptionManager.getAllPlans();
		const subscriptions = subscriptionManager.getAllSubscriptions();
		const stats = subscriptionManager.getStats();

		return NextResponse.json({
			plans,
			subscriptions,
			stats,
		});
	} catch (error) {
		console.error("Error fetching subscriptions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscriptions" },
			{ status: 500 },
		);
	}
}

// POST /api/admin/subscriptions - Create new subscription plan
export async function POST(request: NextRequest) {
	try {
		const sessionToken = await getSessionTokenFromCookies();

		if (!sessionToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const session = await SessionRepository.findByToken(sessionToken);
		if (!session) {
			return NextResponse.json({ error: "Invalid session" }, { status: 401 });
		}

		const user = await UserRepository.findById(session.userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Admin access required" },
				{ status: 403 },
			);
		}

		const body = await request.json();

		// Create new plan
		const newPlan = subscriptionManager.createPlan(body);

		return NextResponse.json({
			success: true,
			message: "Subscription plan created successfully",
			plan: newPlan,
		});
	} catch (error) {
		console.error("Error creating subscription plan:", error);
		return NextResponse.json(
			{ error: "Failed to create subscription plan" },
			{ status: 500 },
		);
	}
}

// PUT /api/admin/subscriptions - Update existing subscription plan
export async function PUT(request: NextRequest) {
	try {
		const sessionToken = await getSessionTokenFromCookies();

		if (!sessionToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const session = await SessionRepository.findByToken(sessionToken);
		if (!session) {
			return NextResponse.json({ error: "Invalid session" }, { status: 401 });
		}

		const user = await UserRepository.findById(session.userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Admin access required" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const { id, ...updates } = body;

		// Update existing plan
		const updatedPlan = subscriptionManager.updatePlan(id, updates);

		if (!updatedPlan) {
			return NextResponse.json({ error: "Plan not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			message: "Subscription plan updated successfully",
			plan: updatedPlan,
		});
	} catch (error) {
		console.error("Error updating subscription plan:", error);
		return NextResponse.json(
			{ error: "Failed to update subscription plan" },
			{ status: 500 },
		);
	}
}

// DELETE /api/admin/subscriptions - Delete subscription plan
export async function DELETE(request: NextRequest) {
	try {
		const sessionToken = await getSessionTokenFromCookies();

		if (!sessionToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const session = await SessionRepository.findByToken(sessionToken);
		if (!session) {
			return NextResponse.json({ error: "Invalid session" }, { status: 401 });
		}

		const user = await UserRepository.findById(session.userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Admin access required" },
				{ status: 403 },
			);
		}

		const { searchParams } = new URL(request.url);
		const planId = searchParams.get("id");

		if (!planId) {
			return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
		}

		// Delete the plan
		try {
			const deleted = subscriptionManager.deletePlan(planId);

			if (!deleted) {
				return NextResponse.json({ error: "Plan not found" }, { status: 404 });
			}

			return NextResponse.json({
				success: true,
				message: "Subscription plan deleted successfully",
				planId,
			});
		} catch (error: any) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
	} catch (error) {
		console.error("Error deleting subscription plan:", error);
		return NextResponse.json(
			{ error: "Failed to delete subscription plan" },
			{ status: 500 },
		);
	}
}
