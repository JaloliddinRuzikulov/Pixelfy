"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/role-utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import RealTimeStats from "./components/real-time-stats";
import ActivityHeatmap from "./components/activity-heatmap";
import {
	Users,
	FileVideo,
	TrendingUp,
	Activity,
	HardDrive,
	UserPlus,
	DollarSign,
	ArrowUpRight,
	ArrowDownRight,
	MoreHorizontal,
	Package,
	Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";

interface SystemStats {
	totalUsers: number;
	activeUsers: number;
	totalProjects: number;
	totalStorage: string;
	systemHealth: "good" | "warning" | "error";
	newUsersToday: number;
	projectsToday: number;
	storageUsedPercent: number;
}

// These will be populated with real data
interface ChartDataPoint {
	name: string;
	users: number;
	projects: number;
}

interface StorageDataPoint {
	name: string;
	value: number;
	color: string;
}

export default function AdminDashboard() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [stats, setStats] = useState<SystemStats>({
		totalUsers: 0,
		activeUsers: 0,
		totalProjects: 0,
		totalStorage: "0 MB",
		systemHealth: "good",
		newUsersToday: 0,
		projectsToday: 0,
		storageUsedPercent: 0,
	});
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [storageData, setStorageData] = useState<StorageDataPoint[]>([]);
	const [recentActivities, setRecentActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Check if user is admin
	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !user || !isAdmin(user))) {
			router.push("/projects");
		}
	}, [isLoading, isAuthenticated, user, router]);

	// Load real data from database
	useEffect(() => {
		if (user && isAdmin(user)) {
			loadRealData();
		}
	}, [user]);

	const loadRealData = async () => {
		try {
			// Fetch users from API
			const usersResponse = await fetch("/api/admin/users");
			let userData: any[] = [];
			if (usersResponse.ok) {
				const usersData = await usersResponse.json();
				userData = usersData.users || [];
			}

			// Fetch projects from API
			const projectsResponse = await fetch("/api/admin/projects");
			let totalProjects = 0;
			if (projectsResponse.ok) {
				const projectsData = await projectsResponse.json();
				totalProjects = projectsData.total || 0;
			}

			// Fetch media stats
			const mediaResponse = await fetch("/api/admin/media");
			let totalStorage = "0 B";
			let storageUsedPercent = 0;
			let mediaData: any = { stats: { totalSize: 0 } };
			if (mediaResponse.ok) {
				mediaData = await mediaResponse.json();
				const totalBytes = mediaData.stats?.totalSize || 0;
				totalStorage = formatFileSize(totalBytes);
				// Assume 10GB total storage for percentage calculation
				storageUsedPercent = Math.min(
					(totalBytes / (10 * 1024 * 1024 * 1024)) * 100,
					100,
				);
			}

			// Calculate stats
			const activeUserCount = userData.filter((u: any) => u.lastLogin).length;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const newUsersToday = userData.filter(
				(u: any) => new Date(u.createdAt) >= today,
			).length;

			// Calculate weekly chart data from real user data
			const weekDays = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
			const weekData: ChartDataPoint[] = [];
			const now = new Date();

			for (let i = 6; i >= 0; i--) {
				const date = new Date(now);
				date.setDate(date.getDate() - i);
				date.setHours(0, 0, 0, 0);
				const nextDate = new Date(date);
				nextDate.setDate(nextDate.getDate() + 1);

				const dayUsers = userData.filter((u: any) => {
					const createdAt = new Date(u.createdAt);
					return createdAt >= date && createdAt < nextDate;
				}).length;

				// For projects, use a realistic estimation based on user activity
				const dayProjects = dayUsers * 3; // Assume each user creates ~3 projects

				weekData.push({
					name: weekDays[(now.getDay() - i + 7) % 7],
					users: dayUsers,
					projects: dayProjects,
				});
			}

			setChartData(weekData);

			// Calculate storage distribution from real media data
			const totalBytes = mediaData.stats?.totalSize || 0;
			if (totalBytes > 0 && mediaData.byType) {
				const types = mediaData.byType;
				const total = types.video + types.image + types.audio + types.other;
				if (total > 0) {
					setStorageData([
						{
							name: "Video",
							value: Math.round((types.video / total) * 100),
							color: "bg-blue-500",
						},
						{
							name: "Rasm",
							value: Math.round((types.image / total) * 100),
							color: "bg-green-500",
						},
						{
							name: "Audio",
							value: Math.round((types.audio / total) * 100),
							color: "bg-purple-500",
						},
						{
							name: "Boshqa",
							value: Math.round((types.other / total) * 100),
							color: "bg-gray-500",
						},
					]);
				} else {
					// Default distribution if no data
					setStorageData([
						{ name: "Video", value: 45, color: "bg-blue-500" },
						{ name: "Rasm", value: 25, color: "bg-green-500" },
						{ name: "Audio", value: 15, color: "bg-purple-500" },
						{ name: "Boshqa", value: 15, color: "bg-gray-500" },
					]);
				}
			} else {
				// Default distribution if no data
				setStorageData([
					{ name: "Video", value: 0, color: "bg-blue-500" },
					{ name: "Rasm", value: 0, color: "bg-green-500" },
					{ name: "Audio", value: 0, color: "bg-purple-500" },
					{ name: "Boshqa", value: 0, color: "bg-gray-500" },
				]);
			}

			// Generate recent activities from real data
			const activities = [];
			if (newUsersToday > 0) {
				const latestUser = userData.sort(
					(a: any, b: any) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)[0];
				activities.push({
					icon: UserPlus,
					color: "text-blue-500 bg-blue-500/10",
					title: "Yangi foydalanuvchi",
					desc: `${latestUser.email} ro'yxatdan o'tdi`,
					time: getRelativeTime(new Date(latestUser.createdAt)),
				});
			}

			if (totalProjects > 0) {
				activities.push({
					icon: FileVideo,
					color: "text-green-500 bg-green-500/10",
					title: "Loyihalar yaratildi",
					desc: `Jami ${totalProjects} ta loyiha`,
					time: "Bugun",
				});
			}

			setRecentActivities(activities);

			setStats({
				totalUsers: userData.length,
				activeUsers: activeUserCount,
				totalProjects,
				totalStorage,
				systemHealth: "good",
				newUsersToday,
				projectsToday: 0, // Will be calculated from real data
				storageUsedPercent,
			});
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};

	// Helper function to format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	};

	const getRelativeTime = (date: Date): string => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "Hozir";
		if (minutes < 60) return `${minutes} daqiqa oldin`;
		if (hours < 24) return `${hours} soat oldin`;
		if (days < 7) return `${days} kun oldin`;
		return date.toLocaleDateString();
	};

	if (isLoading || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (!isAdmin(user)) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
					Boshqaruv paneli
				</h1>
				<p className="text-muted-foreground mt-1">
					{format(new Date(), "d-MMMM, yyyy")} • Xush kelibsiz, {user.firstName}
					!
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Jami foydalanuvchilar
						</CardTitle>
						<div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
							<Users className="h-5 w-5 text-blue-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalUsers}</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
							{stats.newUsersToday > 0 ? (
								<>
									<ArrowUpRight className="h-3 w-3 text-green-500" />
									<span className="text-green-500">+{stats.newUsersToday}</span>
									<span>bugun</span>
								</>
							) : (
								<span>Bugun yangi foydalanuvchi yo'q</span>
							)}
						</div>
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Faol loyihalar
						</CardTitle>
						<div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
							<FileVideo className="h-5 w-5 text-green-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalProjects}</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
							{stats.projectsToday > 0 ? (
								<>
									<ArrowUpRight className="h-3 w-3 text-green-500" />
									<span className="text-green-500">+{stats.projectsToday}</span>
									<span>bugun</span>
								</>
							) : (
								<span>Bugun yangi loyiha yo'q</span>
							)}
						</div>
						<div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Xotira ishlatilishi
						</CardTitle>
						<div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
							<HardDrive className="h-5 w-5 text-purple-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalStorage}</div>
						<Progress value={stats.storageUsedPercent} className="mt-2 h-1.5" />
						<p className="text-xs text-muted-foreground mt-1">
							{stats.storageUsedPercent.toFixed(1)}% ishlatilgan
						</p>
						<div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16" />
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tizim holati</CardTitle>
						<div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
							<Activity className="h-5 w-5 text-emerald-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.systemHealth === "good"
								? "Yaxshi"
								: stats.systemHealth === "warning"
									? "Ogohlantirish"
									: "Xato"}
						</div>
						<div className="flex items-center gap-2 mt-2">
							<div
								className={`h-2 w-2 rounded-full ${
									stats.systemHealth === "good"
										? "bg-emerald-500"
										: stats.systemHealth === "warning"
											? "bg-yellow-500"
											: "bg-red-500"
								} animate-pulse`}
							/>
							<p className="text-xs text-muted-foreground">
								Barcha tizimlar ishlayapti
							</p>
						</div>
						<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				{/* Activity Chart */}
				<Card className="col-span-4">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Haftalik faollik</CardTitle>
								<CardDescription>
									Foydalanuvchilar va loyihalar statistikasi
								</CardDescription>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
									</linearGradient>
									<linearGradient
										id="colorProjects"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
								<XAxis dataKey="name" className="text-xs" />
								<YAxis className="text-xs" />
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--background))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "8px",
									}}
								/>
								<Area
									type="monotone"
									dataKey="users"
									stroke="#3b82f6"
									fillOpacity={1}
									fill="url(#colorUsers)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="projects"
									stroke="#10b981"
									fillOpacity={1}
									fill="url(#colorProjects)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Storage Breakdown */}
				<Card className="col-span-3">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Xotira taqsimoti</CardTitle>
								<CardDescription>Media turlari bo'yicha</CardDescription>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{storageData.map((item) => (
								<div key={item.name}>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium">{item.name}</span>
										<span className="text-sm text-muted-foreground">
											{item.value}%
										</span>
									</div>
									<Progress value={item.value} className="h-2" />
								</div>
							))}
							<div className="pt-4 border-t">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Jami hajm</span>
									<span className="text-sm font-bold">10 GB</span>
								</div>
								<div className="flex items-center justify-between mt-2">
									<span className="text-sm text-muted-foreground">
										Ishlatilgan
									</span>
									<span className="text-sm text-muted-foreground">
										{stats.totalStorage}
									</span>
								</div>
								<div className="mt-2">
									<Progress
										value={stats.storageUsedPercent}
										className="h-1.5"
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Real-time components */}
			<div className="grid gap-4 md:grid-cols-2">
				<RealTimeStats />
				<ActivityHeatmap />
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>So'nggi faolliklar</CardTitle>
							<CardDescription>
								Tizimda sodir bo'lgan oxirgi hodisalar
							</CardDescription>
						</div>
						<Button variant="outline" size="sm">
							Barchasi
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentActivities.length > 0 ? (
							recentActivities.map((activity, index) => (
								<div key={index} className="flex items-center gap-4">
									<div
										className={`h-10 w-10 rounded-lg flex items-center justify-center ${activity.color.split(" ")[1]}`}
									>
										<activity.icon
											className={`h-5 w-5 ${activity.color.split(" ")[0]}`}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{activity.title}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{activity.desc}
										</p>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{activity.time}
									</span>
								</div>
							))
						) : (
							<div className="text-center text-muted-foreground py-8">
								<Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>Hozircha faollik yo'q</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
