import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Loader2,
	Sparkles,
	Download,
	FileText,
	Eye,
	Clock,
	Image,
	Users,
	Briefcase,
	Palette,
	Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";

interface PresentationData {
	title: string;
	description: string;
	slides: Array<{
		slide_number: number;
		title: string;
		content: string[];
		speaker_notes: string;
		visual_suggestions: string;
		slide_type: string;
	}>;
}

interface GenerationResult {
	success: boolean;
	content?: PresentationData;
	file_path?: string;
	download_url?: string;
	file_info?: {
		slide_count: number;
		file_size: number;
		filename: string;
	};
	metadata?: {
		original_prompt: string;
		slide_count: number;
		language: string;
		template_style: string;
	};
}

export function PresentAIMenuItem() {
	const t = useTranslations();
	const [prompt, setPrompt] = useState("");
	const [slideCount, setSlideCount] = useState("10");
	const [language, setLanguage] = useState("en");
	const [templateStyle, setTemplateStyle] = useState("modern");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedContent, setGeneratedContent] =
		useState<PresentationData | null>(null);
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
	const [timelineVariants, setTimelineVariants] = useState<any[]>([]);
	const [selectedVariant, setSelectedVariant] = useState<string>("minimal");

	const handleGenerate = useCallback(async () => {
		if (!prompt.trim()) {
			toast.error("Iltimos taqdimot mavzusini yoki tavsifini kiriting");
			return;
		}

		setIsGenerating(true);
		setGeneratedContent(null);
		setDownloadUrl(null);
		setTimelineVariants([]);

		try {
			const formData = new FormData();
			formData.append("prompt", prompt);
			formData.append("slide_count", slideCount);
			formData.append("language", language);
			formData.append("template_style", templateStyle);

			console.log("🚀 Generating timeline images...");

			// Call our new timeline API that handles everything
			const response = await fetch("/api/presentai/generate-timeline", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Request failed: ${response.status}`);
			}

			const result = await response.json();
			console.log("✅ Timeline generation result:", result);

			if (result.success) {
				// Convert slide images to timeline variants format for compatibility
				const mockContent = {
					title: result.metadata?.ai_content?.title || "AI Generated Presentation",
					description: result.metadata?.ai_content?.description || "Generated with AI",
					slides: result.metadata?.ai_content?.slides || []
				};
				setGeneratedContent(mockContent);

				// Create a timeline variant from the slide images
				const timelineVariant = {
					id: "powerpoint-slides",
					name: language === "uz" ? "PowerPoint Slaydlari" : "PowerPoint Slides",
					description: language === "uz"
						? `${result.total_slides} ta slayd, PNG formatida`
						: `${result.total_slides} slides in PNG format`,
					totalDuration: result.total_slides * 4000, // 4 seconds per slide
					style: "powerpoint",
					slide_images: result.slide_images || []
				};
				setTimelineVariants([timelineVariant]);

				toast.success(
					`PowerPoint taqdimot yaratildi! ${result.total_slides} ta slayd PNG formatida tayyor.`,
				);
			} else {
				throw new Error(result.error || "Timeline generation failed");
			}
		} catch (error) {
			console.error("Timeline generation error:", error);
			toast.error("Taqdimot yaratilmadi. Iltimos qaytadan urinib ko'ring: " + (error instanceof Error ? error.message : "Unknown error"));
		} finally {
			setIsGenerating(false);
		}
	}, [prompt, slideCount, language, templateStyle]);

	const handleImportToTimeline = useCallback(
		(variantId?: string) => {
			const variant = variantId
				? timelineVariants.find((v) => v.id === variantId)
				: timelineVariants.find((v) => v.id === selectedVariant) || timelineVariants[0];

			if (!variant || !variant.slide_images) {
				toast.error("PNG slaydlari topilmadi");
				return;
			}

			// Import PNG slides to video editor using event-driven approach
			try {
				const trackItems: any[] = [];
				let currentTime = 0;

				// Process each PNG slide
				variant.slide_images.forEach((slideImage: any, index: number) => {
					// Use image_url (public URL) for Remotion compatibility
					// Fallback to base64 data URL if image_url not available
					const imageSrc = slideImage.image_url
						? slideImage.image_url
						: `data:image/png;base64,${slideImage.image_data}`;

					// Create image item for timeline
					const imageItem = {
						id: generateId(),
						type: "image" as const,
						display: {
							from: currentTime,
							to: currentTime + slideImage.duration,
						},
						trim: {
							from: 0,
							to: slideImage.duration,
						},
						duration: slideImage.duration,
						details: {
							src: imageSrc,
							x: 0,
							y: 0,
							width: 100,
							height: 100,
							opacity: 1,
							fit: "contain" // Ensure proper aspect ratio
						},
						metadata: {
							name: `Slayd ${slideImage.slide_number}`,
							source: "presentai-powerpoint",
							filename: slideImage.filename,
							size_bytes: slideImage.size_bytes
						}
					};

					trackItems.push(imageItem);
					currentTime += slideImage.duration;
				});

				if (trackItems.length > 0) {
					console.log("Dispatching ADD_ITEMS with PowerPoint slides:", trackItems);
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: trackItems,
						},
					});

					const totalDuration = Math.ceil(currentTime / 1000);
					toast.success(
						`PowerPoint slaydlari timeline'ga qo'shildi! ${trackItems.length} ta slayd, ${totalDuration} soniya davomiylik.`,
					);
				} else {
					toast.warning("Slaydlar topilmadi");
				}
			} catch (error) {
				console.error("Timeline import error:", error);
				toast.error("Timeline'ga qo'shishda xatolik yuz berdi: " + (error instanceof Error ? error.message : "Unknown error"));
			}
		},
		[timelineVariants, selectedVariant],
	);

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center gap-2 p-4 pb-2 border-b bg-background/50">
				<Sparkles className="w-5 h-5 text-primary" />
				<h2 className="text-lg font-semibold">AI Taqdimot Generatori</h2>
			</div>
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div className="flex flex-col gap-3 p-2 sm:p-4">
						{/* Generation Form */}
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Taqdimot Yaratish</CardTitle>
								<CardDescription className="text-xs">
									Taqdimot mavzusini tasvirlab bering va AI sizga slaydlar
									yaratib bersin
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 p-2 sm:p-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									<div className="space-y-2">
										<Label htmlFor="slideCount" className="text-xs font-medium">
											Slaydlar
										</Label>
										<Input
											id="slideCount"
											type="number"
											min="3"
											max="30"
											value={slideCount}
											onChange={(e) => setSlideCount(e.target.value)}
											className="text-sm"
											disabled={isGenerating}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="language" className="text-xs font-medium">
											Til
										</Label>
										<Select
											value={language}
											onValueChange={setLanguage}
											disabled={isGenerating}
										>
											<SelectTrigger className="text-sm">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="en">Inglizcha</SelectItem>
												<SelectItem value="uz">O'zbekcha</SelectItem>
												<SelectItem value="ru">Ruscha</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="template" className="text-xs font-medium">
										Shablon
									</Label>
									<Select
										value={templateStyle}
										onValueChange={setTemplateStyle}
										disabled={isGenerating}
									>
										<SelectTrigger className="text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="modern">Zamonaviy</SelectItem>
											<SelectItem value="minimal">Minimal</SelectItem>
											<SelectItem value="business">Biznes</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Prompt Input - moved to bottom for better UX */}
								<div className="space-y-2">
									<Label htmlFor="prompt" className="text-sm font-medium">
										Taqdimot Mavzusi
									</Label>
									<Textarea
										id="prompt"
										placeholder="Masalan: 'Qayta tiklanadigan energiya texnologiyalari, ularning afzalliklari va kelajak istiqbollari haqida taqdimot yarating'"
										value={prompt}
										onChange={(e) => setPrompt(e.target.value)}
										className="min-h-24 text-sm resize-none"
										disabled={isGenerating}
										rows={4}
									/>
								</div>

								<Button
									onClick={handleGenerate}
									disabled={isGenerating || !prompt.trim()}
									className="w-full"
									size="sm"
								>
									{isGenerating ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Yaratilmoqda...
										</>
									) : (
										<>
											<Sparkles className="w-4 h-4 mr-2" />
											PowerPoint Slaydlar Yaratish
										</>
									)}
								</Button>
							</CardContent>
						</Card>

						{/* Generated Content */}
						{generatedContent && (
							<Card>
								<CardHeader>
									<CardTitle className="text-sm flex items-center gap-2">
										<FileText className="w-4 h-4" />
										{generatedContent.title}
									</CardTitle>
									<CardDescription className="text-xs">
										{generatedContent.description}
									</CardDescription>
									<div className="flex items-center gap-2 mt-2">
										<Badge variant="secondary" className="text-xs">
											{generatedContent.slides.length} slayd
										</Badge>
										<Badge variant="outline" className="text-xs">
											<Clock className="w-3 h-3 mr-1" />
											{Math.ceil((generatedContent.slides.length * 4) / 60)}{" "}
											daqiqa
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-3 p-2 sm:p-4">
									{/* Slide Preview with ScrollArea */}
									<div className="space-y-2">
										<Label className="text-xs font-medium">
											Slaydlar Ko'rinishi
										</Label>
										<div className="h-32 w-full border rounded-md">
											<ScrollArea className="h-full w-full p-2">
												<div className="space-y-2 pr-2">
													{generatedContent.slides.map((slide) => (
														<div
															key={slide.slide_number}
															className="border rounded-md p-2 text-xs hover:bg-accent/50 transition-colors"
														>
															<div className="flex items-start gap-2">
																<Badge
																	variant="outline"
																	className="text-xs shrink-0"
																>
																	{slide.slide_number}
																</Badge>
																<div className="flex-1 min-w-0">
																	<div className="font-medium text-foreground truncate">
																		{slide.title}
																	</div>
																	<div className="text-muted-foreground mt-1 line-clamp-2">
																		{slide.content.slice(0, 2).join(" • ")}
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											</ScrollArea>
										</div>
									</div>

									{/* Timeline Variant Selection */}
									{timelineVariants.length > 0 && (
										<div className="space-y-3">
											<Label className="text-xs font-medium">
												Timeline Variantlari
											</Label>
											<div className="h-24 w-full border rounded-md">
												<ScrollArea className="h-full w-full p-2">
													<div className="space-y-2 pr-2">
														{timelineVariants.map((variant) => (
															<div
																key={variant.id}
																className={`border rounded-md p-2 cursor-pointer transition-colors hover:bg-accent/50 ${
																	selectedVariant === variant.id
																		? "bg-primary/10 border-primary"
																		: ""
																}`}
																onClick={() => setSelectedVariant(variant.id)}
															>
																<div className="flex items-center justify-between">
																	<div className="flex-1">
																		<div className="text-xs font-medium">
																			{variant.name}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{variant.description}
																		</div>
																	</div>
																	<div className="flex items-center gap-1 text-xs text-muted-foreground">
																		<Clock className="w-3 h-3" />
																		{Math.ceil(variant.totalDuration / 60)}m
																	</div>
																</div>
															</div>
														))}
													</div>
												</ScrollArea>
											</div>
										</div>
									)}

									{/* Timeline Integration Buttons */}
									<div className="space-y-2">
										<Label className="text-xs font-medium">
											Timeline'ga Qo'shish
										</Label>
										<div className="grid grid-cols-1 gap-2">
											<Button
												onClick={() => handleImportToTimeline()}
												size="sm"
												variant="default"
												className="w-full flex items-center gap-2"
												disabled={timelineVariants.length === 0}
											>
												<Plus className="w-3 h-3" />
												{timelineVariants.length > 0
													? `"${timelineVariants.find((v) => v.id === selectedVariant)?.name || "Tanlangan"}" Variant Qo'shish`
													: "Timeline Variantlari Yaratilmoqda..."}
											</Button>
										</div>
									</div>

									{/* Export Options */}
									{downloadUrl && (
										<div className="space-y-2">
											<Label className="text-xs font-medium">
												Eksport Qilish
											</Label>
											<Button
												asChild
												size="sm"
												variant="outline"
												className="w-full flex items-center gap-2"
											>
												<a
													href={downloadUrl}
													download
													className="flex items-center gap-2"
												>
													<Download className="w-3 h-3" />
													PowerPoint Yuklab Olish
												</a>
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
