import { NextRequest, NextResponse } from "next/server";
import { kyselyDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-server";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const db = kyselyDb;
		if (!db) {
			// Fallback when database is not available
			return NextResponse.json(getDefaultAnalytics());
		}
		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get("type");

		switch (type) {
			case "overview":
				return await getOverviewStats(db);
			case "users":
				return await getUserStats(db);
			case "projects":
				return await getProjectStats(db);
			case "storage":
				return await getStorageStats(db);
			case "features":
				return await getFeatureUsage(db);
			case "performance":
				return await getPerformanceMetrics(db);
			case "activity":
				return await getActivityData(db, searchParams);
			default:
				return NextResponse.json({ error: "Invalid type" }, { status: 400 });
		}
	} catch (error) {
		console.error("Analytics API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

async function getOverviewStats(db: any) {
	try {
		// Get total users
		const totalUsers = await db
			.selectFrom("users")
			.select(db.fn.count("id").as("count"))
			.executeTakeFirst();

		// Get active users (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const activeUsers = await db
			.selectFrom("users")
			.select(db.fn.count("id").as("count"))
			.where("updatedAt", ">=", sevenDaysAgo)
			.executeTakeFirst();

		// Get total projects
		const totalProjects = await db
			.selectFrom("projects")
			.select(db.fn.count("id").as("count"))
			.executeTakeFirst();

		// Get total exports
		const totalExports = await db
			.selectFrom("exports")
			.select(db.fn.count("id").as("count"))
			.executeTakeFirst();

		// Get storage usage
		const storageData = await calculateStorageUsage();

		// Get average session duration from sessions table
		const avgSessionResult = await db
			.selectFrom("sessions")
			.select(db.fn.avg("duration").as("avgDuration"))
			.where("duration", "is not", null)
			.executeTakeFirst();

		// Get user growth (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const newUsers = await db
			.selectFrom("users")
			.select(db.fn.count("id").as("count"))
			.where("createdAt", ">=", thirtyDaysAgo)
			.executeTakeFirst();

		const previousMonthStart = new Date();
		previousMonthStart.setDate(previousMonthStart.getDate() - 60);

		const previousMonthUsers = await db
			.selectFrom("users")
			.select(db.fn.count("id").as("count"))
			.where("createdAt", ">=", previousMonthStart)
			.where("createdAt", "<", thirtyDaysAgo)
			.executeTakeFirst();

		const growthRate =
			previousMonthUsers?.count > 0
				? ((newUsers?.count - previousMonthUsers?.count) /
						previousMonthUsers?.count) *
					100
				: 100;

		return NextResponse.json({
			totalUsers: totalUsers?.count || 0,
			activeUsers: activeUsers?.count || 0,
			totalProjects: totalProjects?.count || 0,
			totalExports: totalExports?.count || 0,
			storageUsedGB: storageData.usedGB,
			storageTotalGB: storageData.totalGB,
			avgSessionMinutes: Math.round(
				(avgSessionResult?.avgDuration || 0) / 60000,
			), // Convert ms to minutes
			userGrowthPercent: Math.round(growthRate),
			newUsersLast30Days: newUsers?.count || 0,
		});
	} catch (error) {
		console.error("Overview stats error:", error);
		return NextResponse.json({
			totalUsers: 0,
			activeUsers: 0,
			totalProjects: 0,
			totalExports: 0,
			storageUsedGB: 0,
			storageTotalGB: 10,
			avgSessionMinutes: 0,
			userGrowthPercent: 0,
			newUsersLast30Days: 0,
		});
	}
}

async function getUserStats(db: any) {
	try {
		// Get daily new users for the last 7 days
		const dailyStats = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);

			const nextDate = new Date(date);
			nextDate.setDate(nextDate.getDate() + 1);

			const result = await db
				.selectFrom("users")
				.select(db.fn.count("id").as("count"))
				.where("createdAt", ">=", date)
				.where("createdAt", "<", nextDate)
				.executeTakeFirst();

			dailyStats.push({
				date: date.toISOString().split("T")[0],
				users: result?.count || 0,
			});
		}

		// Get user distribution by role
		const roleDistribution = await db
			.selectFrom("users")
			.select("role")
			.select(db.fn.count("id").as("count"))
			.groupBy("role")
			.execute();

		return NextResponse.json({
			dailyNewUsers: dailyStats,
			roleDistribution: roleDistribution || [],
		});
	} catch (error) {
		console.error("User stats error:", error);
		return NextResponse.json({
			dailyNewUsers: [],
			roleDistribution: [],
		});
	}
}

async function getProjectStats(db: any) {
	try {
		// Get projects by status
		const statusCounts = await db
			.selectFrom("projects")
			.select("status")
			.select(db.fn.count("id").as("count"))
			.groupBy("status")
			.execute();

		// Get projects created per day (last 7 days)
		const dailyProjects = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);

			const nextDate = new Date(date);
			nextDate.setDate(nextDate.getDate() + 1);

			const result = await db
				.selectFrom("projects")
				.select(db.fn.count("id").as("count"))
				.where("createdAt", ">=", date)
				.where("createdAt", "<", nextDate)
				.executeTakeFirst();

			dailyProjects.push({
				date: date.toISOString().split("T")[0],
				projects: result?.count || 0,
			});
		}

		// Get average project duration
		const avgDuration = await db
			.selectFrom("projects")
			.select(db.fn.avg("duration").as("avgDuration"))
			.where("duration", "is not", null)
			.executeTakeFirst();

		return NextResponse.json({
			byStatus: statusCounts || [],
			dailyCreated: dailyProjects,
			avgDurationSeconds: Math.round(avgDuration?.avgDuration || 0),
		});
	} catch (error) {
		console.error("Project stats error:", error);
		return NextResponse.json({
			byStatus: [],
			dailyCreated: [],
			avgDurationSeconds: 0,
		});
	}
}

async function getStorageStats(db: any) {
	try {
		const uploadDir = path.join(process.cwd(), "public", "uploads");
		const stats = await getDirectorySize(uploadDir);

		// Get storage by file type
		const fileTypes = await analyzeFileTypes(uploadDir);

		// Get top users by storage
		const userStorage = await db
			.selectFrom("users")
			.leftJoin("projects", "users.id", "projects.userId")
			.select("users.email")
			.select(db.fn.sum("projects.fileSize").as("totalSize"))
			.groupBy("users.id")
			.orderBy("totalSize", "desc")
			.limit(10)
			.execute();

		return NextResponse.json({
			totalSizeBytes: stats.totalSize,
			fileCount: stats.fileCount,
			byFileType: fileTypes,
			topUsersByStorage: userStorage || [],
		});
	} catch (error) {
		console.error("Storage stats error:", error);
		return NextResponse.json({
			totalSizeBytes: 0,
			fileCount: 0,
			byFileType: [],
			topUsersByStorage: [],
		});
	}
}

async function getFeatureUsage(db: any) {
	try {
		// Track feature usage from exports table
		const featureUsage = await db
			.selectFrom("exports")
			.select("format")
			.select(db.fn.count("id").as("count"))
			.groupBy("format")
			.execute();

		// Get template usage
		const templateUsage = await db
			.selectFrom("projects")
			.select("templateId")
			.select(db.fn.count("id").as("count"))
			.where("templateId", "is not", null)
			.groupBy("templateId")
			.limit(10)
			.execute();

		// Get effects usage (if tracked)
		const effectsUsage = await db
			.selectFrom("project_effects")
			.select("effectType")
			.select(db.fn.count("id").as("count"))
			.groupBy("effectType")
			.execute();

		return NextResponse.json({
			exportFormats: featureUsage || [],
			topTemplates: templateUsage || [],
			effectsUsage: effectsUsage || [],
		});
	} catch (error) {
		console.error("Feature usage error:", error);
		return NextResponse.json({
			exportFormats: [],
			topTemplates: [],
			effectsUsage: [],
		});
	}
}

async function getPerformanceMetrics(db: any) {
	try {
		// Get API response times from logs
		const apiMetrics = await db
			.selectFrom("api_logs")
			.select(db.fn.avg("responseTime").as("avgTime"))
			.select(db.fn.max("responseTime").as("maxTime"))
			.select(db.fn.min("responseTime").as("minTime"))
			.where("createdAt", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000))
			.executeTakeFirst();

		// Get system metrics
		const systemMetrics = {
			cpuUsage: process.cpuUsage(),
			memoryUsage: process.memoryUsage(),
			uptime: process.uptime(),
			platform: process.platform,
			nodeVersion: process.version,
		};

		// Get database metrics
		const dbSize = await db
			.selectFrom("pg_database_size")
			.select(db.raw("pg_database_size(current_database()) as size"))
			.executeTakeFirst()
			.catch(() => ({ size: 0 }));

		return NextResponse.json({
			api: {
				avgResponseTime: apiMetrics?.avgTime || 0,
				maxResponseTime: apiMetrics?.maxTime || 0,
				minResponseTime: apiMetrics?.minTime || 0,
			},
			system: {
				cpuPercent:
					Math.round((systemMetrics.cpuUsage.user / 1000000) * 100) / 100,
				memoryMB: Math.round(systemMetrics.memoryUsage.rss / 1024 / 1024),
				uptimeHours: Math.round(systemMetrics.uptime / 3600),
				platform: systemMetrics.platform,
				nodeVersion: systemMetrics.nodeVersion,
			},
			database: {
				sizeBytes: dbSize?.size || 0,
			},
		});
	} catch (error) {
		console.error("Performance metrics error:", error);

		// Return system metrics even if DB fails
		const memUsage = process.memoryUsage();
		const cpuUsage = process.cpuUsage();

		return NextResponse.json({
			api: {
				avgResponseTime: 0,
				maxResponseTime: 0,
				minResponseTime: 0,
			},
			system: {
				cpuPercent: Math.round((cpuUsage.user / 1000000) * 100) / 100,
				memoryMB: Math.round(memUsage.rss / 1024 / 1024),
				uptimeHours: Math.round(process.uptime() / 3600),
				platform: process.platform,
				nodeVersion: process.version,
			},
			database: {
				sizeBytes: 0,
			},
		});
	}
}

async function getActivityData(db: any, searchParams: URLSearchParams) {
	try {
		const period = searchParams.get("period") || "7d";
		const days = period === "30d" ? 30 : 7;

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		startDate.setHours(0, 0, 0, 0);

		// Get activity logs
		const activities = await db
			.selectFrom("activity_logs")
			.select(["id", "userId", "action", "details", "createdAt"])
			.where("createdAt", ">=", startDate)
			.orderBy("createdAt", "desc")
			.limit(100)
			.execute();

		// Get hourly activity distribution
		const hourlyActivity = await db
			.selectFrom("activity_logs")
			.select(db.raw("EXTRACT(HOUR FROM createdAt) as hour"))
			.select(db.fn.count("id").as("count"))
			.where("createdAt", ">=", startDate)
			.groupBy(db.raw("EXTRACT(HOUR FROM createdAt)"))
			.execute();

		return NextResponse.json({
			recentActivities: activities || [],
			hourlyDistribution: hourlyActivity || [],
		});
	} catch (error) {
		console.error("Activity data error:", error);
		return NextResponse.json({
			recentActivities: [],
			hourlyDistribution: [],
		});
	}
}

// Helper functions
async function calculateStorageUsage() {
	try {
		const uploadDir = path.join(process.cwd(), "public", "uploads");
		const stats = await getDirectorySize(uploadDir);
		const totalGB = 10; // Default allocation
		const usedGB = stats.totalSize / (1024 * 1024 * 1024);

		return {
			usedGB: Math.round(usedGB * 100) / 100,
			totalGB,
		};
	} catch (error) {
		return { usedGB: 0, totalGB: 10 };
	}
}

async function getDirectorySize(
	dirPath: string,
): Promise<{ totalSize: number; fileCount: number }> {
	let totalSize = 0;
	let fileCount = 0;

	try {
		const files = await fs.readdir(dirPath);

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stats = await fs.stat(filePath);

			if (stats.isDirectory()) {
				const subDirStats = await getDirectorySize(filePath);
				totalSize += subDirStats.totalSize;
				fileCount += subDirStats.fileCount;
			} else {
				totalSize += stats.size;
				fileCount++;
			}
		}
	} catch (error) {
		console.error("Error calculating directory size:", error);
	}

	return { totalSize, fileCount };
}

async function analyzeFileTypes(dirPath: string) {
	const fileTypes: Record<string, { count: number; size: number }> = {};

	try {
		const files = await fs.readdir(dirPath);

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stats = await fs.stat(filePath);

			if (stats.isFile()) {
				const ext = path.extname(file).toLowerCase() || "no-ext";
				if (!fileTypes[ext]) {
					fileTypes[ext] = { count: 0, size: 0 };
				}
				fileTypes[ext].count++;
				fileTypes[ext].size += stats.size;
			}
		}
	} catch (error) {
		console.error("Error analyzing file types:", error);
	}

	return Object.entries(fileTypes).map(([type, data]) => ({
		type,
		count: data.count,
		sizeBytes: data.size,
	}));
}

function getDefaultAnalytics() {
	// Return default analytics when database is not available
	const memUsage = process.memoryUsage();
	const cpuUsage = process.cpuUsage();

	return {
		overview: {
			totalUsers: 0,
			activeUsers: 0,
			totalProjects: 0,
			totalExports: 0,
			storageUsedGB: 0,
			storageTotalGB: 10,
			avgSessionMinutes: 0,
			userGrowthPercent: 0,
			newUsersLast30Days: 0,
		},
		users: {
			dailyNewUsers: [],
			roleDistribution: [],
		},
		projects: {
			byStatus: [],
			dailyCreated: [],
			avgDurationSeconds: 0,
		},
		storage: {
			totalSizeBytes: 0,
			fileCount: 0,
			byFileType: [],
			topUsersByStorage: [],
		},
		features: {
			exportFormats: [],
			topTemplates: [],
			effectsUsage: [],
		},
		performance: {
			api: {
				avgResponseTime: 0,
				maxResponseTime: 0,
				minResponseTime: 0,
			},
			system: {
				cpuPercent: Math.round((cpuUsage.user / 1000000) * 100) / 100,
				memoryMB: Math.round(memUsage.rss / 1024 / 1024),
				uptimeHours: Math.round(process.uptime() / 3600),
				platform: process.platform,
				nodeVersion: process.version,
			},
			database: {
				sizeBytes: 0,
			},
		},
		activity: {
			recentActivities: [],
			hourlyDistribution: [],
		},
	};
}
