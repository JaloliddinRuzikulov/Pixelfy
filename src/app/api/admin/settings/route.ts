import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin";
import { loadSettings, saveSettings, SystemSettings } from "@/lib/settings";

export async function GET(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const settings = await loadSettings();

		// Remove sensitive data before sending
		const { smtpPassword, ...safeSettings } = settings;

		return NextResponse.json({
			success: true,
			settings: safeSettings,
		});
	} catch (error) {
		console.error("Error loading settings:", error);
		return NextResponse.json(
			{ error: "Failed to load settings" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const updates = await request.json();

		// Validate settings before saving
		if (updates.sessionTimeout && updates.sessionTimeout < 1) {
			return NextResponse.json(
				{ error: "Session timeout must be at least 1 minute" },
				{ status: 400 },
			);
		}

		if (updates.maxLoginAttempts && updates.maxLoginAttempts < 1) {
			return NextResponse.json(
				{ error: "Max login attempts must be at least 1" },
				{ status: 400 },
			);
		}

		if (updates.maxFileSize && updates.maxFileSize < 1) {
			return NextResponse.json(
				{ error: "Max file size must be at least 1 MB" },
				{ status: 400 },
			);
		}

		// Save settings
		const updatedSettings = await saveSettings(updates);

		// Remove sensitive data before sending response
		const { smtpPassword, ...safeSettings } = updatedSettings;

		return NextResponse.json({
			success: true,
			settings: safeSettings,
			message: "Sozlamalar muvaffaqiyatli saqlandi",
		});
	} catch (error) {
		console.error("Error saving settings:", error);
		return NextResponse.json(
			{ error: "Failed to save settings" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	const adminCheck = await requireAdmin(request);
	if (adminCheck instanceof NextResponse) return adminCheck;

	try {
		const { action } = await request.json();

		switch (action) {
			case "test-email":
				// Test email configuration
				// In production, this would send a test email
				return NextResponse.json({
					success: true,
					message: "Test email yuborildi",
				});

			case "clear-cache":
				// Clear application cache
				// In production, this would clear Redis or other cache
				return NextResponse.json({
					success: true,
					message: "Kesh tozalandi",
				});

			case "backup-settings":
				// Create settings backup
				const settings = await loadSettings();
				return NextResponse.json({
					success: true,
					backup: settings,
					timestamp: new Date().toISOString(),
				});

			default:
				return NextResponse.json({ error: "Unknown action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error processing settings action:", error);
		return NextResponse.json(
			{ error: "Failed to process action" },
			{ status: 500 },
		);
	}
}
