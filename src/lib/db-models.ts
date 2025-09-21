import { UserRole } from "./auth";

// Project model
export interface Project {
	id: string;
	userId: string;
	title: string;
	description?: string;
	thumbnailUrl?: string;
	duration: number; // in seconds
	status: "draft" | "published" | "archived";
	exportCount: number;
	createdAt: string;
	updatedAt: string;
}

// Media model
export interface Media {
	id: string;
	userId: string;
	projectId?: string;
	filename: string;
	url: string;
	type: "video" | "audio" | "image";
	size: number; // in bytes
	duration?: number; // for video/audio in seconds
	width?: number; // for video/image
	height?: number; // for video/image
	createdAt: string;
	updatedAt: string;
}

// Activity model for tracking user actions
export interface Activity {
	id: string;
	userId: string;
	action: string;
	details?: string;
	entityType?: "project" | "media" | "user";
	entityId?: string;
	createdAt: string;
}

// Extended database interface
export interface ExtendedDatabase {
	projects: Project[];
	media: Media[];
	activities: Activity[];
	projectIdCounter: number;
	mediaIdCounter: number;
	activityIdCounter: number;
}
