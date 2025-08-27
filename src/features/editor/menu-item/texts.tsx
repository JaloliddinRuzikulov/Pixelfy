import { Button } from "@/components/ui/button";
import { ADD_TEXT } from "@designcombo/state";
import { dispatch } from "@designcombo/events";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import Draggable from "@/components/shared/draggable";
import { TEXT_ADD_PAYLOAD } from "../constants/payload";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
	Type,
	Heading,
	AlignLeft,
	AlignCenter,
	Bold,
	Italic,
	Plus,
} from "lucide-react";
import { toast } from "sonner";

// Text preset templates
const TEXT_PRESETS = [
	{
		id: "title",
		name: "Main Title",
		icon: Heading,
		style: {
			fontSize: 72,
			fontWeight: "bold",
			textAlign: "center" as const,
		},
		preview: "Main Title",
	},
	{
		id: "subtitle",
		name: "Subtitle",
		icon: Type,
		style: {
			fontSize: 48,
			fontWeight: "600",
			textAlign: "center" as const,
		},
		preview: "Subtitle",
	},
	{
		id: "body",
		name: "Body Text",
		icon: AlignLeft,
		style: {
			fontSize: 24,
			fontWeight: "400",
			textAlign: "left" as const,
		},
		preview: "Body text",
	},
	{
		id: "caption",
		name: "Caption",
		icon: AlignCenter,
		style: {
			fontSize: 18,
			fontWeight: "400",
			textAlign: "center" as const,
			fontStyle: "italic",
		},
		preview: "Caption text",
	},
	{
		id: "bold",
		name: "Bold Text",
		icon: Bold,
		style: {
			fontSize: 36,
			fontWeight: "900",
			textAlign: "left" as const,
		},
		preview: "Bold text",
	},
	{
		id: "italic",
		name: "Italic Text",
		icon: Italic,
		style: {
			fontSize: 32,
			fontWeight: "400",
			fontStyle: "italic",
			textAlign: "left" as const,
		},
		preview: "Italic text",
	},
];

export const Texts = () => {
	const isDraggingOverTimeline = useIsDraggingOverTimeline();

	const handleAddText = (preset = TEXT_PRESETS[0]) => {
		const payload = {
			...TEXT_ADD_PAYLOAD,
			id: nanoid(),
			details: {
				...TEXT_ADD_PAYLOAD.details,
				text: preset.preview,
				fontSize: preset.style.fontSize,
				fontWeight: preset.style.fontWeight,
				textAlign: preset.style.textAlign,
				fontStyle: preset.style.fontStyle || "normal",
			},
		};

		dispatch(ADD_TEXT, {
			payload,
			options: {},
		});

		toast.success(`${preset.name} added to timeline!`);
	};

	const handleQuickAdd = () => {
		handleAddText(TEXT_PRESETS[0]); // Default to main title
	};

	return (
		<div className="flex h-full flex-col bg-background">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border bg-muted/20">
				<Type className="w-4 h-4 mr-2 text-primary" />
				Text Elements
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-6">
					{/* Quick Add Button */}
					<div className="space-y-3">
						<Draggable
							data={TEXT_ADD_PAYLOAD}
							renderCustomPreview={
								<Button variant="secondary" className="w-full">
									<Plus className="w-4 h-4 mr-2" />
									Add Text
								</Button>
							}
							shouldDisplayPreview={!isDraggingOverTimeline}
						>
							<Button onClick={handleQuickAdd} className="w-full" size="lg">
								<Plus className="w-4 h-4 mr-2" />
								Add Text to Timeline
							</Button>
						</Draggable>
					</div>

					{/* Text Presets */}
					<div className="space-y-3">
						<div className="text-sm font-medium text-muted-foreground">
							Text Styles
						</div>
						<div className="grid grid-cols-1 gap-2">
							{TEXT_PRESETS.map((preset) => {
								const IconComponent = preset.icon;

								return (
									<Draggable
										key={preset.id}
										data={{
											...TEXT_ADD_PAYLOAD,
											details: {
												...TEXT_ADD_PAYLOAD.details,
												text: preset.preview,
												fontSize: preset.style.fontSize,
												fontWeight: preset.style.fontWeight,
												textAlign: preset.style.textAlign,
												fontStyle: preset.style.fontStyle || "normal",
											},
										}}
										renderCustomPreview={
											<Card className="w-60 cursor-move">
												<CardContent className="p-3">
													<div className="flex items-center gap-3">
														<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
															<IconComponent className="w-4 h-4 text-primary" />
														</div>
														<div className="flex-1">
															<div className="font-medium text-sm">
																{preset.name}
															</div>
															<div
																className="text-xs text-muted-foreground truncate"
																style={{
																	fontSize: Math.min(
																		preset.style.fontSize / 4,
																		12,
																	),
																	fontWeight: preset.style.fontWeight,
																	fontStyle: preset.style.fontStyle || "normal",
																}}
															>
																{preset.preview}
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										}
										shouldDisplayPreview={!isDraggingOverTimeline}
									>
										<Card
											className={cn("cursor-pointer hover:bg-muted/50")}
											onClick={() => handleAddText(preset)}
										>
											<CardContent className="p-3">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
														<IconComponent className="w-4 h-4 text-primary" />
													</div>
													<div className="flex-1">
														<div className="font-medium text-sm">
															{preset.name}
														</div>
														<div
															className="text-xs text-muted-foreground truncate"
															style={{
																fontSize: Math.min(
																	preset.style.fontSize / 4,
																	12,
																),
																fontWeight: preset.style.fontWeight,
																fontStyle: preset.style.fontStyle || "normal",
															}}
														>
															{preset.preview}
														</div>
													</div>
													<Plus className="w-4 h-4 text-muted-foreground" />
												</div>
											</CardContent>
										</Card>
									</Draggable>
								);
							})}
						</div>
					</div>

					{/* Additional Text Options */}
					<div className="space-y-3">
						<div className="text-sm font-medium text-muted-foreground">
							Custom Text
						</div>
						<div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
							💡 <strong>Tip:</strong> After adding text to the timeline, select
							it to customize font, size, color, and position using the
							properties panel.
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
