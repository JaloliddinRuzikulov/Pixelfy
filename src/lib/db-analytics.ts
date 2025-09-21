import { Kysely, sql } from "kysely";

export interface AnalyticsDatabase {
	sessions: {
		id: string;
		userId: string;
		duration: number | null;
		createdAt: Date;
		endedAt: Date | null;
	};
	exports: {
		id: string;
		userId: string;
		projectId: string;
		format: string;
		createdAt: Date;
	};
	activity_logs: {
		id: string;
		userId: string;
		action: string;
		details: any;
		createdAt: Date;
	};
	api_logs: {
		id: string;
		endpoint: string;
		method: string;
		responseTime: number;
		statusCode: number;
		createdAt: Date;
	};
	project_effects: {
		id: string;
		projectId: string;
		effectType: string;
		createdAt: Date;
	};
}

export async function createAnalyticsTables(db: Kysely<any>) {
	// Create sessions table if not exists
	await db.schema
		.createTable("sessions")
		.ifNotExists()
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("userId", "uuid", (col) =>
			col.references("users.id").onDelete("cascade"),
		)
		.addColumn("duration", "integer")
		.addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`))
		.addColumn("endedAt", "timestamp")
		.execute()
		.catch(() => {}); // Ignore if exists

	// Create exports table if not exists
	await db.schema
		.createTable("exports")
		.ifNotExists()
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("userId", "uuid", (col) =>
			col.references("users.id").onDelete("cascade"),
		)
		.addColumn("projectId", "uuid", (col) =>
			col.references("projects.id").onDelete("cascade"),
		)
		.addColumn("format", "varchar", (col) => col.notNull())
		.addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`))
		.execute()
		.catch(() => {}); // Ignore if exists

	// Create activity_logs table if not exists
	await db.schema
		.createTable("activity_logs")
		.ifNotExists()
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("userId", "uuid", (col) =>
			col.references("users.id").onDelete("cascade"),
		)
		.addColumn("action", "varchar", (col) => col.notNull())
		.addColumn("details", "jsonb")
		.addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`))
		.execute()
		.catch(() => {}); // Ignore if exists

	// Create api_logs table if not exists
	await db.schema
		.createTable("api_logs")
		.ifNotExists()
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("endpoint", "varchar", (col) => col.notNull())
		.addColumn("method", "varchar", (col) => col.notNull())
		.addColumn("responseTime", "integer", (col) => col.notNull())
		.addColumn("statusCode", "integer", (col) => col.notNull())
		.addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`))
		.execute()
		.catch(() => {}); // Ignore if exists

	// Create project_effects table if not exists
	await db.schema
		.createTable("project_effects")
		.ifNotExists()
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("projectId", "uuid", (col) =>
			col.references("projects.id").onDelete("cascade"),
		)
		.addColumn("effectType", "varchar", (col) => col.notNull())
		.addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`))
		.execute()
		.catch(() => {}); // Ignore if exists
}

// Helper function to log activity
export async function logActivity(
	db: Kysely<any>,
	userId: string,
	action: string,
	details?: any,
) {
	try {
		await db
			.insertInto("activity_logs")
			.values({
				userId,
				action,
				details: JSON.stringify(details || {}),
			})
			.execute();
	} catch (error) {
		console.error("Failed to log activity:", error);
	}
}

// Helper function to log API call
export async function logApiCall(
	db: Kysely<any>,
	endpoint: string,
	method: string,
	responseTime: number,
	statusCode: number,
) {
	try {
		await db
			.insertInto("api_logs")
			.values({
				endpoint,
				method,
				responseTime,
				statusCode,
			})
			.execute();
	} catch (error) {
		console.error("Failed to log API call:", error);
	}
}

// Helper function to track export
export async function trackExport(
	db: Kysely<any>,
	userId: string,
	projectId: string,
	format: string,
) {
	try {
		await db
			.insertInto("exports")
			.values({
				userId,
				projectId,
				format,
			})
			.execute();
	} catch (error) {
		console.error("Failed to track export:", error);
	}
}

// Helper function to track session
export async function startSession(
	db: Kysely<any>,
	userId: string,
): Promise<string | null> {
	try {
		const result = await db
			.insertInto("sessions")
			.values({ userId })
			.returning("id")
			.executeTakeFirst();

		return result?.id || null;
	} catch (error) {
		console.error("Failed to start session:", error);
		return null;
	}
}

export async function endSession(db: Kysely<any>, sessionId: string) {
	try {
		await db
			.updateTable("sessions")
			.set({
				endedAt: new Date(),
				duration: sql`EXTRACT(EPOCH FROM (NOW() - "createdAt")) * 1000`,
			})
			.where("id", "=", sessionId)
			.execute();
	} catch (error) {
		console.error("Failed to end session:", error);
	}
}
