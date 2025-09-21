import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Loader2, FileText, AlertCircle, Images } from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { toast } from "sonner";

interface PresentationFile {
	id: string;
	name: string;
	status: "uploading" | "converting" | "ready" | "error";
	progress?: number;
	pageImages?: string[];
	error?: string;
	uploadedAt: Date;
}

export const Presentations = () => {
	const [presentations, setPresentations] = useState<PresentationFile[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];

		// Check file type
		const allowedTypes = [
			"application/pdf",
			"application/vnd.ms-powerpoint",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		];

		const allowedExtensions = [".ppt", ".pptx", ".pdf"];
		const fileExt = file.name
			.toLowerCase()
			.substring(file.name.lastIndexOf("."));

		if (
			!allowedTypes.includes(file.type) &&
			!allowedExtensions.includes(fileExt)
		) {
			toast.error("Please upload a PDF, PPT, or PPTX file");
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

			const uploadResponse = await fetch("/api/presentations/upload", {
				method: "POST",
				body: formData,
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(errorData.error || "Failed to upload presentation");
			}

			const result = await uploadResponse.json();

			// Update status to converting
			setPresentations((prev) =>
				prev.map((p) =>
					p.id === presentationId
						? { ...p, status: "converting", progress: 30 }
						: p,
				),
			);

			// Poll for conversion status
			let conversionComplete = false;
			let attempts = 0;
			const maxAttempts = 60; // 5 minutes max

			while (!conversionComplete && attempts < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds

				const statusResponse = await fetch(
					`/api/presentations/upload?jobId=${result.jobId}`,
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
										pageImages: statusData.pageImages,
									}
								: p,
						),
					);

					toast.success(
						`Presentation converted! ${statusData.pageImages?.length || 0} slides ready`,
					);
				} else if (statusData.status === "failed") {
					throw new Error(statusData.error || "Conversion failed");
				} else {
					// Update progress
					const progress = Math.min(30 + (attempts / maxAttempts) * 60, 95);
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

			const errorMessage =
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
		if (!presentation.pageImages || presentation.pageImages.length === 0) {
			toast.error("No images available to add");
			return;
		}

		// Add each image to timeline with 3 seconds duration
		const imageDuration = 3000; // 3 seconds per image
		let currentTime = 0;

		presentation.pageImages.forEach((imageUrl, index) => {
			const id = generateId();

			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [
						{
							id,
							type: "image",
							display: {
								from: currentTime,
								to: currentTime + imageDuration,
							},
							details: {
								src: imageUrl,
							},
							metadata: {},
						},
					],
				},
			});

			currentTime += imageDuration;
		});

		toast.success(`${presentation.pageImages.length} slides added to timeline`);
	};

	const handleRetry = (presentation: PresentationFile) => {
		// Remove the failed presentation and trigger file input
		setPresentations((prev) => prev.filter((p) => p.id !== presentation.id));
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
						accept=".pdf,.pptx,.ppt"
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
						<p>✓ PDF, PPT & PPTX files (max 50MB)</p>
						<p>✓ Converted to HD images for timeline</p>
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
								Upload PDF or PowerPoint files to convert to timeline images
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
															Slides
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
