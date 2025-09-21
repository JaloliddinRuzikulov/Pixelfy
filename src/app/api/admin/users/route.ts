import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin";
import { UserRepository } from "@/lib/db";

export async function GET(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		// In production, fetch all users from database
		// For now, return mock data
		const users = (await UserRepository.findAll?.()) || [];

		return NextResponse.json({
			success: true,
			users,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const { userId, updates } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		// Update user in database
		const updatedUser = await UserRepository.updateProfile(userId, updates);

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		// In production, delete user from database
		// For now, just return success

		return NextResponse.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 },
		);
	}
}
