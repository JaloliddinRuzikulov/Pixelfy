"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
	Grid,
	List,
	Star,
	FolderPlus,
	ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import { SubscriptionStatus } from "@/components/subscription/subscription-status";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
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

interface Project {
	id: string;
	name: string;
	thumbnail?: string;
	createdAt: Date;
	updatedAt: Date;
	duration?: number;
	resolution?: string;
}

export default function ProjectsPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const t = useTranslations();
	const [projects, setProjects] = useState<Project[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newProjectName, setNewProjectName] = useState("");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const { canCreateProject, incrementProjects } = useSubscriptionStore();

	// Load projects from localStorage
	useEffect(() => {
		const loadedProjects = localStorage.getItem("video-editor-projects");
		if (loadedProjects) {
			const parsed = JSON.parse(loadedProjects);
			setProjects(parsed.map((p: any) => ({
				...p,
				createdAt: new Date(p.createdAt),
				updatedAt: new Date(p.updatedAt),
			})));
		}
	}, []);

	// Save projects to localStorage
	const saveProjects = (projectsList: Project[]) => {
		localStorage.setItem("video-editor-projects", JSON.stringify(projectsList));
		setProjects(projectsList);
	};

	// Create new project
	const handleCreateProject = () => {
		if (!newProjectName.trim()) return;

		// Check if user can create new project
		if (!canCreateProject()) {
			setShowUpgradeModal(true);
			setShowCreateDialog(false);
			return;
		}

		const newProject: Project = {
			id: Date.now().toString(),
			name: newProjectName,
			createdAt: new Date(),
			updatedAt: new Date(),
			resolution: "1920x1080",
		};

		const updatedProjects = [...projects, newProject];
		// Increment project count
		incrementProjects();
		saveProjects(updatedProjects);
		setNewProjectName("");
		setShowCreateDialog(false);

		// Navigate to editor with new project
		router.push(`/edit?projectId=${newProject.id}`);
	};

	// Open existing project
	const handleOpenProject = (projectId: string) => {
		router.push(`/edit?projectId=${projectId}`);
	};

	// Delete project
	const handleDeleteProject = () => {
		if (!selectedProject) return;

		const updatedProjects = projects.filter(p => p.id !== selectedProject.id);
		saveProjects(updatedProjects);
		setSelectedProject(null);
		setShowDeleteDialog(false);
	};

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// Show loading state while checking authentication
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

	// Filter projects based on search
	const filteredProjects = projects.filter(project => 
		project.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			{/* Modern Header */}
			<div className="bg-background/95 backdrop-blur-lg border-b sticky top-0 z-10">
				<div className="container mx-auto px-6">
					{/* Top Bar */}
					<div className="flex items-center justify-between py-4">
						<div className="flex items-center gap-4">
							<Button 
								variant="ghost" 
								size="sm"
								onClick={() => router.push("/")}
								className="gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								{t("common.back")}
							</Button>
							<div className="h-6 w-px bg-border" />
							<h1 className="text-xl font-semibold">
								{t("projects.title")}
							</h1>
						</div>
						<Button
							onClick={() => setShowCreateDialog(true)}
							className="gap-2 bg-primary hover:bg-primary/90"
						>
							<Plus className="h-4 w-4" />
							{t("projects.newProject")}
						</Button>
					</div>

					{/* Search and Filter Bar */}
					<div className="flex items-center gap-4 pb-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder={t("common.search") + "..."}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-muted/50"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="gap-2"
							>
								<Grid className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("list")}
								className="gap-2"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-6 py-8">
				{/* Subscription Status */}
				<div className="mb-8">
					<SubscriptionStatus />
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card className="hover:shadow-md transition-all cursor-pointer border-dashed border-2 hover:border-primary/50 group"
						onClick={() => setShowCreateDialog(true)}>
						<CardContent className="flex flex-col items-center justify-center p-6 text-center">
							<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
								<FolderPlus className="h-6 w-6 text-primary" />
							</div>
							<p className="font-medium text-sm">{t("projects.createProject")}</p>
							<p className="text-xs text-muted-foreground mt-1">Yangi video boshlash</p>
						</CardContent>
					</Card>
					<Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group">
						<CardContent className="flex flex-col items-center justify-center p-6 text-center">
							<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
								<Film className="h-6 w-6 text-blue-500" />
							</div>
							<p className="font-medium text-sm">Shablonlar</p>
							<p className="text-xs text-muted-foreground mt-1">Tayyor shablonlardan foydalaning</p>
						</CardContent>
					</Card>
					<Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group">
						<CardContent className="flex flex-col items-center justify-center p-6 text-center">
							<div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors">
								<Star className="h-6 w-6 text-green-500" />
							</div>
							<p className="font-medium text-sm">Sevimlilar</p>
							<p className="text-xs text-muted-foreground mt-1">Saqlangan loyihalar</p>
						</CardContent>
					</Card>
					<Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group">
						<CardContent className="flex flex-col items-center justify-center p-6 text-center">
							<div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
								<Folder className="h-6 w-6 text-purple-500" />
							</div>
							<p className="font-medium text-sm">Import</p>
							<p className="text-xs text-muted-foreground mt-1">Media fayllarni yuklash</p>
						</CardContent>
					</Card>
				</div>

				{/* Projects Section */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">Mening loyihalarim</h2>
						<p className="text-sm text-muted-foreground">
							{filteredProjects.length} ta loyiha
						</p>
					</div>
				</div>

				{filteredProjects.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16">
						<div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
							<Film className="h-12 w-12 text-primary" />
						</div>
						<h3 className="text-xl font-semibold mb-2">
							{searchQuery ? t("common.notFound") : t("projects.noProjects")}
						</h3>
						<p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
							{searchQuery 
								? "Boshqa qidiruv so'zini sinab ko'ring"
								: t("projects.createFirst")
							}
						</p>
						{!searchQuery && (
							<Button
								onClick={() => setShowCreateDialog(true)}
								size="lg"
								className="gap-2"
							>
								<Plus className="h-5 w-5" />
								{t("projects.createProject")}
							</Button>
						)}
					</div>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
						{filteredProjects.map((project) => (
							<Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
								onClick={() => handleOpenProject(project.id)}>
								<CardHeader className="p-0">
									<div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative overflow-hidden">
										{project.thumbnail ? (
											<img 
												src={project.thumbnail} 
												alt={project.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="flex flex-col items-center justify-center">
												<Video className="h-12 w-12 text-primary/50 mb-2" />
												<p className="text-xs text-muted-foreground">Ko'rish uchun bosing</p>
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
											<Button
												variant="secondary"
												size="sm"
												className="w-full gap-2"
												onClick={(e) => {
													e.stopPropagation();
													handleOpenProject(project.id);
												}}
											>
												<Edit className="h-3 w-3" />
												Tahrirlash
											</Button>
										</div>
										{/* More Options Button */}
										<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button 
														variant="secondary" 
														size="sm" 
														className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
														onClick={(e) => e.stopPropagation()}
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={(e) => {
														e.stopPropagation();
														handleOpenProject(project.id);
													}}>
														<Edit className="mr-2 h-4 w-4" />
														{t("common.edit")}
													</DropdownMenuItem>
													<DropdownMenuItem 
														className="text-red-600"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedProject(project);
															setShowDeleteDialog(true);
														}}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														{t("common.delete")}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-4">
									<h3 className="font-semibold text-sm mb-2 line-clamp-1">
										{project.name}
									</h3>
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{format(project.updatedAt, "dd MMM")}
										</div>
										{project.duration && (
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
											</div>
										)}
										<span className="text-primary/60">{project.resolution || "1920x1080"}</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					/* List View */
					<div className="space-y-2">
						{filteredProjects.map((project) => (
							<Card key={project.id} className="hover:shadow-md transition-all cursor-pointer"
								onClick={() => handleOpenProject(project.id)}>
								<CardContent className="flex items-center justify-between p-4">
									<div className="flex items-center gap-4">
										<div className="w-20 h-14 rounded bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
											{project.thumbnail ? (
												<img 
													src={project.thumbnail} 
													alt={project.name}
													className="w-full h-full object-cover rounded"
												/>
											) : (
												<Video className="h-6 w-6 text-primary/50" />
											)}
										</div>
										<div>
											<h3 className="font-semibold text-sm">{project.name}</h3>
											<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
												<span>{format(project.updatedAt, "dd MMM yyyy")}</span>
												{project.duration && (
													<span>{Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}</span>
												)}
												<span>{project.resolution || "1920x1080"}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											className="gap-2"
											onClick={(e) => {
												e.stopPropagation();
												handleOpenProject(project.id);
											}}
										>
											<Edit className="h-4 w-4" />
											Tahrirlash
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
													className="text-red-600"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedProject(project);
														setShowDeleteDialog(true);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													{t("common.delete")}
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

			{/* Create Project Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("projects.newProject")}</DialogTitle>
						<DialogDescription>
							{t("projects.enterName")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">{t("projects.projectName")}</Label>
							<Input
								id="name"
								value={newProjectName}
								onChange={(e) => setNewProjectName(e.target.value)}
								placeholder={t("projects.namePlaceholder")}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleCreateProject();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCreateDialog(false)}>
							{t("common.cancel")}
						</Button>
						<Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
							{t("common.create")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("projects.deleteProject")}</DialogTitle>
						<DialogDescription>
							{t("projects.deleteConfirm")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
							{t("common.cancel")}
						</Button>
						<Button variant="destructive" onClick={handleDeleteProject}>
							{t("common.delete")}
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