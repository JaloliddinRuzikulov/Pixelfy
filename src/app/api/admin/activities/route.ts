import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenFromCookies } from "@/lib/auth";
import { SessionRepository, UserRepository } from "@/lib/db";
import { isAdmin } from "@/lib/role-utils";

// Simple in-memory store for activities
let activities: any[] = [];

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

		// Generate activities based on actual data
		const allUsers = await UserRepository.findAll();
		const generatedActivities = [];

		// Add user registration activities
		for (const u of allUsers) {
			if (u.createdAt) {
				generatedActivities.push({
					id: `user_${u.id}`,
					type: "user_registration",
					userId: u.id,
					userEmail: u.email,
					description: `${u.email} ro'yxatdan o'tdi`,
					createdAt: u.createdAt,
				});
			}
		}

		// Add login activities
		for (const u of allUsers) {
			if (u.lastLogin) {
				generatedActivities.push({
					id: `login_${u.id}_${Date.now()}`,
					type: "user_login",
					userId: u.id,
					userEmail: u.email,
					description: `${u.email} tizimga kirdi`,
					createdAt: u.lastLogin,
				});
			}
		}

		// Sort by date
		generatedActivities.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

		return NextResponse.json({
			activities: generatedActivities,
			total: generatedActivities.length,
		});
	} catch (error) {
		console.error("Error fetching activities:", error);
		return NextResponse.json(
			{ error: "Failed to fetch activities" },
			{ status: 500 },
		);
	}
}

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

		const body = await request.json();

		// Add new activity
		const newActivity = {
			...body,
			id: `activity_${Date.now()}`,
			createdAt: new Date().toISOString(),
		};

		activities.unshift(newActivity);

		// Keep only last 100 activities
		if (activities.length > 100) {
			activities = activities.slice(0, 100);
		}

		return NextResponse.json({
			success: true,
			activity: newActivity,
		});
	} catch (error) {
		console.error("Error creating activity:", error);
		return NextResponse.json(
			{ error: "Failed to create activity" },
			{ status: 500 },
		);
	}
}
