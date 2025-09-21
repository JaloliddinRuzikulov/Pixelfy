import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { MediaRepository, ActivityRepository } from "@/lib/db-extended";
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

		// Get all media
		const media = await MediaRepository.findAll();

		// Add user information to each media
		const mediaWithUsers = await Promise.all(
			media.map(async (item) => {
				const mediaUser = await getUserById(item.userId);
				return {
					...item,
					userName: mediaUser
						? `${mediaUser.firstName || ""} ${mediaUser.lastName || ""}`.trim() ||
							mediaUser.email
						: "Noma'lum",
					userEmail: mediaUser?.email || "Noma'lum",
				};
			}),
		);

		// Get stats
		const stats = await MediaRepository.getStats();

		return NextResponse.json({
			media: mediaWithUsers,
			total: media.length,
			stats,
		});
	} catch (error) {
		console.error("Error fetching media:", error);
		return NextResponse.json(
			{ error: "Media fayllarni olishda xatolik" },
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
		const { filename, url, type, size, duration, width, height, projectId } =
			body;

		if (!filename || !url || !type || !size) {
			return NextResponse.json(
				{ error: "Barcha maydonlar talab qilinadi" },
				{ status: 400 },
			);
		}

		// Create media
		const media = await MediaRepository.create({
			userId: user.id,
			projectId,
			filename,
			url,
			type,
			size,
			duration,
			width,
			height,
		});

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Media fayl yukladi",
			details: `${user.firstName || user.email} "${filename}" faylini yukladi`,
			entityType: "media",
			entityId: media.id,
		});

		return NextResponse.json({ media });
	} catch (error) {
		console.error("Error creating media:", error);
		return NextResponse.json(
			{ error: "Media yaratishda xatolik" },
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
		const mediaId = searchParams.get("id");

		if (!mediaId) {
			return NextResponse.json(
				{ error: "Media ID talab qilinadi" },
				{ status: 400 },
			);
		}

		const media = await MediaRepository.findById(mediaId);
		if (!media) {
			return NextResponse.json({ error: "Media topilmadi" }, { status: 404 });
		}

		// Delete media
		await MediaRepository.delete(mediaId);

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Media faylni o'chirdi",
			details: `${user.firstName || user.email} "${media.filename}" faylini o'chirdi`,
			entityType: "media",
			entityId: mediaId,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting media:", error);
		return NextResponse.json(
			{ error: "Media o'chirishda xatolik" },
			{ status: 500 },
		);
	}
}
