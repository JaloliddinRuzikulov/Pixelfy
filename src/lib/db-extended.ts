import fs from "fs";
import path from "path";
import { Project, Media, Activity } from "./db-models";

// Extended file-based storage for development
const DB_FILE = path.join(process.cwd(), "dev-db.json");

interface ExtendedDatabase {
	projects: Project[];
	media: Media[];
	activities: Activity[];
	projectIdCounter: number;
	mediaIdCounter: number;
	activityIdCounter: number;
}

// Load database with extended fields
function loadDb(): any {
	if (!fs.existsSync(DB_FILE)) {
		return {
			users: [],
			sessions: [],
			tokens: [],
			projects: [],
			media: [],
			activities: [],
			userIdCounter: 1,
			sessionIdCounter: 1,
			projectIdCounter: 1,
			mediaIdCounter: 1,
			activityIdCounter: 1,
		};
	}

	try {
		const data = fs.readFileSync(DB_FILE, "utf-8");
		const db = JSON.parse(data);

		// Ensure extended fields exist
		if (!db.projects) db.projects = [];
		if (!db.media) db.media = [];
		if (!db.activities) db.activities = [];
		if (!db.projectIdCounter) db.projectIdCounter = 1;
		if (!db.mediaIdCounter) db.mediaIdCounter = 1;
		if (!db.activityIdCounter) db.activityIdCounter = 1;

		return db;
	} catch (error) {
		console.error("Error reading database file:", error);
		return {
			users: [],
			sessions: [],
			tokens: [],
			projects: [],
			media: [],
			activities: [],
			userIdCounter: 1,
			sessionIdCounter: 1,
			projectIdCounter: 1,
			mediaIdCounter: 1,
			activityIdCounter: 1,
		};
	}
}

// Save database
function saveDb(db: any) {
	fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Project Repository
export class ProjectRepository {
	static async create(projectData: {
		userId: string;
		title: string;
		description?: string;
		thumbnailUrl?: string;
		duration?: number;
		status?: "draft" | "published" | "archived";
	}): Promise<Project> {
		const db = loadDb();

		const project: Project = {
			id: db.projectIdCounter.toString(),
			userId: projectData.userId,
			title: projectData.title,
			description: projectData.description,
			thumbnailUrl: projectData.thumbnailUrl,
			duration: projectData.duration || 0,
			status: projectData.status || "draft",
			exportCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		db.projects.push(project);
		db.projectIdCounter++;
		saveDb(db);

		return project;
	}

	static async findAll(): Promise<Project[]> {
		const db = loadDb();
		return db.projects || [];
	}

	static async findByUserId(userId: string): Promise<Project[]> {
		const db = loadDb();
		return (db.projects || []).filter((p: Project) => p.userId === userId);
	}

	static async findById(id: string): Promise<Project | null> {
		const db = loadDb();
		return (db.projects || []).find((p: Project) => p.id === id) || null;
	}

	static async update(
		id: string,
		updates: Partial<Project>,
	): Promise<Project | null> {
		const db = loadDb();
		const index = (db.projects || []).findIndex((p: Project) => p.id === id);

		if (index === -1) return null;

		db.projects[index] = {
			...db.projects[index],
			...updates,
			id: db.projects[index].id, // Preserve ID
			updatedAt: new Date().toISOString(),
		};

		saveDb(db);
		return db.projects[index];
	}

	static async delete(id: string): Promise<boolean> {
		const db = loadDb();
		const index = (db.projects || []).findIndex((p: Project) => p.id === id);

		if (index === -1) return false;

		db.projects.splice(index, 1);
		saveDb(db);
		return true;
	}

	static async getStats(): Promise<{
		total: number;
		published: number;
		draft: number;
		totalDuration: number;
		totalExports: number;
	}> {
		const db = loadDb();
		const projects: Project[] = db.projects || [];

		return {
			total: projects.length,
			published: projects.filter((p) => p.status === "published").length,
			draft: projects.filter((p) => p.status === "draft").length,
			totalDuration: projects.reduce((sum, p) => sum + (p.duration || 0), 0),
			totalExports: projects.reduce((sum, p) => sum + (p.exportCount || 0), 0),
		};
	}
}

// Media Repository
export class MediaRepository {
	static async create(mediaData: {
		userId: string;
		projectId?: string;
		filename: string;
		url: string;
		type: "video" | "audio" | "image";
		size: number;
		duration?: number;
		width?: number;
		height?: number;
	}): Promise<Media> {
		const db = loadDb();

		const media: Media = {
			id: db.mediaIdCounter.toString(),
			userId: mediaData.userId,
			projectId: mediaData.projectId,
			filename: mediaData.filename,
			url: mediaData.url,
			type: mediaData.type,
			size: mediaData.size,
			duration: mediaData.duration,
			width: mediaData.width,
			height: mediaData.height,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		db.media.push(media);
		db.mediaIdCounter++;
		saveDb(db);

		return media;
	}

	static async findAll(): Promise<Media[]> {
		const db = loadDb();
		return db.media || [];
	}

	static async findByUserId(userId: string): Promise<Media[]> {
		const db = loadDb();
		return (db.media || []).filter((m: Media) => m.userId === userId);
	}

	static async findByProjectId(projectId: string): Promise<Media[]> {
		const db = loadDb();
		return (db.media || []).filter((m: Media) => m.projectId === projectId);
	}

	static async findById(id: string): Promise<Media | null> {
		const db = loadDb();
		return (db.media || []).find((m: Media) => m.id === id) || null;
	}

	static async delete(id: string): Promise<boolean> {
		const db = loadDb();
		const index = (db.media || []).findIndex((m: Media) => m.id === id);

		if (index === -1) return false;

		db.media.splice(index, 1);
		saveDb(db);
		return true;
	}

	static async getStats(): Promise<{
		total: number;
		totalSize: number;
		byType: { video: number; audio: number; image: number };
	}> {
		const db = loadDb();
		const media: Media[] = db.media || [];

		return {
			total: media.length,
			totalSize: media.reduce((sum, m) => sum + (m.size || 0), 0),
			byType: {
				video: media.filter((m) => m.type === "video").length,
				audio: media.filter((m) => m.type === "audio").length,
				image: media.filter((m) => m.type === "image").length,
			},
		};
	}
}

// Activity Repository
export class ActivityRepository {
	static async create(activityData: {
		userId: string;
		action: string;
		details?: string;
		entityType?: "project" | "media" | "user";
		entityId?: string;
	}): Promise<Activity> {
		const db = loadDb();

		const activity: Activity = {
			id: db.activityIdCounter.toString(),
			userId: activityData.userId,
			action: activityData.action,
			details: activityData.details,
			entityType: activityData.entityType,
			entityId: activityData.entityId,
			createdAt: new Date().toISOString(),
		};

		db.activities.push(activity);
		db.activityIdCounter++;

		// Keep only last 100 activities
		if (db.activities.length > 100) {
			db.activities = db.activities.slice(-100);
		}

		saveDb(db);

		return activity;
	}

	static async findAll(): Promise<Activity[]> {
		const db = loadDb();
		return db.activities || [];
	}

	static async findRecent(limit: number = 10): Promise<Activity[]> {
		const db = loadDb();
		const activities = db.activities || [];
		return activities.slice(-limit).reverse();
	}

	static async findByUserId(
		userId: string,
		limit: number = 10,
	): Promise<Activity[]> {
		const db = loadDb();
		const activities = (db.activities || [])
			.filter((a: Activity) => a.userId === userId)
			.slice(-limit)
			.reverse();
		return activities;
	}

	static async clear(): Promise<void> {
		const db = loadDb();
		db.activities = [];
		saveDb(db);
	}
}
