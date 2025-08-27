import { NextRequest, NextResponse } from "next/server";
import { UserRepository, TokenRepository } from "@/lib/db";
import { verifyToken, AuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return NextResponse.json(
				{ error: "Verification token is required" },
				{ status: 400 },
			);
		}

		// Verify JWT token
		const payload = verifyToken(token, "email_verification");

		// Find token in database
		const tokenData = await TokenRepository.findEmailVerificationToken(token);
		if (!tokenData) {
			return NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 400 },
			);
		}

		// Check if token is expired
		if (new Date() > tokenData.expiresAt) {
			await TokenRepository.deleteEmailVerificationToken(token);
			return NextResponse.json({ error: "Token has expired" }, { status: 400 });
		}

		// Verify email
		await UserRepository.verifyEmail(tokenData.userId);

		// Delete token
		await TokenRepository.deleteEmailVerificationToken(token);

		return NextResponse.json({ message: "Email verified successfully" });
	} catch (error) {
		console.error("Email verification error:", error);

		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
