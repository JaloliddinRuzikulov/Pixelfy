"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import {
	User,
	Video,
	Upload,
	Settings,
	AlertCircle,
	LogIn,
	LogOut,
	Edit,
} from "lucide-react";

interface ActivityItem {
	id: string;
	type: "user" | "project" | "upload" | "settings" | "system" | "auth";
	message: string;
	timestamp: Date;
	user?: string;
	icon: any;
	color: string;
}

async function fetchRecentActivities(): Promise<ActivityItem[]> {
	try {
		const response = await fetch("/api/admin/activities");
		if (!response.ok) {
			throw new Error("Failed to fetch activities");
		}

		const data = await response.json();
		return data.activities.map((activity: any) => {
			// Map activity types to icons and colors
			let icon = AlertCircle;
			let color = "text-gray-500";
			let type: ActivityItem["type"] = "system";

			if (
				activity.action.includes("login") ||
				activity.action.includes("kirish")
			) {
				icon = LogIn;
				color = "text-green-500";
				type = "auth";
			} else if (
				activity.action.includes("logout") ||
				activity.action.includes("chiqish")
			) {
				icon = LogOut;
				color = "text-red-500";
				type = "auth";
			} else if (
				activity.action.includes("user") ||
				activity.action.includes("foydalanuvchi")
			) {
				icon = User;
				color = "text-blue-500";
				type = "user";
			} else if (
				activity.action.includes("project") ||
				activity.action.includes("loyiha")
			) {
				icon = Video;
				color = "text-green-500";
				type = "project";
			} else if (
				activity.action.includes("upload") ||
				activity.action.includes("yukla")
			) {
				icon = Upload;
				color = "text-purple-500";
				type = "upload";
			} else if (
				activity.action.includes("settings") ||
				activity.action.includes("sozlama")
			) {
				icon = Settings;
				color = "text-yellow-500";
				type = "settings";
			} else if (
				activity.action.includes("edit") ||
				activity.action.includes("tahrir")
			) {
				icon = Edit;
				color = "text-orange-500";
				type = "settings";
			}

			return {
				id: activity.id,
				type,
				message: activity.action,
				timestamp: new Date(activity.createdAt),
				user: activity.details,
				icon,
				color,
			};
		});
	} catch (error) {
		console.error("Error fetching activities:", error);
		return [];
	}
}

export default function RecentActivity() {
	const [activities, setActivities] = useState<ActivityItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadActivities() {
			setLoading(true);
			const data = await fetchRecentActivities();

			// If no activities exist, create some initial ones
			if (data.length === 0) {
				// Create sample activities through API
				await fetch("/api/admin/activities", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "Admin panel ochildi",
						details: "Administrator",
					}),
				});

				// Reload activities
				const newData = await fetchRecentActivities();
				setActivities(newData);
			} else {
				setActivities(data);
			}

			setLoading(false);
		}

		loadActivities();

		// Refresh every 30 seconds
		const interval = setInterval(loadActivities, 30000);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="flex items-start space-x-3 animate-pulse">
						<div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
							<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				<AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p className="text-sm">Hozircha faollik yo'q</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{activities.map((activity) => {
				const Icon = activity.icon;
				return (
					<div key={activity.id} className="flex items-start space-x-3">
						<div className={`mt-1 ${activity.color}`}>
							<Icon className="h-5 w-5" />
						</div>
						<div className="flex-1">
							<p className="text-sm text-gray-900 dark:text-white">
								{activity.message}
							</p>
							{activity.user && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{activity.user}
								</p>
							)}
							<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
								{formatDistanceToNow(activity.timestamp, {
									addSuffix: true,
									locale: uz,
								})}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
