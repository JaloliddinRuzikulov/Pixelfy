"use server";

import { revalidatePath } from "next/cache";
import { ProjectRepository, ActivityRepository } from "@/lib/db-extended";
import fs from "fs";
import path from "path";

export interface Project {
	id: string;
	title: string;
	userId: string;
	userEmail: string;
	userName?: string;
	status: "draft" | "published" | "archived";
	duration: number; // in seconds
	createdAt: string;
	updatedAt: string;
	thumbnail?: string;
	exportCount: number;
}

// Helper to get user by ID
async function getUserById(userId: string) {
	const dbPath = path.join(process.cwd(), "dev-db.json");
	if (fs.existsSync(dbPath)) {
		const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
		const users = data.users || [];
		return users.find((u: any) => u.id === userId);
	}
	return null;
}

export async function getAllProjects() {
	try {
		// Get real projects from database
		const projects = await ProjectRepository.findAll();

		// Add user information to each project
		const projectsWithUsers = await Promise.all(
			projects.map(async (project) => {
				const user = await getUserById(project.userId);
				return {
					id: project.id,
					title: project.title,
					userId: project.userId,
					userEmail: user?.email || "Noma'lum",
					userName: user
						? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
							user.email
						: "Noma'lum",
					status: project.status,
					duration: project.duration,
					createdAt: project.createdAt,
					updatedAt: project.updatedAt,
					thumbnail: project.thumbnailUrl,
					exportCount: project.exportCount,
				};
			}),
		);

		return projectsWithUsers;
	} catch (error) {
		console.error("Error fetching projects:", error);
		return [];
	}
}

export async function deleteProject(projectId: string) {
	try {
		// Get project details before deletion
		const project = await ProjectRepository.findById(projectId);
		if (!project) {
			return { success: false, error: "Loyiha topilmadi" };
		}

		// Delete project from database
		const deleted = await ProjectRepository.delete(projectId);

		if (!deleted) {
			return { success: false, error: "Loyihani o'chirishda xatolik" };
		}

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Loyiha o'chirildi",
			details: `"${project.title}" loyihasi o'chirildi`,
			entityType: "project",
			entityId: projectId,
		});

		revalidatePath("/admin/projects");
		return { success: true };
	} catch (error) {
		console.error("Error deleting project:", error);
		return { success: false, error: "Loyihani o'chirishda xatolik" };
	}
}

export async function archiveProject(projectId: string) {
	try {
		// Get project details
		const project = await ProjectRepository.findById(projectId);
		if (!project) {
			return { success: false, error: "Loyiha topilmadi" };
		}

		// Update project status to archived
		const updated = await ProjectRepository.update(projectId, {
			status: "archived",
		});

		if (!updated) {
			return { success: false, error: "Loyihani arxivlashda xatolik" };
		}

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Loyiha arxivlandi",
			details: `"${project.title}" loyihasi arxivlandi`,
			entityType: "project",
			entityId: projectId,
		});

		revalidatePath("/admin/projects");
		return { success: true };
	} catch (error) {
		console.error("Error archiving project:", error);
		return { success: false, error: "Loyihani arxivlashda xatolik" };
	}
}

export async function restoreProject(projectId: string) {
	try {
		// Get project details
		const project = await ProjectRepository.findById(projectId);
		if (!project) {
			return { success: false, error: "Loyiha topilmadi" };
		}

		// Update project status from archived to draft
		const updated = await ProjectRepository.update(projectId, {
			status: "draft",
		});

		if (!updated) {
			return { success: false, error: "Loyihani tiklashda xatolik" };
		}

		// Log activity
		await ActivityRepository.create({
			userId: "system",
			action: "Loyiha tiklandi",
			details: `"${project.title}" loyihasi tiklandi`,
			entityType: "project",
			entityId: projectId,
		});

		revalidatePath("/admin/projects");
		return { success: true };
	} catch (error) {
		console.error("Error restoring project:", error);
		return { success: false, error: "Loyihani tiklashda xatolik" };
	}
}
