import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
	Download,
	Upload,
	Database,
	Clock,
	CheckCircle,
	AlertCircle,
	ArrowLeft,
	RefreshCw,
	Shield,
	HardDrive,
	Calendar,
	FileArchive,
	CloudUpload,
	History,
} from "lucide-react";
import fs from "fs";
import path from "path";

// Get backup history
async function getBackupHistory() {
	const backupDir = path.join(process.cwd(), "backups");

	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	const files = fs.readdirSync(backupDir);
	const backups = files
		.filter((file) => file.endsWith(".json"))
		.map((file) => {
			const stats = fs.statSync(path.join(backupDir, file));
			return {
				id: file,
				name: file,
				size: formatFileSize(stats.size),
				date: stats.mtime,
				status: "completed" as const,
			};
		})
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	return backups;
}

// Calculate database size
async function getDatabaseSize() {
	const dbPath = path.join(process.cwd(), "dev-db.json");
	if (fs.existsSync(dbPath)) {
		const stats = fs.statSync(dbPath);
		return stats.size;
	}
	return 0;
}

// Format file size
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default async function BackupPage() {
	const backups = await getBackupHistory();
	const dbSize = await getDatabaseSize();
	const lastBackup = backups[0];
	const totalBackups = backups.length;

	// Calculate storage used
	const totalBackupSize = backups.reduce((sum, backup) => {
		const sizeStr = backup.size;
		const sizeNum = parseFloat(sizeStr);
		const unit = sizeStr.split(" ")[1];
		const multiplier = unit === "MB" ? 1024 * 1024 : unit === "KB" ? 1024 : 1;
		return sum + sizeNum * multiplier;
	}, 0);

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Zaxira nusxa va tiklash
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Ma'lumotlar bazasini zaxiralash va tiklash
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
							Oxirgi zaxira
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">
								{lastBackup
									? new Date(lastBackup.date).toLocaleString("uz-UZ")
									: "Hali yo'q"}
							</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Jami zaxiralar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<FileArchive className="h-4 w-4 text-muted-foreground" />
							<span className="text-2xl font-bold">{totalBackups}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							DB hajmi
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Database className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-bold">
								{formatFileSize(dbSize)}
							</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Ishlatilgan xotira
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<HardDrive className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-bold">
								{formatFileSize(totalBackupSize)}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Quick Actions */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle>Tezkor amallar</CardTitle>
						<CardDescription>
							Ma'lumotlarni zaxiralash va tiklash
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form action="/api/admin/backup" method="POST">
							<Button className="w-full gap-2" type="submit">
								<Download className="h-4 w-4" />
								Yangi zaxira yaratish
							</Button>
						</form>

						<Button variant="outline" className="w-full gap-2">
							<Upload className="h-4 w-4" />
							Zaxiradan tiklash
						</Button>

						<Button variant="outline" className="w-full gap-2">
							<CloudUpload className="h-4 w-4" />
							Bulutga yuklash
						</Button>

						<div className="pt-4 border-t">
							<h4 className="text-sm font-medium mb-3">Avtomatik zaxiralash</h4>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm">Status</span>
									<Badge className="bg-green-100 text-green-800">Faol</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Davriyligi</span>
									<span className="text-sm font-medium">Har kuni</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Vaqti</span>
									<span className="text-sm font-medium">02:00</span>
								</div>
							</div>
							<Button variant="outline" size="sm" className="w-full mt-3">
								Sozlash
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Backup History */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<History className="h-5 w-5" />
							Zaxira tarixi
						</CardTitle>
						<CardDescription>Oxirgi zaxira nusxalari</CardDescription>
					</CardHeader>
					<CardContent>
						{backups.length === 0 ? (
							<div className="text-center py-12">
								<Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
								<p className="text-gray-500 dark:text-gray-400">
									Hozircha zaxira nusxalar yo'q
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									Yuqoridagi tugmani bosib birinchi zaxirani yarating
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{backups.slice(0, 10).map((backup) => (
									<div
										key={backup.id}
										className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-primary/10">
												<FileArchive className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="font-medium text-sm">{backup.name}</p>
												<div className="flex items-center gap-3 mt-1">
													<span className="text-xs text-muted-foreground">
														{new Date(backup.date).toLocaleString("uz-UZ")}
													</span>
													<span className="text-xs text-muted-foreground">
														{backup.size}
													</span>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{backup.status === "completed" ? (
												<CheckCircle className="h-4 w-4 text-green-500" />
											) : (
												<AlertCircle className="h-4 w-4 text-yellow-500" />
											)}
											<Button variant="ghost" size="sm">
												<Download className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm">
												<RefreshCw className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Backup Settings */}
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Xavfsizlik va saqlash
					</CardTitle>
					<CardDescription>
						Zaxira nusxalarni himoyalash sozlamalari
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="text-sm font-medium mb-3">Shifrlash</h4>
							<div className="space-y-2">
								<div className="flex items-center justify-between p-3 rounded-lg border">
									<div className="flex items-center gap-3">
										<Shield className="h-4 w-4 text-primary" />
										<div>
											<p className="text-sm font-medium">AES-256 shifrlash</p>
											<p className="text-xs text-muted-foreground">
												Barcha zaxiralar shifrlanadi
											</p>
										</div>
									</div>
									<Badge className="bg-green-100 text-green-800">Faol</Badge>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium mb-3">Saqlash muddati</h4>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm">Kunlik zaxiralar</span>
									<span className="text-sm font-medium">7 kun</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Haftalik zaxiralar</span>
									<span className="text-sm font-medium">4 hafta</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Oylik zaxiralar</span>
									<span className="text-sm font-medium">12 oy</span>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium">Avtomatik tozalash faol</p>
								<p className="text-xs text-muted-foreground mt-1">
									Eski zaxira nusxalar belgilangan muddat o'tgach avtomatik
									o'chiriladi
								</p>
							</div>
							<Button variant="outline" size="sm">
								O'chirish
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
