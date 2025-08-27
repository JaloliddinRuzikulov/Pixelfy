import { NextRequest, NextResponse } from "next/server";
import { UserRepository, SessionRepository } from "@/lib/db";
import {
	verifyPassword,
	generateSessionToken,
	setSessionCookie,
	AuthError,
	validateEmail,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		// Validate input
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		// Validate email format
		if (!validateEmail(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 },
			);
		}

		// Find user
		const user = await UserRepository.findByEmail(email);
		if (!user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// Verify password
		const isPasswordValid = await verifyPassword(password, user.passwordHash);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// Generate session
		const sessionToken = generateSessionToken();
		await SessionRepository.create(user.id, sessionToken);

		// Create response with user data
		const response = NextResponse.json({
			message: "Login successful",
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				avatarUrl: user.avatarUrl,
				emailVerified: user.emailVerified,
			},
		});

		// Set session cookie directly in the response
		response.cookies.set("session-token", sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);

		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
