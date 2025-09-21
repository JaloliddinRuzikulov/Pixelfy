import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { ActivityRepository } from "@/lib/db-extended";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 403 });
		}

		// Create backups directory if it doesn't exist
		const backupDir = path.join(process.cwd(), "backups");
		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		// Read current database
		const dbPath = path.join(process.cwd(), "dev-db.json");
		if (!fs.existsSync(dbPath)) {
			return NextResponse.json(
				{ error: "Ma'lumotlar bazasi topilmadi" },
				{ status: 404 },
			);
		}

		const dbContent = fs.readFileSync(dbPath, "utf-8");
		const dbData = JSON.parse(dbContent);

		// Create backup filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupFilename = `backup-${timestamp}.json`;
		const backupPath = path.join(backupDir, backupFilename);

		// Add metadata to backup
		const backupData = {
			...dbData,
			_backup_metadata: {
				created_at: new Date().toISOString(),
				created_by: user.email,
				version: "1.0.0",
				total_users: dbData.users?.length || 0,
				total_projects: dbData.projects?.length || 0,
				total_media: dbData.media?.length || 0,
			},
		};

		// Write backup file
		fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Zaxira nusxa yaratildi",
			details: `${user.firstName || user.email} ${backupFilename} zaxira nusxasini yaratdi`,
			entityType: "user",
		});

		// Return backup file for download
		const fileBuffer = fs.readFileSync(backupPath);

		return new NextResponse(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="${backupFilename}"`,
			},
		});
	} catch (error) {
		console.error("Error creating backup:", error);
		return NextResponse.json(
			{ error: "Zaxira yaratishda xatolik" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 403 });
		}

		// Get backup file from request
		const formData = await request.formData();
		const file = formData.get("backup") as File;

		if (!file) {
			return NextResponse.json(
				{ error: "Zaxira fayli topilmadi" },
				{ status: 400 },
			);
		}

		// Read backup content
		const backupContent = await file.text();
		const backupData = JSON.parse(backupContent);

		// Validate backup structure
		if (!backupData.users || !backupData.sessions) {
			return NextResponse.json(
				{ error: "Noto'g'ri zaxira fayli formati" },
				{ status: 400 },
			);
		}

		// Create backup of current database before restoring
		const dbPath = path.join(process.cwd(), "dev-db.json");
		const currentDbContent = fs.readFileSync(dbPath, "utf-8");

		const backupDir = path.join(process.cwd(), "backups");
		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const beforeRestoreBackup = path.join(
			backupDir,
			`before-restore-${timestamp}.json`,
		);
		fs.writeFileSync(beforeRestoreBackup, currentDbContent);

		// Remove backup metadata before restoring
		delete backupData._backup_metadata;

		// Restore database
		fs.writeFileSync(dbPath, JSON.stringify(backupData, null, 2));

		// Log activity
		await ActivityRepository.create({
			userId: user.id,
			action: "Ma'lumotlar tiklandi",
			details: `${user.firstName || user.email} zaxiradan ma'lumotlarni tikladi`,
			entityType: "user",
		});

		return NextResponse.json({
			success: true,
			message: "Ma'lumotlar muvaffaqiyatli tiklandi",
			restored: {
				users: backupData.users?.length || 0,
				projects: backupData.projects?.length || 0,
				media: backupData.media?.length || 0,
			},
		});
	} catch (error) {
		console.error("Error restoring backup:", error);
		return NextResponse.json({ error: "Tiklashda xatolik" }, { status: 500 });
	}
}
