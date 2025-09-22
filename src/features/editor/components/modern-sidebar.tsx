"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Film,
	Image,
	Music,
	Type,
	Shapes,
	Sparkles,
	Upload,
	Search,
	Plus,
	Folder,
	Clock,
	Star,
	TrendingUp,
} from "lucide-react";
import { Videos as MenuItemVideos } from "../menu-item/videos";
import { Images as MenuItemImages } from "../menu-item/images";
import { Audios as MenuItemAudios } from "../menu-item/audios";
import { Texts as MenuItemTexts } from "../menu-item/texts";
import { Elements as MenuItemElements } from "../menu-item/elements";
import { Uploads as MenuItemUploads } from "../menu-item/uploads";

interface ModernSidebarProps {
	stateManager: any;
	trackItemsMap: any;
}

export default function ModernSidebar({
	stateManager,
	trackItemsMap,
}: ModernSidebarProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("videos");

	const menuItems = [
		{ id: "videos", label: "Videolar", icon: Film, component: MenuItemVideos },
		{ id: "images", label: "Rasmlar", icon: Image, component: MenuItemImages },
		{ id: "audio", label: "Audio", icon: Music, component: MenuItemAudios },
		{ id: "text", label: "Matn", icon: Type, component: MenuItemTexts },
		{
			id: "elements",
			label: "Elementlar",
			icon: Shapes,
			component: MenuItemElements,
		},
		{
			id: "uploads",
			label: "Yuklashlar",
			icon: Upload,
			component: MenuItemUploads,
		},
	];

	const quickActions = [
		{ icon: Clock, label: "Oxirgilar", badge: "12" },
		{ icon: Star, label: "Sevimlilar", badge: "5" },
		{ icon: TrendingUp, label: "Mashhur", badge: "Yangi" },
	];

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-slate-800">
				<h2 className="text-lg font-semibold text-white mb-3">Media kutubxonasi</h2>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<Input
						placeholder="Search media..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
					/>
				</div>

				{/* Quick Actions */}
				<div className="flex gap-2 mt-3">
					{quickActions.map((action) => (
						<Button
							key={action.label}
							variant="ghost"
							size="sm"
							className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800 relative"
						>
							<action.icon className="h-3 w-3 mr-1" />
							{action.label}
							{action.badge && (
								<span className="ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
									{action.badge}
								</span>
							)}
						</Button>
					))}
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex-1 flex flex-col"
			>
				<TabsList className="w-full justify-start rounded-none bg-transparent border-b border-slate-800 px-4">
					{menuItems.map((item) => (
						<TabsTrigger
							key={item.id}
							value={item.id}
							className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
						>
							<item.icon className="h-4 w-4 mr-2" />
							{item.label}
						</TabsTrigger>
					))}
				</TabsList>

				<ScrollArea className="flex-1">
					{menuItems.map((item) => {
						const Component = item.component;
						return (
							<TabsContent key={item.id} value={item.id} className="p-4 mt-0">
								<Component />
							</TabsContent>
						);
					})}
				</ScrollArea>
			</Tabs>

			{/* Footer Actions */}
			<div className="p-4 border-t border-slate-800">
				<Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
					<Upload className="h-4 w-4 mr-2" />
					Media yuklash
				</Button>
				<div className="mt-2 flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 border-slate-700 text-slate-300"
					>
						<Folder className="h-3 w-3 mr-1" />
						Ko'rish
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-1 border-slate-700 text-slate-300"
					>
						<Plus className="h-3 w-3 mr-1" />
						Yaratish
					</Button>
				</div>
			</div>
		</div>
	);
}
