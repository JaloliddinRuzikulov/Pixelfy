import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
	Search,
	Upload,
	Image,
	Video,
	Music,
	FileText,
	Trash2,
	Download,
	Eye,
	MoreVertical,
	ArrowLeft,
} from "lucide-react";
import { MediaRepository } from "@/lib/db-extended";
import fs from "fs";
import path from "path";

// Helper to get user by ID
async function getUserById(userId: string) {
	const dbPath = path.join(process.cwd(), "dev-db.json");
	if (fs.existsSync(dbPath)) {
		const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
		const users = data.users || [];
		return users.find((u: any) => u.id === userId);
	}
	return null;
}

const getFileIcon = (type: string) => {
	switch (type) {
		case "video":
			return <Video className="h-8 w-8 text-blue-500" />;
		case "image":
			return <Image className="h-8 w-8 text-green-500" />;
		case "audio":
			return <Music className="h-8 w-8 text-purple-500" />;
		case "document":
			return <FileText className="h-8 w-8 text-yellow-500" />;
		default:
			return <FileText className="h-8 w-8 text-gray-500" />;
	}
};

// Format file size
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Format date
function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString("uz-UZ");
}

export default async function MediaPage() {
	// Get real media data
	const allMedia = await MediaRepository.findAll();
	const stats = await MediaRepository.getStats();

	// Add user information and format media items
	const mediaItems = await Promise.all(
		allMedia.map(async (item) => {
			const user = await getUserById(item.userId);
			return {
				id: item.id,
				name: item.filename,
				type: item.type,
				size: formatFileSize(item.size),
				owner: user?.email || "Noma'lum",
				uploadDate: formatDate(item.createdAt),
				views: Math.floor(Math.random() * 200), // Placeholder for views
			};
		}),
	);

	// Calculate total storage used
	const totalStorage = formatFileSize(stats.totalSize);
	const videoStorage = formatFileSize(
		allMedia
			.filter((m) => m.type === "video")
			.reduce((sum, m) => sum + m.size, 0),
	);
	const imageStorage = formatFileSize(
		allMedia
			.filter((m) => m.type === "image")
			.reduce((sum, m) => sum + m.size, 0),
	);
	const audioStorage = formatFileSize(
		allMedia
			.filter((m) => m.type === "audio")
			.reduce((sum, m) => sum + m.size, 0),
	);

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Media kutubxonasi
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Barcha yuklangan media fayllarni boshqarish
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
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Jami fayllar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">{totalStorage}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Videolar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.byType.video}</div>
						<p className="text-xs text-muted-foreground">{videoStorage}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Rasmlar
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.byType.image}</div>
						<p className="text-xs text-muted-foreground">{imageStorage}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Audio
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.byType.audio}</div>
						<p className="text-xs text-muted-foreground">{audioStorage}</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Actions */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							type="search"
							placeholder="Media fayllarni qidirish..."
							className="pl-10"
						/>
					</div>
					<Button className="gap-2">
						<Upload className="h-4 w-4" />
						Fayl yuklash
					</Button>
				</div>
			</div>

			{/* Media Table */}
			<Card>
				<CardHeader>
					<CardTitle>Media fayllar</CardTitle>
					<CardDescription>
						Barcha yuklangan media fayllar ro'yxati
					</CardDescription>
				</CardHeader>
				<CardContent>
					{mediaItems.length === 0 ? (
						<div className="text-center py-12">
							<FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
							<p className="text-gray-500 dark:text-gray-400">
								Hozircha media fayllar yo'q
							</p>
							<Button className="mt-4 gap-2">
								<Upload className="h-4 w-4" />
								Birinchi faylni yuklash
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left p-4">Fayl</th>
										<th className="text-left p-4">Turi</th>
										<th className="text-left p-4">Hajmi</th>
										<th className="text-left p-4">Egasi</th>
										<th className="text-left p-4">Yuklangan</th>
										<th className="text-left p-4">Ko'rishlar</th>
										<th className="text-left p-4">Harakatlar</th>
									</tr>
								</thead>
								<tbody>
									{mediaItems.map((item) => (
										<tr
											key={item.id}
											className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="p-4">
												<div className="flex items-center gap-3">
													{getFileIcon(item.type)}
													<div>
														<p className="font-medium">{item.name}</p>
													</div>
												</div>
											</td>
											<td className="p-4">
												<span className="capitalize">{item.type}</span>
											</td>
											<td className="p-4">{item.size}</td>
											<td className="p-4">{item.owner}</td>
											<td className="p-4">{item.uploadDate}</td>
											<td className="p-4">
												<div className="flex items-center gap-1">
													<Eye className="h-4 w-4 text-gray-400" />
													{item.views}
												</div>
											</td>
											<td className="p-4">
												<div className="flex items-center gap-2">
													<Button variant="ghost" size="sm">
														<Download className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="sm">
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
													<Button variant="ghost" size="sm">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
