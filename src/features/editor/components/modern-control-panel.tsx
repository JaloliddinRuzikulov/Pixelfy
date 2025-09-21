"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Palette,
	Sliders,
	Sparkles,
	Move,
	Maximize2,
	RotateCw,
	FlipHorizontal,
	FlipVertical,
	Layers,
	Eye,
	Lock,
	Unlock,
	Copy,
	Trash2,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { ITrackItem } from "@designcombo/types";
import { ControlItem } from "../control-item/control-item";

interface ModernControlPanelProps {
	trackItem: ITrackItem | null;
	stateManager: any;
}

export default function ModernControlPanel({
	trackItem,
	stateManager,
}: ModernControlPanelProps) {
	const [activeTab, setActiveTab] = useState("properties");
	const [expandedSections, setExpandedSections] = useState<string[]>([
		"transform",
		"appearance",
	]);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) =>
			prev.includes(section)
				? prev.filter((s) => s !== section)
				: [...prev, section],
		);
	};

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center h-64 text-center px-4">
			<Layers className="h-12 w-12 text-slate-600 mb-3" />
			<h3 className="text-sm font-medium text-slate-300">
				No Element Selected
			</h3>
			<p className="text-xs text-slate-500 mt-1">
				Select an element to view and edit its properties
			</p>
		</div>
	);

	const renderPropertySection = (
		title: string,
		id: string,
		children: React.ReactNode,
	) => {
		const isExpanded = expandedSections.includes(id);
		return (
			<div className="border-b border-slate-800">
				<button
					onClick={() => toggleSection(id)}
					className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
				>
					<span className="text-sm font-medium text-slate-300">{title}</span>
					{isExpanded ? (
						<ChevronUp className="h-4 w-4 text-slate-400" />
					) : (
						<ChevronDown className="h-4 w-4 text-slate-400" />
					)}
				</button>
				{isExpanded && <div className="px-3 pb-3 space-y-3">{children}</div>}
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-slate-800">
				<h2 className="text-lg font-semibold text-white">Properties</h2>
				{trackItem && (
					<div className="mt-2 flex items-center gap-2">
						<div className="flex-1">
							<p className="text-sm text-slate-400">Selected Element</p>
							<p className="text-sm font-medium text-white truncate">
								{trackItem.name || "Untitled"}
							</p>
						</div>
						<Button
							size="icon"
							variant="ghost"
							className="text-slate-400 hover:text-white hover:bg-slate-800"
						>
							<Lock className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="text-slate-400 hover:text-white hover:bg-slate-800"
						>
							<Eye className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{!trackItem ? (
				renderEmptyState()
			) : (
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col"
				>
					<TabsList className="w-full justify-start rounded-none bg-transparent border-b border-slate-800 px-4">
						<TabsTrigger
							value="properties"
							className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
						>
							<Sliders className="h-4 w-4 mr-2" />
							Properties
						</TabsTrigger>
						<TabsTrigger
							value="effects"
							className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
						>
							<Sparkles className="h-4 w-4 mr-2" />
							Effects
						</TabsTrigger>
						<TabsTrigger
							value="animation"
							className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
						>
							<Move className="h-4 w-4 mr-2" />
							Animation
						</TabsTrigger>
					</TabsList>

					<ScrollArea className="flex-1">
						<TabsContent value="properties" className="mt-0 space-y-0">
							{renderPropertySection(
								"Transform",
								"transform",
								<>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Position X</Label>
										<Slider
											value={[50]}
											max={100}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Position Y</Label>
										<Slider
											value={[50]}
											max={100}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Scale</Label>
										<Slider
											value={[100]}
											min={0}
											max={200}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Rotation</Label>
										<Slider
											value={[0]}
											min={-180}
											max={180}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="flex gap-2 mt-3">
										<Button
											size="sm"
											variant="outline"
											className="flex-1 border-slate-700 text-slate-300"
										>
											<FlipHorizontal className="h-3 w-3 mr-1" />
											Flip H
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="flex-1 border-slate-700 text-slate-300"
										>
											<FlipVertical className="h-3 w-3 mr-1" />
											Flip V
										</Button>
									</div>
								</>,
							)}

							{renderPropertySection(
								"Appearance",
								"appearance",
								<>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Opacity</Label>
										<Slider
											value={[100]}
											max={100}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Blur</Label>
										<Slider
											value={[0]}
											max={20}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Brightness</Label>
										<Slider
											value={[100]}
											min={0}
											max={200}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Contrast</Label>
										<Slider
											value={[100]}
											min={0}
											max={200}
											step={1}
											className="cursor-pointer"
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs text-slate-400">Saturation</Label>
										<Slider
											value={[100]}
											min={0}
											max={200}
											step={1}
											className="cursor-pointer"
										/>
									</div>
								</>,
							)}

							{renderPropertySection(
								"Blend Mode",
								"blend",
								<Select defaultValue="normal">
									<SelectTrigger className="bg-slate-800 border-slate-700 text-white">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-slate-900 border-slate-800">
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="multiply">Multiply</SelectItem>
										<SelectItem value="screen">Screen</SelectItem>
										<SelectItem value="overlay">Overlay</SelectItem>
										<SelectItem value="darken">Darken</SelectItem>
										<SelectItem value="lighten">Lighten</SelectItem>
									</SelectContent>
								</Select>,
							)}
						</TabsContent>

						<TabsContent value="effects" className="p-4 mt-0">
							<div className="space-y-4">
								<div className="p-3 bg-slate-800/50 rounded-lg">
									<div className="flex items-center justify-between mb-2">
										<Label className="text-sm text-white">Drop Shadow</Label>
										<Switch />
									</div>
									<div className="space-y-2 mt-3">
										<Input
											type="number"
											placeholder="X Offset"
											className="bg-slate-800 border-slate-700 text-white"
										/>
										<Input
											type="number"
											placeholder="Y Offset"
											className="bg-slate-800 border-slate-700 text-white"
										/>
										<Input
											type="number"
											placeholder="Blur"
											className="bg-slate-800 border-slate-700 text-white"
										/>
									</div>
								</div>

								<div className="p-3 bg-slate-800/50 rounded-lg">
									<div className="flex items-center justify-between mb-2">
										<Label className="text-sm text-white">Glow</Label>
										<Switch />
									</div>
								</div>

								<div className="p-3 bg-slate-800/50 rounded-lg">
									<div className="flex items-center justify-between mb-2">
										<Label className="text-sm text-white">Outline</Label>
										<Switch />
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="animation" className="p-4 mt-0">
							<div className="space-y-4">
								<Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
									<Sparkles className="h-4 w-4 mr-2" />
									Add Animation
								</Button>
								<p className="text-xs text-slate-500 text-center">
									No animations applied to this element
								</p>
							</div>
						</TabsContent>
					</ScrollArea>
				</Tabs>
			)}

			{/* Footer Actions */}
			{trackItem && (
				<div className="p-4 border-t border-slate-800">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="flex-1 border-slate-700 text-slate-300"
						>
							<Copy className="h-3 w-3 mr-1" />
							Duplicate
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1 border-red-900 text-red-400 hover:bg-red-900/20"
						>
							<Trash2 className="h-3 w-3 mr-1" />
							Delete
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
