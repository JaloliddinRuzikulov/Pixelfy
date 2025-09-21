"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	TrendingUp,
	Users,
	Video,
	Clock,
	Download,
	HardDrive,
	ArrowLeft,
	Activity,
	Cpu,
	Database,
	BarChart3,
	PieChart,
	LineChart,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
	overview: {
		totalUsers: number;
		activeUsers: number;
		totalProjects: number;
		totalExports: number;
		storageUsedGB: number;
		storageTotalGB: number;
		avgSessionMinutes: number;
		userGrowthPercent: number;
		newUsersLast30Days: number;
	};
	users: {
		dailyNewUsers: Array<{ date: string; users: number }>;
		roleDistribution: Array<{ role: string; count: number }>;
	};
	projects: {
		byStatus: Array<{ status: string; count: number }>;
		dailyCreated: Array<{ date: string; projects: number }>;
		avgDurationSeconds: number;
	};
	storage: {
		totalSizeBytes: number;
		fileCount: number;
		byFileType: Array<{ type: string; count: number; sizeBytes: number }>;
		topUsersByStorage: Array<{ email: string; totalSize: number }>;
	};
	features: {
		exportFormats: Array<{ format: string; count: number }>;
		topTemplates: Array<{ templateId: string; count: number }>;
		effectsUsage: Array<{ effectType: string; count: number }>;
	};
	performance: {
		api: {
			avgResponseTime: number;
			maxResponseTime: number;
			minResponseTime: number;
		};
		system: {
			cpuPercent: number;
			memoryMB: number;
			uptimeHours: number;
			platform: string;
			nodeVersion: string;
		};
		database: { sizeBytes: number };
	};
	activity: {
		recentActivities: Array<{
			id: string;
			userId: string;
			action: string;
			details: any;
			createdAt: string;
		}>;
		hourlyDistribution: Array<{ hour: number; count: number }>;
	};
}

export default function AnalyticsPage() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState("7d");
	const [refreshing, setRefreshing] = useState(false);

	const fetchAnalytics = async () => {
		try {
			setRefreshing(true);
			const responses = await Promise.all([
				fetch("/api/admin/analytics?type=overview"),
				fetch("/api/admin/analytics?type=users"),
				fetch("/api/admin/analytics?type=projects"),
				fetch("/api/admin/analytics?type=storage"),
				fetch("/api/admin/analytics?type=features"),
				fetch("/api/admin/analytics?type=performance"),
				fetch(`/api/admin/analytics?type=activity&period=${selectedPeriod}`),
			]);

			const results = await Promise.all(responses.map((r) => r.json()));

			setData({
				overview: results[0],
				users: results[1],
				projects: results[2],
				storage: results[3],
				features: results[4],
				performance: results[5],
				activity: results[6],
			});
			setError(null);
		} catch (err) {
			console.error("Failed to fetch analytics:", err);
			setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchAnalytics();
	}, [selectedPeriod]);

	// Auto-refresh every 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			fetchAnalytics();
		}, 30000);

		return () => clearInterval(interval);
	}, [selectedPeriod]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">
						Analitika yuklanmoqda...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={fetchAnalytics}>Qayta urinish</Button>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const storagePercentage = Math.round(
		(data.overview.storageUsedGB / data.overview.storageTotalGB) * 100,
	);

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Analitika va hisobotlar
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Tizim faoliyati va foydalanish statistikasi
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={fetchAnalytics}
						disabled={refreshing}
						className="gap-2"
					>
						<Activity
							className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						{refreshing ? "Yangilanmoqda..." : "Yangilash"}
					</Button>
					<Link href="/admin">
						<Button variant="outline" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Orqaga
						</Button>
					</Link>
				</div>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Faol foydalanuvchilar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.activeUsers.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							Jami: {data.overview.totalUsers.toLocaleString()}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Yangi loyihalar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.totalProjects.toLocaleString()}
						</div>
						<p className="text-xs text-green-600">
							+{data.overview.userGrowthPercent}% o'sish
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Eksportlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.totalExports.toLocaleString()}
						</div>
						<p className="text-xs text-blue-600">Jami eksportlar</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							O'rtacha sessiya
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.avgSessionMinutes} min
						</div>
						<p className="text-xs text-muted-foreground">Davomiylik</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Xotira ishlatilishi
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.storageUsedGB.toFixed(1)} GB
						</div>
						<p className="text-xs text-muted-foreground">
							{storagePercentage}% band
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Yangi foydalanuvchilar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.overview.newUsersLast30Days.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">30 kunlik</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Analytics Tabs */}
			<Tabs defaultValue="users" className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
					<TabsTrigger value="projects">Loyihalar</TabsTrigger>
					<TabsTrigger value="performance">Ishlash</TabsTrigger>
					<TabsTrigger value="storage">Xotira</TabsTrigger>
					<TabsTrigger value="features">Funksiyalar</TabsTrigger>
				</TabsList>

				{/* Users Tab */}
				<TabsContent value="users" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Kunlik yangi foydalanuvchilar</CardTitle>
								<CardDescription>So'nggi 7 kun</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.users.dailyNewUsers.map((day) => (
										<div
											key={day.date}
											className="flex items-center justify-between"
										>
											<span className="text-sm text-muted-foreground">
												{day.date}
											</span>
											<div className="flex items-center gap-2">
												<div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
													<div
														className="bg-blue-500 h-2 rounded-full"
														style={{
															width: `${(day.users / Math.max(...data.users.dailyNewUsers.map((d) => d.users))) * 100}%`,
														}}
													/>
												</div>
												<span className="text-sm font-medium w-12 text-right">
													{day.users}
												</span>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Foydalanuvchi rollari</CardTitle>
								<CardDescription>Taqsimot</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.users.roleDistribution.map((role) => (
										<div
											key={role.role}
											className="flex items-center justify-between"
										>
											<span className="text-sm capitalize">{role.role}</span>
											<div className="flex items-center gap-2">
												<div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
													<div
														className="bg-green-500 h-2 rounded-full"
														style={{
															width: `${(role.count / data.overview.totalUsers) * 100}%`,
														}}
													/>
												</div>
												<span className="text-sm font-medium w-12 text-right">
													{role.count}
												</span>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Projects Tab */}
				<TabsContent value="projects" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Loyiha holatlari</CardTitle>
								<CardDescription>Joriy taqsimot</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.projects.byStatus.map((status) => (
										<div
											key={status.status}
											className="flex items-center justify-between"
										>
											<span className="text-sm capitalize">
												{status.status}
											</span>
											<span className="text-sm font-medium">
												{status.count}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Kunlik loyihalar</CardTitle>
								<CardDescription>So'nggi 7 kun</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{data.projects.dailyCreated.map((day) => (
										<div
											key={day.date}
											className="flex items-center justify-between"
										>
											<span className="text-xs text-muted-foreground">
												{day.date}
											</span>
											<span className="text-sm font-medium">
												{day.projects}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>O'rtacha davomiylik</CardTitle>
								<CardDescription>Loyiha vaqti</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{Math.floor(data.projects.avgDurationSeconds / 60)}:
									{(data.projects.avgDurationSeconds % 60)
										.toString()
										.padStart(2, "0")}
								</div>
								<p className="text-sm text-muted-foreground mt-2">
									daqiqa:soniya
								</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Performance Tab */}
				<TabsContent value="performance" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>API javob vaqti</CardTitle>
								<CardDescription>Millisekundlarda</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										O'rtacha
									</span>
									<span className="text-sm font-medium">
										{data.performance.api.avgResponseTime.toFixed(2)} ms
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Maksimal
									</span>
									<span className="text-sm font-medium">
										{data.performance.api.maxResponseTime.toFixed(2)} ms
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Minimal</span>
									<span className="text-sm font-medium">
										{data.performance.api.minResponseTime.toFixed(2)} ms
									</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tizim resurslari</CardTitle>
								<CardDescription>
									{data.performance.system.platform} - Node{" "}
									{data.performance.system.nodeVersion}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm text-muted-foreground">CPU</span>
										<span className="text-sm font-medium">
											{data.performance.system.cpuPercent}%
										</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full"
											style={{
												width: `${Math.min(data.performance.system.cpuPercent, 100)}%`,
											}}
										/>
									</div>
								</div>
								<div>
									<div className="flex justify-between mb-1">
										<span className="text-sm text-muted-foreground">RAM</span>
										<span className="text-sm font-medium">
											{data.performance.system.memoryMB} MB
										</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className="bg-green-500 h-2 rounded-full"
											style={{
												width: `${Math.min((data.performance.system.memoryMB / 4096) * 100, 100)}%`,
											}}
										/>
									</div>
								</div>
								<div className="flex justify-between pt-2 border-t">
									<span className="text-sm text-muted-foreground">
										Ishlash vaqti
									</span>
									<span className="text-sm font-medium">
										{data.performance.system.uptimeHours} soat
									</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Ma'lumotlar bazasi</CardTitle>
								<CardDescription>PostgreSQL</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{(data.performance.database.sizeBytes / 1024 / 1024).toFixed(
										2,
									)}{" "}
									MB
								</div>
								<p className="text-sm text-muted-foreground mt-2">Jami hajm</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Storage Tab */}
				<TabsContent value="storage" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Fayl turlari bo'yicha</CardTitle>
								<CardDescription>
									{data.storage.fileCount.toLocaleString()} ta fayl
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.storage.byFileType.slice(0, 8).map((type) => (
										<div
											key={type.type}
											className="flex items-center justify-between"
										>
											<span className="text-sm">{type.type}</span>
											<div className="flex items-center gap-3">
												<span className="text-xs text-muted-foreground">
													{(type.sizeBytes / 1024 / 1024).toFixed(1)} MB
												</span>
												<span className="text-sm font-medium">
													{type.count} ta
												</span>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Eng ko'p ishlatuvchilar</CardTitle>
								<CardDescription>Xotira bo'yicha</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.storage.topUsersByStorage.map((user, idx) => (
										<div
											key={user.email}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground">
													#{idx + 1}
												</span>
												<span className="text-sm truncate max-w-[200px]">
													{user.email}
												</span>
											</div>
											<span className="text-sm font-medium">
												{(Number(user.totalSize) / 1024 / 1024).toFixed(1)} MB
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Features Tab */}
				<TabsContent value="features" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Eksport formatlari</CardTitle>
								<CardDescription>Mashhur formatlar</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.features.exportFormats.map((format) => (
										<div
											key={format.format}
											className="flex items-center justify-between"
										>
											<span className="text-sm uppercase">{format.format}</span>
											<span className="text-sm font-medium">
												{format.count} marta
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Shablonlar</CardTitle>
								<CardDescription>Eng ko'p ishlatilgan</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.features.topTemplates
										.slice(0, 5)
										.map((template, idx) => (
											<div
												key={template.templateId}
												className="flex items-center justify-between"
											>
												<span className="text-sm">Shablon #{idx + 1}</span>
												<span className="text-sm font-medium">
													{template.count} marta
												</span>
											</div>
										))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Effektlar</CardTitle>
								<CardDescription>Ishlatilgan effektlar</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{data.features.effectsUsage.map((effect) => (
										<div
											key={effect.effectType}
											className="flex items-center justify-between"
										>
											<span className="text-sm capitalize">
												{effect.effectType}
											</span>
											<span className="text-sm font-medium">
												{effect.count} marta
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Activity Feed */}
			<Card className="mt-8">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Faollik tarixi</CardTitle>
							<CardDescription>Oxirgi harakatlar</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button
								variant={selectedPeriod === "7d" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedPeriod("7d")}
							>
								7 kun
							</Button>
							<Button
								variant={selectedPeriod === "30d" ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedPeriod("30d")}
							>
								30 kun
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{data.activity.recentActivities.slice(0, 20).map((activity) => (
							<div
								key={activity.id}
								className="flex items-center justify-between py-2 border-b last:border-0"
							>
								<div className="flex items-center gap-3">
									<Activity className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm">{activity.action}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(activity.createdAt).toLocaleString("uz-UZ")}
										</p>
									</div>
								</div>
								<span className="text-xs text-muted-foreground">
									User #{activity.userId}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
