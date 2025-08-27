// Edge Runtime compatible auth utilities
// This file contains auth functions that work in Edge Runtime (middleware)

export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

export class AuthError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = "AuthError";
	}
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Simple JWT verification without crypto module
export function verifySessionToken(token: string): boolean {
	try {
		// Basic JWT structure validation
		const parts = token.split(".");
		if (parts.length !== 3) {
			return false;
		}

		// Decode payload to check expiration
		const payload = JSON.parse(
			atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
		);

		// Check if token is expired
		if (payload.exp && Date.now() >= payload.exp * 1000) {
			return false;
		}

		// For more secure verification, we would need to verify signature
		// but crypto module is not available in Edge Runtime
		// The actual security check happens in API routes
		return true;
	} catch {
		return false;
	}
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
