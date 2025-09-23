"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Shapes,
	Music,
	Sticker,
	Image as ImageIcon,
	Frame,
	Sparkles,
	Play,
	Download,
	Plus,
	Filter,
	X,
	Library,
	Grid3x3,
	List,
	Star,
	Heart,
	TrendingUp,
	Clock,
	Palette,
	Brush,
	Volume2,
} from "lucide-react";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import { ADD_ITEMS } from "@designcombo/state";

// Content categories and subcategories
const CONTENT_CATEGORIES = {
	shape: {
		label: "Shakllar",
		icon: Shapes,
		color: "blue",
		subcategories: [
			"asosiy",
			"bezak",
			"ko'rsatkichlar",
			"abstrakt",
			"geometrik",
		],
	},
	music: {
		label: "Musiqa",
		icon: Music,
		color: "purple",
		subcategories: [
			"quvnoq",
			"tinch",
			"energetik",
			"dramatik",
			"romantik",
			"elektron",
		],
	},
	sticker: {
		label: "Stikerlar",
		icon: Sticker,
		color: "yellow",
		subcategories: [
			"emoji",
			"bayram",
			"ta'lim",
			"sport",
			"hayvonlar",
			"oziq-ovqat",
		],
	},
	background: {
		label: "Fon rasmlari",
		icon: ImageIcon,
		color: "green",
		subcategories: [
			"tabiat",
			"shahar",
			"abstrakt",
			"gradient",
			"tekstura",
			"minimal",
		],
	},
	border: {
		label: "Hoshiyalar",
		icon: Frame,
		color: "pink",
		subcategories: ["oddiy", "bezakli", "vintage", "zamonaviy", "animatsiya"],
	},
	effect: {
		label: "Tovush effektlari",
		icon: Volume2,
		color: "orange",
		subcategories: [
			"o'tish",
			"signal",
			"tabiat",
			"mexanik",
			"elektron",
			"kulgili",
		],
	},
	overlay: {
		label: "Overleylar",
		icon: Sparkles,
		color: "indigo",
		subcategories: [
			"yorug'lik",
			"zarrachalar",
			"bokeh",
			"tutun",
			"animatsiya",
			"glitch",
		],
	},
};

// Mock content items
const generateMockItems = (category: string, count: number) => {
	return Array.from({ length: count }, (_, i) => ({
		id: `${category}-${i}`,
		name: `${CONTENT_CATEGORIES[category as keyof typeof CONTENT_CATEGORIES].label} ${i + 1}`,
		category,
		subcategory:
			CONTENT_CATEGORIES[category as keyof typeof CONTENT_CATEGORIES]
				.subcategories[
				i %
					CONTENT_CATEGORIES[category as keyof typeof CONTENT_CATEGORIES]
						.subcategories.length
			],
		thumbnail: `/api/placeholder/150/150`,
		duration:
			category === "music" || category === "effect"
				? Math.floor(Math.random() * 180) + 30
				: undefined,
		premium: i % 3 === 0,
		likes: Math.floor(Math.random() * 1000),
		downloads: Math.floor(Math.random() * 5000),
	}));
};

export function ContentLibrary() {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
	const [sortBy, setSortBy] = useState<"popular" | "recent" | "trending">(
		"popular",
	);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Generate mock content
	const allContent = useMemo(() => {
		const content: any[] = [];
		Object.keys(CONTENT_CATEGORIES).forEach((category) => {
			content.push(...generateMockItems(category, 12));
		});
		return content;
	}, []);

	// Filter content based on search and filters
	const filteredContent = useMemo(() => {
		let filtered = allContent;

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter((item) => item.category === selectedCategory);
		}

		// Filter by subcategory
		if (selectedSubcategory !== "all") {
			filtered = filtered.filter(
				(item) => item.subcategory === selectedSubcategory,
			);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter((item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Sort
		switch (sortBy) {
			case "popular":
				filtered.sort((a, b) => b.downloads - a.downloads);
				break;
			case "trending":
				filtered.sort((a, b) => b.likes - a.likes);
				break;
			case "recent":
				// In real app, would sort by creation date
				break;
		}

		return filtered;
	}, [allContent, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

	const handleAddToTimeline = useCallback((item: any) => {
		// Add item to timeline based on its type
		console.log("Adding to timeline:", item);

		// Here would be the actual implementation
		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [
					{
						id: generateId(),
						type:
							item.category === "music" || item.category === "effect"
								? "audio"
								: "image",
						display: { from: 0, to: 5000 },
						trim: { from: 0, to: 5000 },
						duration: 5000,
					},
				],
			},
		});
	}, []);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex flex-col h-full overflow-hidden bg-background">
			{/* Header */}
			<div className="flex-shrink-0 h-12 flex items-center px-4 text-sm font-medium border-b bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent">
				<Library className="h-4 w-4 mr-2 text-indigo-500" />
				Kontent kutubxonasi
			</div>

			{/* Search and Filters Bar */}
			<div className="flex-shrink-0 p-4 space-y-3 border-b bg-muted/30">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Kontent qidirish..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 h-9"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
							onClick={() => setSearchQuery("")}
						>
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>

				{/* Filter Controls */}
				<div className="flex items-center gap-2">
					<Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
						<SelectTrigger className="h-8 w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="popular">
								<div className="flex items-center gap-1">
									<Star className="h-3 w-3" />
									Mashhur
								</div>
							</SelectItem>
							<SelectItem value="trending">
								<div className="flex items-center gap-1">
									<TrendingUp className="h-3 w-3" />
									Trend
								</div>
							</SelectItem>
							<SelectItem value="recent">
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									Yangi
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					<div className="flex-1" />

					<div className="flex gap-1 p-0.5 bg-muted rounded">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 w-7 p-0"
							onClick={() => setViewMode("grid")}
						>
							<Grid3x3 className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 w-7 p-0"
							onClick={() => setViewMode("list")}
						>
							<List className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden">
				{/* Category Sidebar */}
				<div className="w-48 flex-shrink-0 border-r bg-muted/20">
					<ScrollArea className="h-full">
						<div className="p-3 space-y-1">
							<Button
								variant={selectedCategory === "all" ? "secondary" : "ghost"}
								className="w-full justify-start h-9 px-3"
								onClick={() => {
									setSelectedCategory("all");
									setSelectedSubcategory("all");
								}}
							>
								<Sparkles className="h-4 w-4 mr-2" />
								Barcha kontent
							</Button>

							{Object.entries(CONTENT_CATEGORIES).map(([key, category]) => {
								const Icon = category.icon;
								return (
									<div key={key}>
										<Button
											variant={selectedCategory === key ? "secondary" : "ghost"}
											className="w-full justify-start h-9 px-3"
											onClick={() => {
												setSelectedCategory(key);
												setSelectedSubcategory("all");
											}}
										>
											<Icon
												className={`h-4 w-4 mr-2 text-${category.color}-500`}
											/>
											{category.label}
										</Button>

										{selectedCategory === key && (
											<div className="ml-6 mt-1 space-y-0.5">
												<Button
													variant={
														selectedSubcategory === "all"
															? "secondary"
															: "ghost"
													}
													className="w-full justify-start h-7 px-2 text-xs"
													onClick={() => setSelectedSubcategory("all")}
												>
													Hammasi
												</Button>
												{category.subcategories.map((sub) => (
													<Button
														key={sub}
														variant={
															selectedSubcategory === sub
																? "secondary"
																: "ghost"
														}
														className="w-full justify-start h-7 px-2 text-xs capitalize"
														onClick={() => setSelectedSubcategory(sub)}
													>
														{sub}
													</Button>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</ScrollArea>
				</div>

				{/* Content Grid/List */}
				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full">
						<div className="p-4">
							{filteredContent.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-20">
									<Search className="h-12 w-12 text-muted-foreground mb-4" />
									<p className="text-muted-foreground">Hech narsa topilmadi</p>
									<Button
										variant="outline"
										size="sm"
										className="mt-4"
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("all");
											setSelectedSubcategory("all");
										}}
									>
										Filtrlarni tozalash
									</Button>
								</div>
							) : viewMode === "grid" ? (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
									{filteredContent.map((item) => {
										const Icon =
											CONTENT_CATEGORIES[
												item.category as keyof typeof CONTENT_CATEGORIES
											].icon;
										return (
											<Card
												key={item.id}
												className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer border-border/50 bg-gradient-to-br from-background to-muted/20"
												onClick={() => handleAddToTimeline(item)}
											>
												<div className="aspect-square relative bg-muted overflow-hidden">
													{item.premium && (
														<Badge className="absolute top-2 right-2 z-10 bg-yellow-500/90 text-yellow-900">
															Premium
														</Badge>
													)}
													<div className="absolute inset-0 flex items-center justify-center">
														<Icon className="h-12 w-12 text-muted-foreground/30" />
													</div>
													<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
													<div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
														<Button
															size="sm"
															variant="secondary"
															className="h-7 px-2"
															onClick={(e) => {
																e.stopPropagation();
																handleAddToTimeline(item);
															}}
														>
															<Plus className="h-3 w-3 mr-1" />
															Qo'shish
														</Button>
													</div>
												</div>
												<CardContent className="p-3">
													<p className="text-sm font-medium truncate">
														{item.name}
													</p>
													<div className="flex items-center justify-between mt-1">
														<p className="text-xs text-muted-foreground capitalize">
															{item.subcategory}
														</p>
														{item.duration && (
															<p className="text-xs text-muted-foreground">
																{formatDuration(item.duration)}
															</p>
														)}
													</div>
													<div className="flex items-center gap-3 mt-2">
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															<Heart className="h-3 w-3" />
															{item.likes}
														</div>
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															<Download className="h-3 w-3" />
															{item.downloads}
														</div>
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							) : (
								<div className="space-y-2">
									{filteredContent.map((item) => {
										const Icon =
											CONTENT_CATEGORIES[
												item.category as keyof typeof CONTENT_CATEGORIES
											].icon;
										return (
											<Card
												key={item.id}
												className="group overflow-hidden hover:shadow-md transition-all cursor-pointer border-border/50"
												onClick={() => handleAddToTimeline(item)}
											>
												<CardContent className="p-3 flex items-center gap-3">
													<div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
														<Icon className="h-8 w-8 text-muted-foreground/50" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p className="font-medium truncate">
																{item.name}
															</p>
															{item.premium && (
																<Badge className="bg-yellow-500/90 text-yellow-900">
																	Premium
																</Badge>
															)}
														</div>
														<div className="flex items-center gap-3 mt-1">
															<p className="text-xs text-muted-foreground capitalize">
																{item.subcategory}
															</p>
															{item.duration && (
																<p className="text-xs text-muted-foreground">
																	{formatDuration(item.duration)}
																</p>
															)}
															<div className="flex items-center gap-1 text-xs text-muted-foreground">
																<Heart className="h-3 w-3" />
																{item.likes}
															</div>
															<div className="flex items-center gap-1 text-xs text-muted-foreground">
																<Download className="h-3 w-3" />
																{item.downloads}
															</div>
														</div>
													</div>
													<Button
														size="sm"
														variant="outline"
														className="opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={(e) => {
															e.stopPropagation();
															handleAddToTimeline(item);
														}}
													>
														<Plus className="h-4 w-4 mr-1" />
														Qo'shish
													</Button>
												</CardContent>
											</Card>
										);
									})}
								</div>
							)}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
