import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Loader2, FileText, AlertCircle, Images } from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { dispatch } from "@designcombo/events";
import { toast } from "sonner";

interface PresentationFile {
	id: string;
	name: string;
	status: "uploading" | "converting" | "ready" | "error";
	progress?: number;
	videoUrl?: string;
	pageImages?: string[];
	error?: string;
	uploadedAt: Date;
	conversionType?: "video" | "images";
}

export const Presentations = () => {
	const [presentations, setPresentations] = useState<PresentationFile[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const conversionType = "images";
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];

		// Check file type - only allow PowerPoint files
		const allowedTypes = [
			"application/vnd.ms-powerpoint",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		];

		if (!allowedTypes.includes(file.type)) {
			toast.error("Please upload a PowerPoint file (.ppt or .pptx)");
			return;
		}

		// Check file size (max 50MB)
		if (file.size > 50 * 1024 * 1024) {
			toast.error("File size must be less than 50MB");
			return;
		}

		const presentationId = generateId();
		const newPresentation: PresentationFile = {
			id: presentationId,
			name: file.name,
			status: "uploading",
			progress: 0,
			uploadedAt: new Date(),
		};

		setPresentations((prev) => [...prev, newPresentation]);
		setIsProcessing(true);

		try {
			// Upload file
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "presentation");
			formData.append("conversionType", conversionType);

			const uploadResponse = await fetch("/api/presentation-to-video", {
				method: "POST",
				body: formData,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload presentation");
			}

			// Update status to converting
			setPresentations((prev) =>
				prev.map((p) =>
					p.id === presentationId
						? { ...p, status: "converting", progress: 50 }
						: p,
				),
			);

			const result = await uploadResponse.json();

			// Poll for conversion status
			let conversionComplete = false;
			let attempts = 0;
			const maxAttempts = 60; // 5 minutes max

			while (!conversionComplete && attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds

				const statusResponse = await fetch(
					`/api/presentation-to-video?jobId=${result.jobId}`,
				);
				const statusData = await statusResponse.json();

				if (statusData.status === "completed") {
					conversionComplete = true;

					setPresentations((prev) =>
						prev.map((p) =>
							p.id === presentationId
								? {
										...p,
										status: "ready",
										progress: 100,
										videoUrl: statusData.videoUrl,
										pageImages: statusData.pageImages,
										conversionType,
									}
								: p,
						),
					);

					toast.success("Presentation converted to images successfully!");
				} else if (statusData.status === "failed") {
					throw new Error(statusData.error || "Conversion failed");
				} else {
					// Update progress
					const progress = 50 + (attempts / maxAttempts) * 50;
					setPresentations((prev) =>
						prev.map((p) => (p.id === presentationId ? { ...p, progress } : p)),
					);
				}

				attempts++;
			}

			if (!conversionComplete) {
				throw new Error("Conversion timeout");
			}
		} catch (error) {
			console.error("Presentation processing error:", error);

			let errorMessage =
				error instanceof Error ? error.message : "Unknown error";

			setPresentations((prev) =>
				prev.map((p) =>
					p.id === presentationId
						? {
								...p,
								status: "error",
								error: errorMessage,
							}
						: p,
				),
			);

			toast.error(`Failed to process presentation: ${errorMessage}`);
		} finally {
			setIsProcessing(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleAddImagesToTimeline = (presentation: PresentationFile) => {
		if (!presentation.pageImages || presentation.pageImages.length === 0)
			return;

		// Add each page as an image to timeline
		presentation.pageImages.forEach((imageUrl, index) => {
			dispatch("ADD_ITEMS", {
				payload: {
					trackItems: [
						{
							id: generateId(),
							type: "image",
							display: {
								from: index * 3000, // Each image shows for 3 seconds
								to: (index + 1) * 3000,
							},
							details: {
								src: imageUrl,
							},
							metadata: {
								originalName: `${presentation.name} - Page ${index + 1}`,
							},
						},
					],
				},
				options: {},
			});
		});

		toast.success(`${presentation.pageImages.length} pages added to timeline`);
	};

	const handleRetry = async (presentation: PresentationFile) => {
		// Re-upload the presentation
		toast.info("Please select the file again to retry");
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border/20">
				Presentations
			</div>

			<div className="p-4 space-y-4">
				{/* Upload Button */}
				<div className="space-y-2">
					<input
						ref={fileInputRef}
						type="file"
						accept=".pptx,.ppt"
						onChange={handleFileSelect}
						className="hidden"
						disabled={isProcessing}
					/>
					<Button
						className="w-full h-12 border-2 border-dashed border-border/50 bg-transparent hover:bg-muted/50 hover:border-primary/30"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isProcessing}
					>
						<Upload className="w-5 h-5 mr-2" />
						Upload Presentation
					</Button>
					<div className="text-xs text-muted-foreground">
						<p>✓ PowerPoint files only (.ppt, .pptx - max 50MB)</p>
					</div>
				</div>
			</div>

			{/* Presentations List */}
			<ScrollArea className="flex-1">
				<div className="p-4 pt-0 space-y-3">
					{presentations.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
								<FileText className="w-8 h-8 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								No presentations uploaded
							</p>
							<p className="text-xs text-muted-foreground/70">
								Upload a PDF or PowerPoint to convert for your video
							</p>
						</div>
					) : (
						presentations.map((presentation) => (
							<Card key={presentation.id} className="hover:bg-muted/30">
								<div className="p-4">
									<div className="flex items-center gap-3">
										{/* Icon */}
										<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
											<FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate mb-1">
												{presentation.name}
											</p>

											{/* Status */}
											{presentation.status === "uploading" && (
												<div className="flex items-center gap-2">
													<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
													<span className="text-xs text-muted-foreground">
														Uploading {Math.round(presentation.progress || 0)}%
													</span>
												</div>
											)}

											{presentation.status === "converting" && (
												<div className="flex items-center gap-2">
													<Loader2 className="w-3 h-3 animate-spin text-blue-500" />
													<span className="text-xs text-muted-foreground">
														Converting {Math.round(presentation.progress || 0)}%
													</span>
												</div>
											)}

											{presentation.status === "ready" && (
												<div className="space-y-2">
													<div className="flex items-center gap-1">
														<div className="w-2 h-2 bg-green-500 rounded-full" />
														<span className="text-xs text-green-600 dark:text-green-400 font-medium">
															Ready • {presentation.pageImages?.length || 0}{" "}
															Images
														</span>
													</div>

													{presentation.pageImages && (
														<Button
															size="sm"
															className="h-7"
															onClick={() =>
																handleAddImagesToTimeline(presentation)
															}
														>
															<Images className="w-3 h-3 mr-1" />
															Add {presentation.pageImages.length} Slides
														</Button>
													)}
												</div>
											)}

											{presentation.status === "error" && (
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<AlertCircle className="w-3 h-3 text-destructive" />
														<span className="text-xs text-destructive">
															{presentation.error}
														</span>
													</div>
													<Button
														size="sm"
														variant="outline"
														className="h-7"
														onClick={() => handleRetry(presentation)}
													>
														Retry
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
							</Card>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
};
