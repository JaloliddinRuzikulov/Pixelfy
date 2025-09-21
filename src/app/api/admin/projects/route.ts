import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { ProjectRepository, ActivityRepository } from "@/lib/db-extended";
import { isAdmin } from "@/lib/role-utils";
import fs from "fs";
import path from "path";

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

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 403 });
		}

		// Get all projects
		const projects = await ProjectRepository.findAll();

		// Add user information to each project
		const projectsWithUsers = await Promise.all(
			projects.map(async (project) => {
				const projectUser = await getUserById(project.userId);
				return {
					...project,
					userName: projectUser
						? `${projectUser.firstName || ""} ${projectUser.lastName || ""}`.trim() ||
							projectUser.email
						: "Noma'lum",
					userEmail: projectUser?.email || "Noma'lum",
				};
			}),
		);

		return NextResponse.json({
			projects: projectsWithUsers,
			total: projects.length,
		});
	} catch (error) {
		console.error("Error fetching projects:", error);
		return NextResponse.json(
			{ error: "Loyihalarni olishda xatolik" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user) {
			return NextResponse.json(
				{ error: "Autentifikatsiya talab qilinadi" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { title, description, duration, status } = body;

		if (!title) {
			return NextResponse.json(
				{ error: "Loyiha nomi talab qilinadi" },
				{ status: 400 },
			);
		}

		// Create project
		const project = await ProjectRepository.create({
			userId: user.id,
			title,
			description,
			duration,
			status: status || "draft",
		});

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Yangi loyiha yaratdi",
			details: `${user.firstName || user.email} "${title}" loyihasini yaratdi`,
			entityType: "project",
			entityId: project.id,
		});

		return NextResponse.json({ project });
	} catch (error) {
		console.error("Error creating project:", error);
		return NextResponse.json(
			{ error: "Loyiha yaratishda xatolik" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const projectId = searchParams.get("id");

		if (!projectId) {
			return NextResponse.json(
				{ error: "Loyiha ID talab qilinadi" },
				{ status: 400 },
			);
		}

		const project = await ProjectRepository.findById(projectId);
		if (!project) {
			return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
		}

		// Delete project
		await ProjectRepository.delete(projectId);

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Loyihani o'chirdi",
			details: `${user.firstName || user.email} "${project.title}" loyihasini o'chirdi`,
			entityType: "project",
			entityId: projectId,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting project:", error);
		return NextResponse.json(
			{ error: "Loyihani o'chirishda xatolik" },
			{ status: 500 },
		);
	}
}
