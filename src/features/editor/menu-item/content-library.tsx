"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { toast } from "sonner";

// Content categories and subcategories (simplified)
const CONTENT_CATEGORIES = {
	shape: {
		label: "Shakllar",
		icon: Shapes,
		color: "blue",
		subcategories: ["asosiy", "geometrik", "abstrakt"],
	},
	sticker: {
		label: "Stikerlar",
		icon: Sticker,
		color: "yellow",
		subcategories: ["emoji", "hayvonlar", "bayram"],
	},
	background: {
		label: "Fon rasmlari",
		icon: ImageIcon,
		color: "green",
		subcategories: ["gradient", "tekstura", "minimal"],
	},
	music: {
		label: "Musiqa",
		icon: Music,
		color: "purple",
		subcategories: ["quvnoq", "tinch", "energetik"],
	},
};

// Mock content items with placeholder images
const generateMockItems = (category: string, count: number) => {
	// Use a colored placeholder based on category
	const getPlaceholderImage = (cat: string, index: number) => {
		// Generate a simple colored SVG data URL
		const colors = {
			shape: '#3b82f6',
			music: '#a855f7',
			sticker: '#eab308',
			background: '#22c55e',
			border: '#ec4899',
			effect: '#f97316',
			overlay: '#6366f1',
		};
		const color = colors[cat as keyof typeof colors] || '#64748b';
		const svg = `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="150" fill="${color}"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="48" font-family="Arial">${index + 1}</text></svg>`;
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	};

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
		thumbnail: getPlaceholderImage(category, i),
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

	// Debug: Log when component mounts
	useEffect(() => {
		console.log("📚 Content Library component mounted");
		return () => console.log("📚 Content Library component unmounted");
	}, []);

	// Generate mock content (6 items per category)
	const allContent = useMemo(() => {
		const content: any[] = [];
		Object.keys(CONTENT_CATEGORIES).forEach((category) => {
			content.push(...generateMockItems(category, 6));
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
		console.log("🎯 Content Library - Adding to timeline:", item);

		const isAudio = item.category === "music" || item.category === "effect";
		const duration = item.duration ? item.duration * 1000 : 5000; // Convert to milliseconds

		// Ensure we have a valid src
		const src = item.thumbnail && item.thumbnail.trim() !== ""
			? item.thumbnail
			: `data:image/svg+xml;base64,${btoa('<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="150" fill="#64748b"/></svg>')}`;

		const trackItem: any = {
			id: generateId(),
			type: isAudio ? "audio" : "image",
			display: { from: 0, to: duration },
			trim: { from: 0, to: duration },
			duration: duration,
			details: isAudio
				? {
						// Audio item details
						src: src,
						volume: 1,
						name: item.name,
				  }
				: {
						// Image/Shape item details
						src: src,
						x: 50,  // Center x
						y: 50,  // Center y
						width: 50,  // 50% width
						height: 50,  // 50% height
						opacity: 1,
						fit: "contain",
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
				  },
			metadata: {
				name: item.name,
				category: item.category,
				subcategory: item.subcategory,
				source: "content-library",
			},
		};

		console.log("📦 Dispatching track item with src:", trackItem.details.src.substring(0, 100));

		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [trackItem],
			},
		});

		console.log("✅ ADD_ITEMS event dispatched");

		// Show success feedback
		toast.success(`"${item.name}" timeline'ga qo'shildi`, {
			description: `${CONTENT_CATEGORIES[item.category as keyof typeof CONTENT_CATEGORIES].label} - ${item.subcategory}`,
			duration: 2000,
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
			<div className="flex-shrink-0 p-3 space-y-3 border-b">
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

				{/* Category Chips - Horizontal Scroll */}
				<div className="relative">
					<ScrollArea className="w-full whitespace-nowrap">
						<div className="flex gap-2 pb-2">
							{/* All Categories Chip */}
							<Button
								variant={selectedCategory === "all" ? "default" : "outline"}
								size="sm"
								className="h-8 px-3 rounded-full shrink-0"
								onClick={() => {
									setSelectedCategory("all");
									setSelectedSubcategory("all");
								}}
							>
								<Sparkles className="h-3.5 w-3.5 mr-1.5" />
								Barchasi
							</Button>

							{/* Category Chips */}
							{Object.entries(CONTENT_CATEGORIES).map(([key, category]) => {
								const Icon = category.icon;
								return (
									<Button
										key={key}
										variant={selectedCategory === key ? "default" : "outline"}
										size="sm"
										className="h-8 px-3 rounded-full shrink-0"
										onClick={() => {
											setSelectedCategory(key);
											setSelectedSubcategory("all");
										}}
									>
										<Icon className="h-3.5 w-3.5 mr-1.5" />
										{category.label}
									</Button>
								);
							})}
						</div>
					</ScrollArea>
				</div>

				{/* Subcategory Chips - Only show when category selected */}
				{selectedCategory !== "all" && (
					<div className="relative">
						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex gap-2 pb-2">
								<Button
									variant={selectedSubcategory === "all" ? "secondary" : "ghost"}
									size="sm"
									className="h-7 px-2.5 rounded-full text-xs shrink-0"
									onClick={() => setSelectedSubcategory("all")}
								>
									Hammasi
								</Button>
								{CONTENT_CATEGORIES[
									selectedCategory as keyof typeof CONTENT_CATEGORIES
								].subcategories.map((sub) => (
									<Button
										key={sub}
										variant={
											selectedSubcategory === sub ? "secondary" : "ghost"
										}
										size="sm"
										className="h-7 px-2.5 rounded-full text-xs capitalize shrink-0"
										onClick={() => setSelectedSubcategory(sub)}
									>
										{sub}
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>
				)}

				{/* Sort and View Mode Controls */}
				<div className="flex items-center gap-2">
					<Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
						<SelectTrigger className="h-8 w-[130px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="popular">
								<div className="flex items-center gap-1.5">
									<Star className="h-3 w-3" />
									Mashhur
								</div>
							</SelectItem>
							<SelectItem value="trending">
								<div className="flex items-center gap-1.5">
									<TrendingUp className="h-3 w-3" />
									Trend
								</div>
							</SelectItem>
							<SelectItem value="recent">
								<div className="flex items-center gap-1.5">
									<Clock className="h-3 w-3" />
									Yangi
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					<div className="flex-1" />

					<div className="flex gap-1 p-0.5 bg-muted rounded-md">
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
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
									{filteredContent.map((item) => {
										return (
											<div
												key={item.id}
												className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
												onClick={() => handleAddToTimeline(item)}
											>
												<img
													src={item.thumbnail}
													alt={item.name}
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
													<p className="text-xs font-medium text-white truncate">
														{item.name}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="space-y-1.5">
									{filteredContent.map((item) => {
										return (
											<div
												key={item.id}
												className="group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
												onClick={() => handleAddToTimeline(item)}
											>
												<img
													src={item.thumbnail}
													alt={item.name}
													className="w-10 h-10 rounded object-cover flex-shrink-0"
												/>
												<p className="text-sm truncate flex-1">
													{item.name}
												</p>
											</div>
										);
									})}
								</div>
							)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
