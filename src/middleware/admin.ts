import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenFromRequest } from "@/lib/auth";
import { SessionRepository, UserRepository } from "@/lib/db";
import { isAdmin } from "@/lib/role-utils";

export async function requireAdmin(request: NextRequest) {
	const sessionToken = getSessionTokenFromRequest(request);

	if (!sessionToken) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 },
		);
	}

	const session = await SessionRepository.findByToken(sessionToken);
	if (!session) {
		return NextResponse.json({ error: "Invalid session" }, { status: 401 });
	}

	const user = await UserRepository.findById(session.userId);
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	if (!isAdmin(user)) {
		return NextResponse.json(
			{ error: "Admin access required" },
			{ status: 403 },
		);
	}

	return { user, session };
}

export async function getCurrentUser(request: NextRequest) {
	const sessionToken = getSessionTokenFromRequest(request);

	if (!sessionToken) {
		return null;
	}

	const session = await SessionRepository.findByToken(sessionToken);
	if (!session) {
		return null;
	}

	const user = await UserRepository.findById(session.userId);
	return user;
}
