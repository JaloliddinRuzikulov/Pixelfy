// Server-side auth utilities with full Node.js support
// This file is for use in API routes and server components

import jwt from "jsonwebtoken";
import { SessionRepository, UserRepository } from "./db";

export interface AuthenticatedUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	emailVerified: boolean;
	role: "admin" | "user";
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export class AuthError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = "AuthError";
	}
}

// Verify JWT token and return user data
export async function verifyAuthToken(
	token: string,
): Promise<AuthenticatedUser | null> {
	try {
		// Verify JWT signature
		const payload = jwt.verify(token, JWT_SECRET) as any;

		if (payload.type !== "session") {
			return null;
		}

		// Find session in database
		const session = await SessionRepository.findByToken(token);
		if (!session) {
			return null;
		}

		// Get user data
		const user = await UserRepository.findById(session.userId);
		if (!user) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			emailVerified: user.emailVerified,
			role: user.role,
		};
	} catch (error) {
		console.error("Token verification failed:", error);
		return null;
	}
}

// Get authenticated user from request cookies
export async function getAuthenticatedUser(
	request: Request,
): Promise<AuthenticatedUser | null> {
	try {
		const cookieHeader = request.headers.get("cookie");
		if (!cookieHeader) {
			return null;
		}

		// Parse cookies manually to get session token
		const cookies = cookieHeader.split(";").reduce(
			(acc, cookie) => {
				const [key, value] = cookie.trim().split("=");
				acc[key] = value;
				return acc;
			},
			{} as Record<string, string>,
		);

		const sessionToken = cookies["session-token"];
		if (!sessionToken) {
			return null;
		}

		return await verifyAuthToken(sessionToken);
	} catch (error) {
		console.error("Failed to get authenticated user:", error);
		return null;
	}
}

// Middleware helper for protecting API routes
export function requireAuth<T extends Record<string, any>>(
	handler: (
		request: Request,
		context: T & { user: AuthenticatedUser },
	) => Promise<Response>,
) {
	return async (request: Request, context: T): Promise<Response> => {
		const user = await getAuthenticatedUser(request);

		if (!user) {
			return new Response(
				JSON.stringify({ error: "Authentication required" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return handler(request, { ...context, user });
	};
}
