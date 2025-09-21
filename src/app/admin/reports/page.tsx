"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	FileText,
	Download,
	Users,
	BarChart3,
	CheckCircle,
	Clock,
} from "lucide-react";

export default function ReportsPage() {
	const [activeTab, setActiveTab] = useState("quick");
	const [userStats, setUserStats] = useState<any>(null);
	const [projectStats, setProjectStats] = useState<any>(null);

	useEffect(() => {
		// Fetch basic stats
		const fetchStats = async () => {
			try {
				const [usersRes, projectsRes] = await Promise.all([
					fetch("/api/admin/users"),
					fetch("/api/admin/projects"),
				]);

				if (usersRes.ok) {
					const userData = await usersRes.json();
					setUserStats({
						total: userData.users?.length || 0,
						active: userData.users?.filter((u: any) => u.lastLogin).length || 0,
					});
				}

				if (projectsRes.ok) {
					const projectData = await projectsRes.json();
					setProjectStats({
						total: projectData.total || 0,
						published: projectData.published || 0,
					});
				}
			} catch (error) {
				console.error("Error fetching stats:", error);
			}
		};

		fetchStats();
	}, []);

	// Sample reports data
	const reports = [
		{
			id: "1",
			name: "Oylik foydalanuvchilar hisoboti",
			type: "users",
			format: "PDF",
			size: "245 KB",
			date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			status: "completed",
		},
		{
			id: "2",
			name: "Haftalik faollik statistikasi",
			type: "activity",
			format: "Excel",
			size: "189 KB",
			date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
			status: "completed",
		},
	];

	const handleExportUsers = () => {
		const data = {
			title: "Foydalanuvchilar hisoboti",
			date: new Date().toLocaleDateString("uz-UZ"),
			stats: userStats,
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `users-report-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleExportProjects = () => {
		const data = {
			title: "Loyihalar hisoboti",
			date: new Date().toLocaleDateString("uz-UZ"),
			stats: projectStats,
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `projects-report-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	return (
		<div className="p-6">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Hisobotlar va eksport
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Ma'lumotlarni tahlil qilish va eksport qilish
					</p>
				</div>
				<Link href="/admin">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Orqaga
					</Button>
				</Link>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Yuborilgan hisobotlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">Oxirgi 30 kunda</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							PDF hisobotlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">18</div>
						<p className="text-xs text-muted-foreground">Jami PDF fayllar</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Excel hisobotlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">6</div>
						<p className="text-xs text-muted-foreground">Jami Excel fayllar</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Umumiy hajm
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">2.4 MB</div>
						<p className="text-xs text-muted-foreground">Barcha fayllar</p>
					</CardContent>
				</Card>
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-2 mb-6">
				<Button
					variant={activeTab === "quick" ? "default" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("quick")}
				>
					Tezkor eksport
				</Button>
				<Button
					variant={activeTab === "history" ? "default" : "ghost"}
					size="sm"
					onClick={() => setActiveTab("history")}
				>
					Hisobot tarixi
				</Button>
			</div>

			{/* Quick Export Tab */}
			{activeTab === "quick" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Tezkor eksport</CardTitle>
							<CardDescription>
								Ma'lumotlarni tezkor eksport qilish
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start gap-2"
								onClick={handleExportUsers}
							>
								<Users className="h-4 w-4" />
								Foydalanuvchilar ro'yxati
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start gap-2"
								onClick={handleExportProjects}
							>
								<BarChart3 className="h-4 w-4" />
								Loyihalar statistikasi
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Hisobot generatori</CardTitle>
							<CardDescription>Maxsus hisobotlar yaratish</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium">Hisobot turi</label>
									<select className="w-full mt-1 p-2 rounded-md border">
										<option>Umumiy statistika</option>
										<option>Foydalanuvchilar tahlili</option>
										<option>Loyihalar hisoboti</option>
									</select>
								</div>
								<Button className="w-full gap-2">
									<FileText className="h-4 w-4" />
									Hisobot yaratish
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* History Tab */}
			{activeTab === "history" && (
				<Card>
					<CardHeader>
						<CardTitle>Oxirgi hisobotlar</CardTitle>
						<CardDescription>
							Yaratilgan va yuklab olingan hisobotlar
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{reports.map((report) => (
								<div
									key={report.id}
									className="flex items-center justify-between p-4 rounded-lg border"
								>
									<div className="flex items-center gap-3">
										<FileText className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium">{report.name}</p>
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline">{report.type}</Badge>
												<span className="text-xs text-muted-foreground">
													{report.size}
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{report.status === "completed" ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<Clock className="h-4 w-4 text-yellow-500" />
										)}
										<Button variant="ghost" size="sm">
											<Download className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
