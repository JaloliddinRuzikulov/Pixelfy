import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export type UserRole = "admin" | "user";

export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	emailVerified: boolean;
	role: UserRole;
	createdAt: string;
	updatedAt: string;
	lastLogin?: string;
}

export interface Session {
	id: string;
	userId: string;
	sessionToken: string;
	expiresAt: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const SESSION_COOKIE_NAME = "session-token";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class AuthError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = "AuthError";
	}
}

export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export function generateSessionToken(): string {
	return jwt.sign(
		{
			type: "session",
			timestamp: Date.now(),
		},
		JWT_SECRET,
		{
			expiresIn: "7d",
		},
	);
}

export function verifySessionToken(token: string): boolean {
	try {
		jwt.verify(token, JWT_SECRET);
		return true;
	} catch {
		return false;
	}
}

export function generateEmailVerificationToken(userId: string): string {
	return jwt.sign(
		{
			userId,
			type: "email_verification",
		},
		JWT_SECRET,
		{
			expiresIn: "24h",
		},
	);
}

export function generatePasswordResetToken(userId: string): string {
	return jwt.sign(
		{
			userId,
			type: "password_reset",
		},
		JWT_SECRET,
		{
			expiresIn: "1h",
		},
	);
}

export function verifyToken(token: string, expectedType: string): any {
	try {
		const payload = jwt.verify(token, JWT_SECRET) as any;
		if (payload.type !== expectedType) {
			throw new AuthError("Invalid token type", "INVALID_TOKEN_TYPE");
		}
		return payload;
	} catch (error) {
		if (error instanceof AuthError) throw error;
		throw new AuthError("Invalid or expired token", "INVALID_TOKEN");
	}
}

export async function setSessionCookie(sessionToken: string) {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: SESSION_DURATION / 1000, // Convert to seconds
		path: "/",
	});
}

export async function clearSessionCookie() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getSessionTokenFromRequest(
	request: NextRequest,
): string | null {
	return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validatePassword(password: string): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	if (!/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (!/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (!/\d/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push("Password must contain at least one special character");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export const SESSION_EXPIRY_TIME = SESSION_DURATION;
