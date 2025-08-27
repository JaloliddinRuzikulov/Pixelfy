import { NextRequest, NextResponse } from "next/server";
import { UserRepository, TokenRepository } from "@/lib/db";
import {
	hashPassword,
	validateEmail,
	validatePassword,
	AuthError,
	generateEmailVerificationToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password, firstName, lastName } = body;

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

		// Validate password strength
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return NextResponse.json(
				{
					error: "Password does not meet requirements",
					details: passwordValidation.errors,
				},
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await UserRepository.findByEmail(email);
		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 },
			);
		}

		// Hash password
		const passwordHash = await hashPassword(password);

		// Create user
		const user = await UserRepository.create({
			email,
			passwordHash,
			firstName,
			lastName,
		});

		// Generate email verification token
		const verificationToken = generateEmailVerificationToken(user.id);
		await TokenRepository.createEmailVerificationToken(
			user.id,
			verificationToken,
		);

		// TODO: Send verification email (implement email service)
		console.log(`Email verification token for ${email}: ${verificationToken}`);

		return NextResponse.json(
			{
				message: "User created successfully",
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					emailVerified: user.emailVerified,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Registration error:", error);

		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
