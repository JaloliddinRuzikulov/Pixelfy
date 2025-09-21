// System settings configuration
export interface SystemSettings {
	// General
	siteName: string;
	siteUrl: string;
	maintenanceMode: boolean;
	registrationEnabled: boolean;

	// Security
	emailVerificationRequired: boolean;
	twoFactorEnabled: boolean;
	sessionTimeout: number; // in minutes
	maxLoginAttempts: number;

	// Email
	smtpHost: string;
	smtpPort: number;
	smtpUser: string;
	smtpPassword?: string;
	smtpSecure: boolean;

	// Storage
	maxFileSize: number; // in MB
	maxProjectSize: number; // in MB
	userStorageLimit: number; // in GB
	s3Enabled: boolean;

	// Notifications
	notifyNewUser: boolean;
	notifySystemErrors: boolean;
	notifyStorageWarning: boolean;
	adminEmail: string;
}

// Default settings
export const defaultSettings: SystemSettings = {
	// General
	siteName: "Pixelfy Video Editor",
	siteUrl: "https://pixelfy.uz",
	maintenanceMode: false,
	registrationEnabled: true,

	// Security
	emailVerificationRequired: false,
	twoFactorEnabled: false,
	sessionTimeout: 10080, // 7 days
	maxLoginAttempts: 5,

	// Email
	smtpHost: "",
	smtpPort: 587,
	smtpUser: "",
	smtpSecure: true,

	// Storage
	maxFileSize: 100,
	maxProjectSize: 500,
	userStorageLimit: 5,
	s3Enabled: false,

	// Notifications
	notifyNewUser: true,
	notifySystemErrors: true,
	notifyStorageWarning: true,
	adminEmail: "",
};

// Settings storage (file-based for development)
import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

export async function loadSettings(): Promise<SystemSettings> {
	try {
		// Ensure data directory exists
		const dataDir = path.dirname(SETTINGS_FILE);
		await fs.mkdir(dataDir, { recursive: true });

		// Try to read existing settings
		const fileContent = await fs.readFile(SETTINGS_FILE, "utf-8");
		const settings = JSON.parse(fileContent);

		// Merge with defaults to ensure all fields exist
		return { ...defaultSettings, ...settings };
	} catch (error) {
		// If file doesn't exist or error reading, return defaults
		return defaultSettings;
	}
}

export async function saveSettings(
	settings: Partial<SystemSettings>,
): Promise<SystemSettings> {
	try {
		// Load current settings
		const currentSettings = await loadSettings();

		// Merge new settings
		const updatedSettings = { ...currentSettings, ...settings };

		// Ensure data directory exists
		const dataDir = path.dirname(SETTINGS_FILE);
		await fs.mkdir(dataDir, { recursive: true });

		// Save to file
		await fs.writeFile(
			SETTINGS_FILE,
			JSON.stringify(updatedSettings, null, 2),
			"utf-8",
		);

		return updatedSettings;
	} catch (error) {
		console.error("Error saving settings:", error);
		throw new Error("Failed to save settings");
	}
}

// Get specific setting
export async function getSetting<K extends keyof SystemSettings>(
	key: K,
): Promise<SystemSettings[K]> {
	const settings = await loadSettings();
	return settings[key];
}

// Update specific setting
export async function updateSetting<K extends keyof SystemSettings>(
	key: K,
	value: SystemSettings[K],
): Promise<void> {
	await saveSettings({ [key]: value });
}
