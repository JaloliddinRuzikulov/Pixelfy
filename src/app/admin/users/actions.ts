"use server";

import { UserRepository } from "@/lib/db";
import { ProjectRepository, ActivityRepository } from "@/lib/db-extended";
import { User, UserRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

// Helper to get all users with additional info
async function getUsersWithDetails() {
	const dbPath = path.join(process.cwd(), "dev-db.json");
	if (!fs.existsSync(dbPath)) {
		return [];
	}

	const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
	const users = data.users || [];
	const sessions = data.sessions || [];
	const projects = data.projects || [];

	// Get active sessions for last login info
	const userSessions = new Map<string, string>();
	sessions.forEach((session: any) => {
		const existingDate = userSessions.get(session.userId);
		if (!existingDate || new Date(session.expiresAt) > new Date(existingDate)) {
			userSessions.set(session.userId, session.expiresAt);
		}
	});

	// Count projects per user
	const projectCounts = new Map<string, number>();
	projects.forEach((project: any) => {
		const count = projectCounts.get(project.userId) || 0;
		projectCounts.set(project.userId, count + 1);
	});

	// Combine all data
	return users.map((user: any) => ({
		id: user.id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		role: user.role || "user",
		emailVerified: user.emailVerified || false,
		avatarUrl: user.avatarUrl,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		projectCount: projectCounts.get(user.id) || 0,
		lastLogin: userSessions.get(user.id),
	}));
}

export async function getAllUsers() {
	try {
		const users = await getUsersWithDetails();
		return users;
	} catch (error) {
		console.error("Error fetching users:", error);
		return [];
	}
}

export async function updateUserRole(userId: string, newRole: UserRole) {
	try {
		// Update user role in database
		const user = await UserRepository.update(userId, { role: newRole });

		if (!user) {
			return { success: false, error: "Foydalanuvchi topilmadi" };
		}

		// Log activity
		await ActivityRepository.create({
			userId: userId,
			action: "Foydalanuvchi roli yangilandi",
			details: `${user.email} uchun rol ${newRole} ga o'zgartirildi`,
			entityType: "user",
			entityId: userId,
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error updating user role:", error);
		return { success: false, error: "Rolni yangilashda xatolik" };
	}
}

export async function deleteUser(userId: string) {
	try {
		// Load database
		const dbPath = path.join(process.cwd(), "dev-db.json");
		const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

		// Find user to get details before deletion
		const user = data.users.find((u: any) => u.id === userId);
		if (!user) {
			return { success: false, error: "Foydalanuvchi topilmadi" };
		}

		// Remove user
		data.users = data.users.filter((u: any) => u.id !== userId);

		// Remove user's sessions
		data.sessions = data.sessions.filter((s: any) => s.userId !== userId);

		// Remove user's projects
		data.projects = (data.projects || []).filter(
			(p: any) => p.userId !== userId,
		);

		// Remove user's media
		data.media = (data.media || []).filter((m: any) => m.userId !== userId);

		// Save changes
		fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Foydalanuvchi o'chirildi",
			details: `${user.email} foydalanuvchisi o'chirildi`,
			entityType: "user",
			entityId: userId,
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error deleting user:", error);
		return { success: false, error: "Foydalanuvchini o'chirishda xatolik" };
	}
}

export async function suspendUser(userId: string) {
	try {
		// Load database
		const dbPath = path.join(process.cwd(), "dev-db.json");
		const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

		// Find user
		const userIndex = data.users.findIndex((u: any) => u.id === userId);
		if (userIndex === -1) {
			return { success: false, error: "Foydalanuvchi topilmadi" };
		}

		// Add suspended flag
		data.users[userIndex].suspended = true;
		data.users[userIndex].suspendedAt = new Date().toISOString();
		data.users[userIndex].updatedAt = new Date().toISOString();

		// Remove user's active sessions
		data.sessions = data.sessions.filter((s: any) => s.userId !== userId);

		// Save changes
		fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Foydalanuvchi to'xtatildi",
			details: `${data.users[userIndex].email} foydalanuvchisi to'xtatildi`,
			entityType: "user",
			entityId: userId,
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error suspending user:", error);
		return { success: false, error: "Foydalanuvchini to'xtatishda xatolik" };
	}
}

export async function verifyUserEmail(userId: string) {
	try {
		// Verify email in database
		const verified = await UserRepository.verifyEmail(userId);

		if (!verified) {
			return { success: false, error: "Foydalanuvchi topilmadi" };
		}

		// Get user details for activity log
		const user = await UserRepository.findById(userId);

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Email tasdiqlandi",
			details: `${user?.email} email manzili tasdiqlandi`,
			entityType: "user",
			entityId: userId,
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error verifying user email:", error);
		return { success: false, error: "Emailni tasdiqlashda xatolik" };
	}
}
