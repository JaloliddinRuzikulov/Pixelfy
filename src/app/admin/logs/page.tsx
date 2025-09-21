"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
	ArrowLeft,
	Search,
	Filter,
	Download,
	RefreshCw,
	AlertCircle,
	CheckCircle,
	Info,
	AlertTriangle,
	XCircle,
	Terminal,
	Clock,
	Calendar,
} from "lucide-react";

// Determine log level based on action
function getLogLevel(action: string): "info" | "warning" | "error" | "success" {
	if (action.includes("xato") || action.includes("error")) return "error";
	if (action.includes("ogohlantirish") || action.includes("warning"))
		return "warning";
	if (
		action.includes("muvaffaqiyat") ||
		action.includes("success") ||
		action.includes("yaratildi")
	)
		return "success";
	return "info";
}

// Get log level icon
function getLogLevelIcon(level: string) {
	switch (level) {
		case "error":
			return <XCircle className="h-4 w-4 text-red-500" />;
		case "warning":
			return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
		case "success":
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		default:
			return <Info className="h-4 w-4 text-blue-500" />;
	}
}

// Get log level badge color
function getLogLevelBadge(level: string) {
	switch (level) {
		case "error":
			return <Badge className="bg-red-100 text-red-800">Xato</Badge>;
		case "warning":
			return (
				<Badge className="bg-yellow-100 text-yellow-800">Ogohlantirish</Badge>
			);
		case "success":
			return (
				<Badge className="bg-green-100 text-green-800">Muvaffaqiyat</Badge>
			);
		default:
			return <Badge className="bg-blue-100 text-blue-800">Ma'lumot</Badge>;
	}
}

export default function LogsPage() {
	const [logs, setLogs] = useState<any[]>([]);
	const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [levelFilter, setLevelFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");

	useEffect(() => {
		fetchLogs();
	}, []);

	const fetchLogs = async () => {
		try {
			const response = await fetch("/api/admin/activities");
			if (response.ok) {
				const data = await response.json();
				const activities = data.activities || [];

				// Transform activities into log format
				const transformedLogs = activities.map(
					(activity: any, index: number) => ({
						id: activity.id || `log-${index}`,
						timestamp: new Date(activity.createdAt),
						level: getLogLevel(activity.action),
						source: activity.entityType || "system",
						message: activity.action,
						details: activity.details || "",
						userId: activity.userId,
					}),
				);

				// Sort by timestamp descending
				const sortedLogs = transformedLogs.sort(
					(a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime(),
				);

				setLogs(sortedLogs);
				setFilteredLogs(sortedLogs);
			}
		} catch (error) {
			console.error("Error fetching logs:", error);
		} finally {
			setLoading(false);
		}
	};

	// Filter logs based on search and filters
	useEffect(() => {
		let filtered = [...logs];

		if (searchQuery) {
			filtered = filtered.filter(
				(log) =>
					log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
					log.details.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		if (levelFilter) {
			filtered = filtered.filter((log) => log.level === levelFilter);
		}

		if (sourceFilter) {
			filtered = filtered.filter((log) => log.source === sourceFilter);
		}

		setFilteredLogs(filtered);
	}, [searchQuery, levelFilter, sourceFilter, logs]);

	// Calculate stats
	const totalLogs = logs.length;
	const errorCount = logs.filter((l) => l.level === "error").length;
	const warningCount = logs.filter((l) => l.level === "warning").length;
	const todayLogs = logs.filter(
		(l) => l.timestamp.toDateString() === new Date().toDateString(),
	).length;

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Tizim jurnallari
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Tizim faoliyati va xatolar jurnali
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Jami jurnallar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Terminal className="h-4 w-4 text-muted-foreground" />
							<span className="text-2xl font-bold">{totalLogs}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Bugungi jurnallar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-2xl font-bold">{todayLogs}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Xatolar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<XCircle className="h-4 w-4 text-red-500" />
							<span className="text-2xl font-bold text-red-600">
								{errorCount}
							</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Ogohlantirishlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-yellow-500" />
							<span className="text-2xl font-bold text-yellow-600">
								{warningCount}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Logs Filter and Search */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Jurnallarni filtrlash</CardTitle>
					<CardDescription>Jurnallarni qidiring va filtrlang</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Jurnal xabarlarini qidirish..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<select
							className="px-4 py-2 rounded-md border"
							value={levelFilter}
							onChange={(e) => setLevelFilter(e.target.value)}
						>
							<option value="">Barcha darajalar</option>
							<option value="error">Xatolar</option>
							<option value="warning">Ogohlantirishlar</option>
							<option value="success">Muvaffaqiyatlar</option>
							<option value="info">Ma'lumotlar</option>
						</select>
						<select
							className="px-4 py-2 rounded-md border"
							value={sourceFilter}
							onChange={(e) => setSourceFilter(e.target.value)}
						>
							<option value="">Barcha manbalar</option>
							<option value="system">Tizim</option>
							<option value="user">Foydalanuvchi</option>
							<option value="project">Loyiha</option>
							<option value="media">Media</option>
						</select>
						<Button
							variant="outline"
							className="gap-2"
							onClick={() => {
								setSearchQuery("");
								setLevelFilter("");
								setSourceFilter("");
							}}
						>
							<Filter className="h-4 w-4" />
							Tozalash
						</Button>
						<Button variant="outline" className="gap-2" onClick={fetchLogs}>
							<RefreshCw className="h-4 w-4" />
							Yangilash
						</Button>
						<Button variant="outline" className="gap-2">
							<Download className="h-4 w-4" />
							Eksport
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Logs List */}
			<Card>
				<CardHeader>
					<CardTitle>Jurnal yozuvlari</CardTitle>
					<CardDescription>
						Oxirgi tizim faoliyati va xatoliklari
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					) : (
						<div className="space-y-2">
							{filteredLogs.length === 0 ? (
								<div className="text-center py-12">
									<Terminal className="h-12 w-12 mx-auto text-gray-400 mb-4" />
									<p className="text-gray-500 dark:text-gray-400">
										Jurnal yozuvlari topilmadi
									</p>
								</div>
							) : (
								filteredLogs.slice(0, 100).map((log) => (
									<div
										key={log.id}
										className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
									>
										<div className="mt-1">{getLogLevelIcon(log.level)}</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-3">
												{getLogLevelBadge(log.level)}
												<Badge variant="outline">{log.source}</Badge>
												<span className="text-xs text-muted-foreground flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{log.timestamp.toLocaleString("uz-UZ")}
												</span>
											</div>
											<p className="text-sm font-medium">{log.message}</p>
											{log.details && (
												<p className="text-xs text-muted-foreground">
													{log.details}
												</p>
											)}
											{log.userId && (
												<p className="text-xs text-muted-foreground">
													Foydalanuvchi ID: {log.userId}
												</p>
											)}
										</div>
									</div>
								))
							)}
						</div>
					)}

					{filteredLogs.length > 100 && (
						<div className="mt-4 text-center">
							<p className="text-sm text-muted-foreground mb-2">
								Ko'rsatilgan: 100 / {filteredLogs.length}
							</p>
							<Button variant="outline" size="sm">
								Ko'proq ko'rish
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
