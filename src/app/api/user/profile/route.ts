import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { UserRepository } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);
		
		if (!user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Return user profile data
		return NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				avatarUrl: user.avatarUrl,
				emailVerified: user.emailVerified,
			},
		});
	} catch (error) {
		console.error("Profile fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);
		
		if (!user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { firstName, lastName, avatarUrl } = body;

		// Update user profile
		const updatedUser = await UserRepository.updateProfile(user.id, {
			firstName,
			lastName,
			avatarUrl,
		});

		if (!updatedUser) {
			return NextResponse.json(
				{ error: "Failed to update profile" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			message: "Profile updated successfully",
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				avatarUrl: updatedUser.avatarUrl,
				emailVerified: updatedUser.emailVerified,
			},
		});
	} catch (error) {
		console.error("Profile update error:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 },
		);
	}
}
