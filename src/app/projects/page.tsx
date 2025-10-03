"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Plus,
	Video,
	Clock,
	Edit,
	Trash2,
	Play,
	MoreVertical,
	Film,
	Calendar,
	Folder,
	Search,
	Filter,
	Grid3x3,
	LayoutList,
	Star,
	FolderPlus,
	ArrowLeft,
	User,
	LogOut,
	Settings,
	ChevronDown,
	Sparkles,
	TrendingUp,
	FileVideo,
	Upload,
	Copy,
	Download,
	Share2,
	Heart,
	BookmarkPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
	isAdmin,
	getRoleDisplayName,
	getRoleBadgeColor,
} from "@/lib/role-utils";
import { useTranslations } from "next-intl";
import { SubscriptionStatus } from "@/components/subscription/subscription-status";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
	id: string;
	name: string;
	thumbnail?: string;
	createdAt: Date;
	updatedAt: Date;
	duration?: number;
	resolution?: string;
	isFavorite?: boolean;
	tags?: string[];
	size?: number;
}

export default function ProjectsPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const t = useTranslations();
	const [projects, setProjects] = useState<Project[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newProjectName, setNewProjectName] = useState("");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [isCreatingProject, setIsCreatingProject] = useState(false);
	const [activeTab, setActiveTab] = useState("all");
	const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
	const { canCreateProject, incrementProjects } = useSubscriptionStore();

	// Redirect to landing if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			console.log("[Projects Page] Not authenticated, redirecting to landing page");
			router.push("/");
		}
	}, [isAuthenticated, isLoading, router]);

	// Load projects from localStorage
	useEffect(() => {
		const loadedProjects = localStorage.getItem("video-editor-projects");
		if (loadedProjects) {
			const parsed = JSON.parse(loadedProjects);
			setProjects(
				parsed.map((p: any) => ({
					...p,
					createdAt: new Date(p.createdAt),
					updatedAt: new Date(p.updatedAt),
				})),
			);
		}
	}, []);

	// Save projects to localStorage
	const saveProjects = (projectsList: Project[]) => {
		localStorage.setItem("video-editor-projects", JSON.stringify(projectsList));
		setProjects(projectsList);
	};

	// Create new project - immediately navigate without dialog
	const handleCreateProject = async () => {
		if (isCreatingProject) return;

		if (!canCreateProject()) {
			setShowUpgradeModal(true);
			return;
		}

		setIsCreatingProject(true);

		const newProject: Project = {
			id: Date.now().toString(),
			name: `Loyiha ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}`,
			createdAt: new Date(),
			updatedAt: new Date(),
			resolution: "1920x1080",
			duration: 300,
			isFavorite: false,
			tags: [],
			size: 0,
		};

		const updatedProjects = [...projects, newProject];
		incrementProjects();
		saveProjects(updatedProjects);

		// Create initial project state
		const initialState = {
			size: {
				width: 1920,
				height: 1080,
			},
			duration: 10000,
			fps: 30,
			tracks: [
				{
					id: `track-${Date.now()}`,
					type: "video",
					name: "Video Track",
					items: [],
					locked: false,
					muted: false,
					visible: true,
					volume: 1,
				},
				{
					id: `track-${Date.now() + 1}`,
					type: "audio",
					name: "Audio Track",
					items: [],
					locked: false,
					muted: false,
					visible: true,
					volume: 1,
				},
			],
			trackItemIds: [],
			transitionIds: [],
			transitionsMap: {},
			trackItemsMap: {},
			structure: [],
			activeIds: [],
			background: {
				type: "color",
				value: "#000000",
			},
			scale: {
				index: 7,
				unit: 300,
				zoom: 1 / 300,
				segments: 5,
			},
			scroll: {
				left: 0,
				top: 0,
			},
		};

		localStorage.setItem(
			`project-state-${newProject.id}`,
			JSON.stringify(initialState),
		);

		await new Promise((resolve) => setTimeout(resolve, 300));
		router.push(`/edit?projectId=${newProject.id}`);
	};

	// Toggle favorite
	const toggleFavorite = (projectId: string) => {
		const updatedProjects = projects.map((p) =>
			p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p,
		);
		saveProjects(updatedProjects);
	};

	// Duplicate project
	const duplicateProject = (project: Project) => {
		const newProject: Project = {
			...project,
			id: Date.now().toString(),
			name: `${project.name} (nusxa)`,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const updatedProjects = [...projects, newProject];
		saveProjects(updatedProjects);

		// Copy project state
		const originalState = localStorage.getItem(`project-state-${project.id}`);
		if (originalState) {
			localStorage.setItem(`project-state-${newProject.id}`, originalState);
		}
	};

	// Open existing project
	const handleOpenProject = (projectId: string) => {
		router.push(`/edit?projectId=${projectId}`);
	};

	// Delete project
	const handleDeleteProject = () => {
		if (!selectedProject) return;

		const updatedProjects = projects.filter((p) => p.id !== selectedProject.id);
		saveProjects(updatedProjects);
		localStorage.removeItem(`project-state-${selectedProject.id}`);
		setSelectedProject(null);
		setShowDeleteDialog(false);
	};

	// Handle logout
	const handleLogout = async () => {
		try {
			await logout();
			router.push("/auth/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isLoading, isAuthenticated, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	// Filter and sort projects
	let filteredProjects = projects.filter((project) =>
		project.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Tab filtering
	if (activeTab === "favorites") {
		filteredProjects = filteredProjects.filter((p) => p.isFavorite);
	} else if (activeTab === "recent") {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		filteredProjects = filteredProjects.filter((p) => p.updatedAt > oneWeekAgo);
	}

	// Sorting
	filteredProjects.sort((a, b) => {
		if (sortBy === "name") {
			return a.name.localeCompare(b.name);
		} else if (sortBy === "size") {
			return (b.size || 0) - (a.size || 0);
		} else {
			return b.updatedAt.getTime() - a.updatedAt.getTime();
		}
	});

	// Stats
	const totalProjects = projects.length;
	const favoriteProjects = projects.filter((p) => p.isFavorite).length;
	const totalDuration = projects.reduce((acc, p) => acc + (p.duration || 0), 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
			{/* Modern Header with Glass Effect */}
			<div className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-50">
				<div className="container mx-auto px-4 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo & Title */}
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
								<Film className="h-5 w-5 text-white" />
							</div>
							<div>
								<h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
									Pixelfy Studio
								</h1>
								<p className="text-xs text-muted-foreground hidden sm:block">
									Video tahrirlash platformasi
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							<ThemeToggle />
							<LanguageSwitcher />
							<Button
								onClick={handleCreateProject}
								className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300 hover:shadow-primary/25"
								size="default"
								disabled={isCreatingProject}
							>
								{isCreatingProject ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								<span className="hidden sm:inline">Yangi loyiha</span>
								<span className="sm:hidden">Yangi</span>
							</Button>

							{/* Profile Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="relative">
										<div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
											<User className="h-4 w-4" />
										</div>
										{user && isAdmin(user) && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-64">
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium">{user?.email}</p>
											{user?.role && (
												<Badge variant="secondary" className="w-fit mt-1">
													{getRoleDisplayName(user.role)}
												</Badge>
											)}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{user && isAdmin(user) && (
										<DropdownMenuItem onClick={() => router.push("/admin")}>
											<Settings className="mr-2 h-4 w-4" />
											Admin Panel
										</DropdownMenuItem>
									)}
									<DropdownMenuItem onClick={() => router.push("/profile")}>
										<User className="mr-2 h-4 w-4" />
										Profil
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => router.push("/settings")}>
										<Settings className="mr-2 h-4 w-4" />
										Sozlamalar
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => router.push("/subscription")}
									>
										<Star className="mr-2 h-4 w-4" />
										Obuna
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-red-600"
										onClick={handleLogout}
									>
										<LogOut className="mr-2 h-4 w-4" />
										Chiqish
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 lg:px-8 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Jami loyihalar
									</p>
									<p className="text-2xl font-bold">{totalProjects}</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
									<Folder className="h-5 w-5 text-blue-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Sevimlilar</p>
									<p className="text-2xl font-bold">{favoriteProjects}</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
									<Heart className="h-5 w-5 text-purple-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Umumiy vaqt</p>
									<p className="text-2xl font-bold">
										{Math.floor(totalDuration / 60)}m
									</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
									<Clock className="h-5 w-5 text-green-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Bu oy</p>
									<p className="text-2xl font-bold">
										{
											projects.filter((p) => {
												const thisMonth = new Date();
												return (
													p.createdAt.getMonth() === thisMonth.getMonth() &&
													p.createdAt.getFullYear() === thisMonth.getFullYear()
												);
											}).length
										}
									</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
									<TrendingUp className="h-5 w-5 text-orange-500" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Subscription Status */}
				<div className="mb-6">
					<SubscriptionStatus />
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col lg:flex-row gap-4 mb-6">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Loyihalarni qidirish..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 h-11 bg-muted/30 border-muted hover:bg-muted/40 focus:bg-background transition-all"
							/>
						</div>
					</div>

					<div className="flex gap-2">
						{/* Sort Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="gap-2">
									<Filter className="h-4 w-4" />
									Saralash
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setSortBy("date")}>
									<Calendar className="mr-2 h-4 w-4" />
									Sana bo'yicha
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy("name")}>
									<FileVideo className="mr-2 h-4 w-4" />
									Nom bo'yicha
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy("size")}>
									<Download className="mr-2 h-4 w-4" />
									Hajm bo'yicha
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* View Mode Toggle */}
						<div className="flex items-center bg-muted rounded-lg p-1">
							<Button
								variant={viewMode === "grid" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="h-8 px-3"
							>
								<Grid3x3 className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => setViewMode("list")}
								className="h-8 px-3"
							>
								<LayoutList className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
					<TabsList className="bg-muted/30">
						<TabsTrigger value="all" className="gap-2">
							<Folder className="h-4 w-4" />
							Barcha
						</TabsTrigger>
						<TabsTrigger value="recent" className="gap-2">
							<Clock className="h-4 w-4" />
							Oxirgi
						</TabsTrigger>
						<TabsTrigger value="favorites" className="gap-2">
							<Heart className="h-4 w-4" />
							Sevimli
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Projects Grid/List */}
				{filteredProjects.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
								<Film className="h-10 w-10 text-primary/60" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								{searchQuery ? "Hech narsa topilmadi" : "Loyihalar yo'q"}
							</h3>
							<p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
								{searchQuery
									? "Boshqa qidiruv so'zini sinab ko'ring"
									: "Birinchi loyihangizni yarating va video tahrirlashni boshlang"}
							</p>
							{!searchQuery && (
								<Button
									onClick={handleCreateProject}
									size="lg"
									className="gap-2 shadow-lg"
									disabled={isCreatingProject}
								>
									<Plus className="h-5 w-5" />
									Yangi loyiha yaratish
								</Button>
							)}
						</CardContent>
					</Card>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProjects.map((project) => (
							<Card
								key={project.id}
								className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-muted/50"
								onClick={() => handleOpenProject(project.id)}
							>
								{/* Thumbnail */}
								<div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
									{project.thumbnail ? (
										<img
											src={project.thumbnail}
											alt={project.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<div className="text-center">
												<Video className="h-12 w-12 text-primary/30 mx-auto mb-2" />
												<p className="text-xs text-muted-foreground">
													Preview yo'q
												</p>
											</div>
										</div>
									)}

									{/* Overlay Actions */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
										<div className="absolute bottom-3 left-3 right-3 flex gap-2">
											<Button
												size="sm"
												className="flex-1 gap-1 h-8"
												onClick={(e) => {
													e.stopPropagation();
													handleOpenProject(project.id);
												}}
											>
												<Play className="h-3 w-3" />
												Ochish
											</Button>
											<Button
												size="sm"
												variant="secondary"
												className="h-8 w-8 p-0"
												onClick={(e) => {
													e.stopPropagation();
													toggleFavorite(project.id);
												}}
											>
												<Heart
													className={cn(
														"h-3 w-3",
														project.isFavorite && "fill-current text-red-500",
													)}
												/>
											</Button>
										</div>
									</div>

									{/* Top Actions */}
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													size="sm"
													variant="secondary"
													className="h-8 w-8 p-0"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														duplicateProject(project);
													}}
												>
													<Copy className="mr-2 h-4 w-4" />
													Nusxa olish
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														// Export functionality
													}}
												>
													<Download className="mr-2 h-4 w-4" />
													Yuklash
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														// Share functionality
													}}
												>
													<Share2 className="mr-2 h-4 w-4" />
													Ulashish
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedProject(project);
														setShowDeleteDialog(true);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													O'chirish
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									{/* Favorite Badge */}
									{project.isFavorite && (
										<div className="absolute top-2 left-2">
											<div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
												<Heart className="h-3 w-3 text-white fill-current" />
											</div>
										</div>
									)}
								</div>

								{/* Content */}
								<CardContent className="p-4">
									<h3 className="font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
										{project.name}
									</h3>

									{/* Tags */}
									{project.tags && project.tags.length > 0 && (
										<div className="flex gap-1 mb-2">
											{project.tags.slice(0, 2).map((tag, idx) => (
												<Badge
													key={idx}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
										</div>
									)}

									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{format(project.updatedAt, "dd MMM")}
										</div>
										{project.duration && (
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{Math.floor(project.duration / 60)}:
												{(project.duration % 60).toString().padStart(2, "0")}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					/* List View */
					<div className="space-y-2">
						{filteredProjects.map((project) => (
							<Card
								key={project.id}
								className="hover:shadow-lg transition-all cursor-pointer hover:translate-x-1"
								onClick={() => handleOpenProject(project.id)}
							>
								<CardContent className="flex items-center gap-4 p-4">
									{/* Thumbnail */}
									<div className="w-24 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0">
										{project.thumbnail ? (
											<img
												src={project.thumbnail}
												alt={project.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Video className="h-6 w-6 text-primary/30" />
											</div>
										)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between mb-1">
											<h3 className="font-semibold text-sm truncate pr-2">
												{project.name}
											</h3>
											{project.isFavorite && (
												<Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
											)}
										</div>

										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<span>{format(project.updatedAt, "dd MMM yyyy")}</span>
											{project.duration && (
												<span>
													{Math.floor(project.duration / 60)}:
													{(project.duration % 60).toString().padStart(2, "0")}
												</span>
											)}
											<span>{project.resolution || "1920x1080"}</span>
										</div>

										{project.tags && project.tags.length > 0 && (
											<div className="flex gap-1 mt-2">
												{project.tags.map((tag, idx) => (
													<Badge
														key={idx}
														variant="outline"
														className="text-xs"
													>
														{tag}
													</Badge>
												))}
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="flex items-center gap-2 flex-shrink-0">
										<Button
											variant="outline"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleOpenProject(project.id);
											}}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														duplicateProject(project);
													}}
												>
													<Copy className="mr-2 h-4 w-4" />
													Nusxa olish
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														toggleFavorite(project.id);
													}}
												>
													<Heart className="mr-2 h-4 w-4" />
													{project.isFavorite
														? "Sevimlilardan olib tashlash"
														: "Sevimlilarga qo'shish"}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedProject(project);
														setShowDeleteDialog(true);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													O'chirish
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Loyihani o'chirish</DialogTitle>
						<DialogDescription>
							Haqiqatan ham "{selectedProject?.name}" loyihasini
							o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							Bekor qilish
						</Button>
						<Button variant="destructive" onClick={handleDeleteProject}>
							O'chirish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Upgrade Modal */}
			<UpgradeModal
				open={showUpgradeModal}
				onOpenChange={setShowUpgradeModal}
				reason="projects"
			/>
		</div>
	);
}
