"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Activity,
	Users,
	Zap,
	TrendingUp,
	TrendingDown,
	Minus,
	Clock,
	Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface LiveStat {
	label: string;
	value: number;
	previousValue: number;
	icon: any;
	color: string;
	unit?: string;
}

export default function RealTimeStats() {
	const [stats, setStats] = useState<LiveStat[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Initial load
		fetchLiveStats();

		// Set up polling for real-time updates
		const interval = setInterval(() => {
			fetchLiveStats();
		}, 5000); // Update every 5 seconds

		// Simulate WebSocket connection
		setTimeout(() => setIsConnected(true), 1000);

		return () => {
			clearInterval(interval);
			setIsConnected(false);
		};
	}, []);

	const fetchLiveStats = async () => {
		try {
			// Fetch multiple endpoints in parallel
			const [usersRes, projectsRes, mediaRes] = await Promise.allSettled([
				fetch("/api/admin/users"),
				fetch("/api/admin/projects"),
				fetch("/api/admin/media"),
			]);

			let activeUsers = 0;
			let totalProjects = 0;
			let totalMedia = 0;
			let storageUsed = 0;

			if (usersRes.status === "fulfilled" && usersRes.value.ok) {
				const usersData = await usersRes.value.json();
				const users = usersData.users || [];
				activeUsers = users.filter((u: any) => {
					if (!u.lastLogin) return false;
					const lastLoginDate = new Date(u.lastLogin);
					const daysSinceLogin =
						(Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
					return daysSinceLogin < 7; // Active if logged in within last 7 days
				}).length;
			}

			if (projectsRes.status === "fulfilled" && projectsRes.value.ok) {
				const projectsData = await projectsRes.value.json();
				totalProjects = projectsData.total || 0;
			}

			if (mediaRes.status === "fulfilled" && mediaRes.value.ok) {
				const mediaData = await mediaRes.value.json();
				totalMedia = mediaData.total || 0;
				storageUsed = Math.round(
					(mediaData.stats?.totalSize || 0) / (1024 * 1024),
				); // Convert to MB
			}

			// Calculate live stats with previous values for comparison
			const newStats: LiveStat[] = [
				{
					label: "Faol foydalanuvchilar",
					value: activeUsers,
					previousValue: stats[0]?.value || activeUsers,
					icon: Users,
					color: "text-blue-500",
					unit: "ta",
				},
				{
					label: "Jami loyihalar",
					value: totalProjects,
					previousValue: stats[1]?.value || totalProjects,
					icon: Activity,
					color: "text-green-500",
					unit: "ta",
				},
				{
					label: "Media fayllar",
					value: totalMedia,
					previousValue: stats[2]?.value || totalMedia,
					icon: Zap,
					color: "text-purple-500",
					unit: "ta",
				},
				{
					label: "Xotira ishlatilishi",
					value: storageUsed,
					previousValue: stats[3]?.value || storageUsed,
					icon: Database,
					color: "text-orange-500",
					unit: "MB",
				},
			];

			setStats(newStats);
			setLastUpdate(new Date());
			setLoading(false);
		} catch (error) {
			console.error("Error fetching live stats:", error);
			setLoading(false);
		}
	};

	const getTrend = (current: number, previous: number) => {
		if (current > previous)
			return {
				icon: TrendingUp,
				color: "text-green-500",
				text: "+" + (current - previous),
			};
		if (current < previous)
			return {
				icon: TrendingDown,
				color: "text-red-500",
				text: "-" + (previous - current),
			};
		return { icon: Minus, color: "text-gray-500", text: "0" };
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("uz-UZ", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Jonli statistika</CardTitle>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<Clock className="h-3 w-3 text-muted-foreground" />
							<span className="text-xs text-muted-foreground">
								{formatTime(lastUpdate)}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div
								className={`h-2 w-2 rounded-full transition-colors ${
									isConnected
										? "bg-green-500 animate-pulse shadow-sm shadow-green-500/50"
										: "bg-red-500"
								}`}
							/>
							<span className="text-xs text-muted-foreground">
								{isConnected ? "Ulangan" : "Ulanmagan"}
							</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{loading ? (
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="space-y-2">
									<div className="h-4 bg-muted rounded animate-pulse" />
									<div className="h-8 bg-muted rounded animate-pulse" />
								</div>
							))}
						</div>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
							<AnimatePresence mode="wait">
								{stats.map((stat, index) => {
									const Icon = stat.icon;
									const trend = getTrend(stat.value, stat.previousValue);
									const TrendIcon = trend.icon;

									return (
										<motion.div
											key={stat.label}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ delay: index * 0.05 }}
											className="p-6 hover:bg-muted/50 transition-colors"
										>
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
														{stat.label}
													</span>
													<div
														className={`p-1.5 rounded-lg bg-background ${stat.color}`}
													>
														<Icon className="h-3.5 w-3.5" />
													</div>
												</div>

												<div className="flex items-end justify-between">
													<div className="flex items-baseline gap-2">
														<motion.span
															key={stat.value}
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															className="text-2xl font-bold"
														>
															{stat.value.toLocaleString()}
														</motion.span>
														{stat.unit && (
															<span className="text-sm text-muted-foreground">
																{stat.unit}
															</span>
														)}
													</div>

													{stat.value !== stat.previousValue && (
														<motion.div
															initial={{ opacity: 0, x: -10 }}
															animate={{ opacity: 1, x: 0 }}
															className={`flex items-center gap-1 ${trend.color}`}
														>
															<TrendIcon className="h-3 w-3" />
															<span className="text-xs font-medium">
																{trend.text}
															</span>
														</motion.div>
													)}
												</div>

												{/* Mini progress bar */}
												<div className="h-1 bg-muted rounded-full overflow-hidden">
													<motion.div
														className={`h-full rounded-full ${
															stat.color === "text-blue-500"
																? "bg-blue-500"
																: stat.color === "text-green-500"
																	? "bg-green-500"
																	: stat.color === "text-purple-500"
																		? "bg-purple-500"
																		: "bg-orange-500"
														}`}
														initial={{ width: 0 }}
														animate={{
															width: `${Math.min((stat.value / (stat.value + 50)) * 100, 100)}%`,
														}}
														transition={{ duration: 0.5, ease: "easeOut" }}
													/>
												</div>
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>

						{/* Activity Pulse Animation */}
						<div className="px-6 pb-4">
							<div className="flex items-center justify-center gap-1">
								{[...Array(20)].map((_, i) => (
									<motion.div
										key={i}
										className="w-0.5 bg-primary/30 rounded-full"
										animate={{
											height: [2, 12, 2],
											opacity: [0.3, 1, 0.3],
										}}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											delay: i * 0.05,
										}}
									/>
								))}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
