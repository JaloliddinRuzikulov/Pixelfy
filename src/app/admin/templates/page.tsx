"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/role-utils";
import {
	Plus,
	Search,
	Filter,
	Download,
	Upload,
	Edit,
	Trash2,
	Copy,
	Eye,
	EyeOff,
	MoreVertical,
	FileVideo,
	Layout,
	Palette,
	Sparkles,
	TrendingUp,
	Star,
	Clock,
	Grid3x3,
	List,
	ChevronLeft,
	ChevronRight,
	Settings,
	Image,
	Music,
	Type,
	Film,
	Layers,
	Package,
	Zap,
	Heart,
	Share2,
	Lock,
	Unlock,
	Tag,
	Calendar,
	Users,
	BarChart3,
	PlayCircle,
	PauseCircle,
	CheckCircle,
	XCircle,
	AlertCircle,
	RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Template {
	id: string;
	name: string;
	description: string;
	category: string;
	thumbnail?: string;
	preview?: string;
	tags: string[];
	duration: number;
	resolution: string;
	fps: number;
	isActive: boolean;
	isPremium: boolean;
	isFeatured: boolean;
	usageCount: number;
	rating: number;
	createdAt: Date;
	updatedAt: Date;
	author: string;
	assets: {
		videos: number;
		images: number;
		audio: number;
		texts: number;
		effects: number;
	};
	projectData?: any;
}

const categories = [
	{ value: "all", label: "Barcha", icon: Grid3x3 },
	{ value: "intro", label: "Intro", icon: PlayCircle },
	{ value: "outro", label: "Outro", icon: PauseCircle },
	{ value: "social", label: "Ijtimoiy tarmoq", icon: Share2 },
	{ value: "business", label: "Biznes", icon: BarChart3 },
	{ value: "education", label: "Ta'lim", icon: Users },
	{ value: "gaming", label: "Gaming", icon: Zap },
	{ value: "music", label: "Musiqa", icon: Music },
	{ value: "wedding", label: "To'y", icon: Heart },
	{ value: "birthday", label: "Tug'ilgan kun", icon: Calendar },
	{ value: "travel", label: "Sayohat", icon: Package },
	{ value: "sports", label: "Sport", icon: TrendingUp },
];

export default function AdminTemplatesPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
		null,
	);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showPreviewDialog, setShowPreviewDialog] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [sortBy, setSortBy] = useState<"date" | "usage" | "rating" | "name">(
		"date",
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(12);
	const [activeTab, setActiveTab] = useState("all");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form state for create/edit
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "intro",
		tags: "",
		duration: 10,
		resolution: "1920x1080",
		fps: 30,
		isPremium: false,
		isFeatured: false,
		isActive: true,
	});

	// Load templates (mock data for now)
	useEffect(() => {
		loadTemplates();
	}, []);

	const loadTemplates = () => {
		// Mock templates data
		const mockTemplates: Template[] = [
			{
				id: "1",
				name: "Modern Intro",
				description: "Zamonaviy va stilish intro shabloni",
				category: "intro",
				tags: ["modern", "minimal", "clean"],
				duration: 5,
				resolution: "1920x1080",
				fps: 30,
				isActive: true,
				isPremium: false,
				isFeatured: true,
				usageCount: 1250,
				rating: 4.8,
				createdAt: new Date("2024-01-15"),
				updatedAt: new Date("2024-01-20"),
				author: "Admin",
				assets: {
					videos: 2,
					images: 5,
					audio: 1,
					texts: 3,
					effects: 4,
				},
			},
			{
				id: "2",
				name: "Business Presentation",
				description: "Professional biznes taqdimoti uchun",
				category: "business",
				tags: ["corporate", "professional", "clean"],
				duration: 30,
				resolution: "1920x1080",
				fps: 30,
				isActive: true,
				isPremium: true,
				isFeatured: false,
				usageCount: 850,
				rating: 4.6,
				createdAt: new Date("2024-01-10"),
				updatedAt: new Date("2024-01-18"),
				author: "Admin",
				assets: {
					videos: 0,
					images: 10,
					audio: 1,
					texts: 8,
					effects: 2,
				},
			},
			{
				id: "3",
				name: "Instagram Reels",
				description: "Instagram Reels uchun vertikal shablon",
				category: "social",
				tags: ["instagram", "reels", "vertical", "trendy"],
				duration: 15,
				resolution: "1080x1920",
				fps: 30,
				isActive: true,
				isPremium: false,
				isFeatured: true,
				usageCount: 2100,
				rating: 4.9,
				createdAt: new Date("2024-01-12"),
				updatedAt: new Date("2024-01-22"),
				author: "Admin",
				assets: {
					videos: 1,
					images: 3,
					audio: 1,
					texts: 2,
					effects: 5,
				},
			},
			{
				id: "4",
				name: "Wedding Invitation",
				description: "To'y taklifnomasi uchun chiroyli shablon",
				category: "wedding",
				tags: ["wedding", "romantic", "elegant"],
				duration: 20,
				resolution: "1920x1080",
				fps: 30,
				isActive: true,
				isPremium: true,
				isFeatured: false,
				usageCount: 650,
				rating: 4.7,
				createdAt: new Date("2024-01-08"),
				updatedAt: new Date("2024-01-15"),
				author: "Admin",
				assets: {
					videos: 1,
					images: 8,
					audio: 2,
					texts: 5,
					effects: 3,
				},
			},
			{
				id: "5",
				name: "Gaming Outro",
				description: "Gaming kanallar uchun outro",
				category: "gaming",
				tags: ["gaming", "energetic", "neon"],
				duration: 8,
				resolution: "1920x1080",
				fps: 60,
				isActive: true,
				isPremium: false,
				isFeatured: false,
				usageCount: 1500,
				rating: 4.5,
				createdAt: new Date("2024-01-05"),
				updatedAt: new Date("2024-01-10"),
				author: "Admin",
				assets: {
					videos: 2,
					images: 4,
					audio: 1,
					texts: 2,
					effects: 6,
				},
			},
		];

		setTemplates(mockTemplates);
		setFilteredTemplates(mockTemplates);
	};

	// Filter templates
	useEffect(() => {
		let filtered = [...templates];

		// Category filter
		if (selectedCategory !== "all") {
			filtered = filtered.filter((t) => t.category === selectedCategory);
		}

		// Tab filter
		if (activeTab === "active") {
			filtered = filtered.filter((t) => t.isActive);
		} else if (activeTab === "premium") {
			filtered = filtered.filter((t) => t.isPremium);
		} else if (activeTab === "featured") {
			filtered = filtered.filter((t) => t.isFeatured);
		}

		// Search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(t) =>
					t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					t.tags.some((tag) =>
						tag.toLowerCase().includes(searchQuery.toLowerCase()),
					),
			);
		}

		// Sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "usage":
					return b.usageCount - a.usageCount;
				case "rating":
					return b.rating - a.rating;
				case "name":
					return a.name.localeCompare(b.name);
				default:
					return b.updatedAt.getTime() - a.updatedAt.getTime();
			}
		});

		setFilteredTemplates(filtered);
	}, [templates, selectedCategory, activeTab, searchQuery, sortBy]);

	// Pagination
	const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
	const paginatedTemplates = filteredTemplates.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// Create template
	const handleCreateTemplate = async () => {
		setIsSubmitting(true);
		try {
			const newTemplate: Template = {
				id: Date.now().toString(),
				name: formData.name,
				description: formData.description,
				category: formData.category,
				tags: formData.tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean),
				duration: formData.duration,
				resolution: formData.resolution,
				fps: formData.fps,
				isActive: formData.isActive,
				isPremium: formData.isPremium,
				isFeatured: formData.isFeatured,
				usageCount: 0,
				rating: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				author: user?.email || "Admin",
				assets: {
					videos: 0,
					images: 0,
					audio: 0,
					texts: 0,
					effects: 0,
				},
			};

			setTemplates([...templates, newTemplate]);
			toast.success("Shablon muvaffaqiyatli yaratildi");
			setShowCreateDialog(false);
			resetForm();
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Update template
	const handleUpdateTemplate = async () => {
		if (!selectedTemplate) return;

		setIsSubmitting(true);
		try {
			const updatedTemplates = templates.map((t) =>
				t.id === selectedTemplate.id
					? {
							...t,
							name: formData.name,
							description: formData.description,
							category: formData.category,
							tags: formData.tags
								.split(",")
								.map((tag) => tag.trim())
								.filter(Boolean),
							duration: formData.duration,
							resolution: formData.resolution,
							fps: formData.fps,
							isActive: formData.isActive,
							isPremium: formData.isPremium,
							isFeatured: formData.isFeatured,
							updatedAt: new Date(),
						}
					: t,
			);

			setTemplates(updatedTemplates);
			toast.success("Shablon muvaffaqiyatli yangilandi");
			setShowEditDialog(false);
			resetForm();
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete template
	const handleDeleteTemplate = async () => {
		if (!selectedTemplate) return;

		setIsSubmitting(true);
		try {
			setTemplates(templates.filter((t) => t.id !== selectedTemplate.id));
			toast.success("Shablon o'chirildi");
			setShowDeleteDialog(false);
			setSelectedTemplate(null);
		} catch (error) {
			toast.error("Xatolik yuz berdi");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Duplicate template
	const handleDuplicateTemplate = (template: Template) => {
		const newTemplate: Template = {
			...template,
			id: Date.now().toString(),
			name: `${template.name} (nusxa)`,
			usageCount: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setTemplates([...templates, newTemplate]);
		toast.success("Shablon nusxalandi");
	};

	// Toggle template status
	const toggleTemplateStatus = (template: Template) => {
		const updatedTemplates = templates.map((t) =>
			t.id === template.id ? { ...t, isActive: !t.isActive } : t,
		);
		setTemplates(updatedTemplates);
		toast.success(`Shablon ${template.isActive ? "o'chirildi" : "yoqildi"}`);
	};

	// Reset form
	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			category: "intro",
			tags: "",
			duration: 10,
			resolution: "1920x1080",
			fps: 30,
			isPremium: false,
			isFeatured: false,
			isActive: true,
		});
		setSelectedTemplate(null);
	};

	// Open edit dialog
	const openEditDialog = (template: Template) => {
		setSelectedTemplate(template);
		setFormData({
			name: template.name,
			description: template.description,
			category: template.category,
			tags: template.tags.join(", "),
			duration: template.duration,
			resolution: template.resolution,
			fps: template.fps,
			isPremium: template.isPremium,
			isFeatured: template.isFeatured,
			isActive: template.isActive,
		});
		setShowEditDialog(true);
	};

	// Check authentication
	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !isAdmin(user))) {
			router.push("/");
		}
	}, [isLoading, isAuthenticated, user, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Stats
	const totalTemplates = templates.length;
	const activeTemplates = templates.filter((t) => t.isActive).length;
	const premiumTemplates = templates.filter((t) => t.isPremium).length;
	const totalUsage = templates.reduce((acc, t) => acc + t.usageCount, 0);

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold">Shablonlar</h1>
					<p className="text-muted-foreground">
						Video shablonlarini boshqarish
					</p>
				</div>
				<Button onClick={() => setShowCreateDialog(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Yangi shablon
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Jami shablonlar</p>
								<p className="text-3xl font-bold">{totalTemplates}</p>
							</div>
							<Layout className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Faol shablonlar</p>
								<p className="text-3xl font-bold">{activeTemplates}</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Premium</p>
								<p className="text-3xl font-bold">{premiumTemplates}</p>
							</div>
							<Star className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">
									Jami foydalanish
								</p>
								<p className="text-3xl font-bold">
									{totalUsage.toLocaleString()}
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-orange-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Shablonlarni qidirish..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Category Filter */}
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}
						>
							<SelectTrigger className="w-full lg:w-[200px]">
								<SelectValue placeholder="Kategoriya" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										<div className="flex items-center gap-2">
											<cat.icon className="h-4 w-4" />
											{cat.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Sort */}
						<Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
							<SelectTrigger className="w-full lg:w-[180px]">
								<SelectValue placeholder="Saralash" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Oxirgi yangilangan</SelectItem>
								<SelectItem value="usage">Ko'p ishlatilgan</SelectItem>
								<SelectItem value="rating">Reyting bo'yicha</SelectItem>
								<SelectItem value="name">Nom bo'yicha</SelectItem>
							</SelectContent>
						</Select>

						{/* View Mode */}
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
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">Barcha</TabsTrigger>
					<TabsTrigger value="active">Faol</TabsTrigger>
					<TabsTrigger value="premium">Premium</TabsTrigger>
					<TabsTrigger value="featured">Tavsiya etilgan</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-6">
					{viewMode === "grid" ? (
						/* Grid View */
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{paginatedTemplates.map((template) => (
								<Card
									key={template.id}
									className="overflow-hidden hover:shadow-lg transition-all"
								>
									{/* Thumbnail */}
									<div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5">
										{template.thumbnail ? (
											<img
												src={template.thumbnail}
												alt={template.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Film className="h-12 w-12 text-primary/30" />
											</div>
										)}

										{/* Badges */}
										<div className="absolute top-2 left-2 flex gap-2">
											{template.isPremium && (
												<Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
													Premium
												</Badge>
											)}
											{template.isFeatured && (
												<Badge variant="secondary">
													<Star className="h-3 w-3 mr-1" />
													Featured
												</Badge>
											)}
										</div>

										{/* Status */}
										<div className="absolute top-2 right-2">
											<Badge
												variant={template.isActive ? "default" : "destructive"}
											>
												{template.isActive ? "Faol" : "Nofaol"}
											</Badge>
										</div>
									</div>

									<CardContent className="p-4">
										<div className="space-y-2">
											<h3 className="font-semibold line-clamp-1">
												{template.name}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{template.description}
											</p>

											{/* Category & Duration */}
											<div className="flex items-center justify-between text-xs">
												<Badge variant="outline">
													{
														categories.find(
															(c) => c.value === template.category,
														)?.label
													}
												</Badge>
												<span className="text-muted-foreground">
													{template.duration}s • {template.resolution}
												</span>
											</div>

											{/* Stats */}
											<div className="flex items-center justify-between pt-2">
												<div className="flex items-center gap-3 text-xs text-muted-foreground">
													<span className="flex items-center gap-1">
														<Users className="h-3 w-3" />
														{template.usageCount}
													</span>
													<span className="flex items-center gap-1">
														<Star className="h-3 w-3" />
														{template.rating}
													</span>
												</div>
											</div>
										</div>
									</CardContent>

									<CardFooter className="p-4 pt-0 flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											onClick={() => {
												setSelectedTemplate(template);
												setShowPreviewDialog(true);
											}}
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											onClick={() => openEditDialog(template)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" size="sm" className="px-2">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => handleDuplicateTemplate(template)}
												>
													<Copy className="mr-2 h-4 w-4" />
													Nusxa olish
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => toggleTemplateStatus(template)}
												>
													{template.isActive ? (
														<>
															<EyeOff className="mr-2 h-4 w-4" />
															O'chirish
														</>
													) : (
														<>
															<Eye className="mr-2 h-4 w-4" />
															Yoqish
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600"
													onClick={() => {
														setSelectedTemplate(template);
														setShowDeleteDialog(true);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													O'chirish
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</CardFooter>
								</Card>
							))}
						</div>
					) : (
						/* List View */
						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Shablon</TableHead>
										<TableHead>Kategoriya</TableHead>
										<TableHead>Davomiylik</TableHead>
										<TableHead>Foydalanish</TableHead>
										<TableHead>Reyting</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Yangilangan</TableHead>
										<TableHead className="text-right">Amallar</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedTemplates.map((template) => (
										<TableRow key={template.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="w-16 h-10 rounded bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
														{template.thumbnail ? (
															<img
																src={template.thumbnail}
																alt={template.name}
																className="w-full h-full object-cover rounded"
															/>
														) : (
															<Film className="h-5 w-5 text-primary/30" />
														)}
													</div>
													<div>
														<div className="font-medium">{template.name}</div>
														<div className="text-sm text-muted-foreground line-clamp-1">
															{template.description}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{
														categories.find(
															(c) => c.value === template.category,
														)?.label
													}
												</Badge>
											</TableCell>
											<TableCell>{template.duration}s</TableCell>
											<TableCell>{template.usageCount}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3 text-yellow-500" />
													{template.rating}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														template.isActive ? "default" : "destructive"
													}
												>
													{template.isActive ? "Faol" : "Nofaol"}
												</Badge>
											</TableCell>
											<TableCell>
												{format(template.updatedAt, "dd MMM yyyy")}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => openEditDialog(template)}
														>
															<Edit className="mr-2 h-4 w-4" />
															Tahrirlash
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDuplicateTemplate(template)}
														>
															<Copy className="mr-2 h-4 w-4" />
															Nusxa olish
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => toggleTemplateStatus(template)}
														>
															{template.isActive ? (
																<>
																	<EyeOff className="mr-2 h-4 w-4" />
																	O'chirish
																</>
															) : (
																<>
																	<Eye className="mr-2 h-4 w-4" />
																	Yoqish
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => {
																setSelectedTemplate(template);
																setShowDeleteDialog(true);
															}}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															O'chirish
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						{filteredTemplates.length} ta shablondan{" "}
						{(currentPage - 1) * itemsPerPage + 1}-
						{Math.min(currentPage * itemsPerPage, filteredTemplates.length)}{" "}
						ko'rsatilmoqda
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => setCurrentPage(page)}
								className={cn(
									"w-8",
									Math.abs(currentPage - page) > 2 &&
										page !== 1 &&
										page !== totalPages &&
										"hidden",
								)}
							>
								{page}
							</Button>
						))}
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Create Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Yangi shablon yaratish</DialogTitle>
						<DialogDescription>Yangi video shabloni qo'shish</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Nomi</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Shablon nomi"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Tavsif</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Shablon haqida qisqacha ma'lumot"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="category">Kategoriya</Label>
								<Select
									value={formData.category}
									onValueChange={(v) =>
										setFormData({ ...formData, category: v })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{categories
											.filter((c) => c.value !== "all")
											.map((cat) => (
												<SelectItem key={cat.value} value={cat.value}>
													{cat.label}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="duration">Davomiylik (soniya)</Label>
								<Input
									id="duration"
									type="number"
									value={formData.duration}
									onChange={(e) =>
										setFormData({
											...formData,
											duration: parseInt(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="resolution">O'lcham</Label>
								<Select
									value={formData.resolution}
									onValueChange={(v) =>
										setFormData({ ...formData, resolution: v })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1920x1080">
											1920x1080 (Full HD)
										</SelectItem>
										<SelectItem value="1280x720">1280x720 (HD)</SelectItem>
										<SelectItem value="1080x1920">
											1080x1920 (Vertical)
										</SelectItem>
										<SelectItem value="1080x1080">
											1080x1080 (Square)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="fps">FPS</Label>
								<Select
									value={formData.fps.toString()}
									onValueChange={(v) =>
										setFormData({ ...formData, fps: parseInt(v) })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="24">24</SelectItem>
										<SelectItem value="30">30</SelectItem>
										<SelectItem value="60">60</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="tags">Teglar (vergul bilan ajrating)</Label>
							<Input
								id="tags"
								value={formData.tags}
								onChange={(e) =>
									setFormData({ ...formData, tags: e.target.value })
								}
								placeholder="modern, minimal, clean"
							/>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label htmlFor="active">Faol</Label>
								<Switch
									id="active"
									checked={formData.isActive}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isActive: v })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="premium">Premium</Label>
								<Switch
									id="premium"
									checked={formData.isPremium}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isPremium: v })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="featured">Tavsiya etilgan</Label>
								<Switch
									id="featured"
									checked={formData.isFeatured}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isFeatured: v })
									}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowCreateDialog(false)}
						>
							Bekor qilish
						</Button>
						<Button onClick={handleCreateTemplate} disabled={isSubmitting}>
							{isSubmitting && (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							)}
							Yaratish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Shablonni tahrirlash</DialogTitle>
						<DialogDescription>
							Shablon ma'lumotlarini o'zgartirish
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Nomi</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-description">Tavsif</Label>
							<Textarea
								id="edit-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-category">Kategoriya</Label>
								<Select
									value={formData.category}
									onValueChange={(v) =>
										setFormData({ ...formData, category: v })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{categories
											.filter((c) => c.value !== "all")
											.map((cat) => (
												<SelectItem key={cat.value} value={cat.value}>
													{cat.label}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="edit-duration">Davomiylik (soniya)</Label>
								<Input
									id="edit-duration"
									type="number"
									value={formData.duration}
									onChange={(e) =>
										setFormData({
											...formData,
											duration: parseInt(e.target.value),
										})
									}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-tags">Teglar</Label>
							<Input
								id="edit-tags"
								value={formData.tags}
								onChange={(e) =>
									setFormData({ ...formData, tags: e.target.value })
								}
							/>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label htmlFor="edit-active">Faol</Label>
								<Switch
									id="edit-active"
									checked={formData.isActive}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isActive: v })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="edit-premium">Premium</Label>
								<Switch
									id="edit-premium"
									checked={formData.isPremium}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isPremium: v })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="edit-featured">Tavsiya etilgan</Label>
								<Switch
									id="edit-featured"
									checked={formData.isFeatured}
									onCheckedChange={(v) =>
										setFormData({ ...formData, isFeatured: v })
									}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowEditDialog(false)}>
							Bekor qilish
						</Button>
						<Button onClick={handleUpdateTemplate} disabled={isSubmitting}>
							{isSubmitting && (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							)}
							Saqlash
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Shablonni o'chirish</DialogTitle>
						<DialogDescription>
							Haqiqatan ham "{selectedTemplate?.name}" shablonini
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
						<Button
							variant="destructive"
							onClick={handleDeleteTemplate}
							disabled={isSubmitting}
						>
							{isSubmitting && (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							)}
							O'chirish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{selectedTemplate?.name}</DialogTitle>
						<DialogDescription>Shablon ko'rinishi</DialogDescription>
					</DialogHeader>

					{selectedTemplate && (
						<div className="space-y-4">
							{/* Preview */}
							<div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
								{selectedTemplate.preview ? (
									<img
										src={selectedTemplate.preview}
										alt={selectedTemplate.name}
										className="w-full h-full object-cover rounded-lg"
									/>
								) : (
									<div className="text-center space-y-2">
										<Film className="h-16 w-16 text-primary/30 mx-auto" />
										<p className="text-muted-foreground">Preview mavjud emas</p>
									</div>
								)}
							</div>

							{/* Info */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Kategoriya</p>
									<p className="font-medium">
										{
											categories.find(
												(c) => c.value === selectedTemplate.category,
											)?.label
										}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Davomiylik</p>
									<p className="font-medium">
										{selectedTemplate.duration} soniya
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">O'lcham</p>
									<p className="font-medium">{selectedTemplate.resolution}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">FPS</p>
									<p className="font-medium">{selectedTemplate.fps}</p>
								</div>
							</div>

							{/* Assets */}
							<div>
								<p className="text-sm text-muted-foreground mb-2">Resurslar</p>
								<div className="flex gap-4">
									<Badge variant="outline">
										<FileVideo className="h-3 w-3 mr-1" />
										{selectedTemplate.assets.videos} video
									</Badge>
									<Badge variant="outline">
										<Image className="h-3 w-3 mr-1" />
										{selectedTemplate.assets.images} rasm
									</Badge>
									<Badge variant="outline">
										<Music className="h-3 w-3 mr-1" />
										{selectedTemplate.assets.audio} audio
									</Badge>
									<Badge variant="outline">
										<Type className="h-3 w-3 mr-1" />
										{selectedTemplate.assets.texts} matn
									</Badge>
									<Badge variant="outline">
										<Sparkles className="h-3 w-3 mr-1" />
										{selectedTemplate.assets.effects} effekt
									</Badge>
								</div>
							</div>

							{/* Tags */}
							<div>
								<p className="text-sm text-muted-foreground mb-2">Teglar</p>
								<div className="flex flex-wrap gap-2">
									{selectedTemplate.tags.map((tag, idx) => (
										<Badge key={idx} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-3 gap-4 pt-4 border-t">
								<div>
									<p className="text-sm text-muted-foreground">Foydalanilgan</p>
									<p className="text-2xl font-bold">
										{selectedTemplate.usageCount}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Reyting</p>
									<p className="text-2xl font-bold flex items-center gap-1">
										<Star className="h-5 w-5 text-yellow-500" />
										{selectedTemplate.rating}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Muallif</p>
									<p className="text-2xl font-bold">
										{selectedTemplate.author}
									</p>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowPreviewDialog(false)}
						>
							Yopish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
