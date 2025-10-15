import { ADD_ITEMS } from "@designcombo/state";
import { dispatch } from "@designcombo/events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
	Music,
	Image as ImageIcon,
	Video as VideoIcon,
	Loader2,
	UploadIcon,
	Search,
	FileIcon,
	Clock,
	X,
	Plus,
	Play,
	Download,
	Trash2,
	Info,
	Film,
	FileAudio,
	FileImage,
} from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import useUploadStore from "../store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { useTranslations } from "next-intl";
import { usePexelsImages } from "@/hooks/use-pexels-images";
import { usePexelsVideos } from "@/hooks/use-pexels-videos";
// import { ImageLoading } from "@/components/ui/image-loading"; // Not needed anymore
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Helper functions
const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatDuration = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getFileExtension = (filename: string) => {
	return filename.split(".").pop()?.toUpperCase() || "";
};

export const Uploads = () => {
	const t = useTranslations("media");
	const { setShowUploadModal, uploads, pendingUploads, activeUploads } =
		useUploadStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [videoSearchQuery, setVideoSearchQuery] = useState("");
	const [serviceStatus, setServiceStatus] = useState<
		"checking" | "online" | "offline"
	>("checking");

	useEffect(() => {
		const checkServiceHealth = async () => {
			try {
				const response = await fetch("/api/health/storage");
				if (!response.ok) {
					setServiceStatus("offline");
				} else {
					setServiceStatus("online");
				}
			} catch (error) {
				setServiceStatus("offline");
			}
		};
		checkServiceHealth();
	}, []);
	const [selectedFile, setSelectedFile] = useState<any>(null);

	const {
		images: pexelsImages,
		loading: pexelsLoading,
		error: pexelsError,
		searchImages,
		loadCuratedImages: loadPopularImages,
		clearImages,
	} = usePexelsImages();

	const {
		videos: pexelsVideos,
		loading: pexelsVideosLoading,
		error: pexelsVideosError,
		searchVideos,
		loadPopularVideos,
		clearVideos,
	} = usePexelsVideos();

	// Load popular images and videos on component mount
	useEffect(() => {
		if (loadPopularImages) {
			loadPopularImages();
		}
		if (loadPopularVideos) {
			loadPopularVideos();
		}
	}, [loadPopularImages, loadPopularVideos]);

	// Group completed uploads by type
	const videos = uploads.filter((upload) => {
		console.log(`[UI] Checking video filter for:`, {
			type: upload.type,
			contentType: upload.contentType,
		});
		return upload.type === "video" || upload.contentType?.startsWith("video/");
	});
	const images = uploads.filter((upload) => {
		console.log(`[UI] Checking image filter for:`, {
			type: upload.type,
			contentType: upload.contentType,
		});
		return upload.type === "image" || upload.contentType?.startsWith("image/");
	});
	const audios = uploads.filter((upload) => {
		console.log(`[UI] Checking audio filter for:`, {
			type: upload.type,
			contentType: upload.contentType,
		});
		return upload.type === "audio" || upload.contentType?.startsWith("audio/");
	});

	// Add video to timeline with proper format
	const handleAddVideo = useCallback(async (video: any) => {
		try {
			const srcVideo = video.metadata?.uploadedUrl || video.url;
			const duration = video.metadata?.duration || 10000; // Default 10 seconds

			// Validate required data
			if (!srcVideo) {
				console.error("No video source found:", video);
				showSuccessMessage("Video fayli topilmadi!");
				return;
			}

			// Get thumbnail URL - prioritize client-side generated thumbnail, then storage service thumbnail, then video itself
			const thumbnailUrl =
				video.metadata?.thumbnailUrl ||
				(video.metadata?.thumbnail
					? `/storage/${video.metadata.thumbnail}`
					: srcVideo);

			console.log("[VIDEO THUMBNAIL DEBUG]", {
				originalVideo: video,
				thumbnailUrl: video.metadata?.thumbnailUrl,
				thumbnailPath: video.metadata?.thumbnail,
				finalThumbnailUrl: thumbnailUrl,
				srcVideo,
			});

			const videoItem = {
				id: generateId(),
				type: "video" as const,
				name: video.file?.name || "Video",
				display: {
					from: 0,
					to: duration,
				},
				trim: {
					from: 0,
					to: duration,
				},
				duration: duration,
				details: {
					src: srcVideo,
				},
				metadata: {
					previewUrl: thumbnailUrl,
					originalDuration: duration / 1000,
					volume: 1,
				},
				aspectRatio: video.metadata?.aspectRatio || 16 / 9,
			};

			console.log("Adding video to timeline:", videoItem);

			await new Promise<void>((resolve, reject) => {
				try {
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: [videoItem],
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			// Show success notification
			showSuccessMessage("Video timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Video qo'shishda xato:", error);
			showSuccessMessage("Video qo'shishda xato yuz berdi!");
		}
	}, []);

	// Add image to timeline
	const handleAddImage = useCallback(async (image: any) => {
		try {
			const srcImage = image.metadata?.uploadedUrl || image.url;

			// Validate required data
			if (!srcImage) {
				console.error("No image source found:", image);
				showSuccessMessage("Rasm fayli topilmadi!");
				return;
			}

			const imageItem = {
				id: generateId(),
				type: "image" as const,
				name: image.file?.name || "Image",
				display: {
					from: 0,
					to: 5000,
				},
				trim: {
					from: 0,
					to: 5000,
				},
				duration: 5000,
				details: {
					src: srcImage,
				},
				metadata: {},
			};

			await new Promise<void>((resolve, reject) => {
				try {
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: [imageItem],
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			showSuccessMessage("Rasm timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Rasm qo'shishda xato:", error);
			showSuccessMessage("Rasm qo'shishda xato yuz berdi!");
		}
	}, []);

	// Add audio to timeline
	const handleAddAudio = useCallback(async (audio: any) => {
		try {
			const srcAudio = audio.metadata?.uploadedUrl || audio.url;
			const duration = audio.metadata?.duration || 10000;

			// Validate required data
			if (!srcAudio) {
				console.error("No audio source found:", audio);
				showSuccessMessage("Audio fayli topilmadi!");
				return;
			}

			const audioItem = {
				id: generateId(),
				type: "audio" as const,
				name: audio.file?.name || "Audio",
				display: {
					from: 0,
					to: duration,
				},
				trim: {
					from: 0,
					to: duration,
				},
				duration: duration,
				details: {
					src: srcAudio,
				},
				metadata: {
					author: "User Upload",
					originalDuration: duration / 1000,
					volume: 1,
				},
			};

			await new Promise<void>((resolve, reject) => {
				try {
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: [audioItem],
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			showSuccessMessage("Audio timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Audio qo'shishda xato:", error);
			showSuccessMessage("Audio qo'shishda xato yuz berdi!");
		}
	}, []);

	// Add stock image to timeline (supports both stock and local images)
	const handleAddStockImage = useCallback(async (image: any) => {
		try {
			// Handle different image formats
			let imageSrc: string;
			let imageName: string;
			let photographer: string;

			if (image.details?.src) {
				// Local media format
				imageSrc = image.details.src;
				imageName = image.details.alt || "Local Image";
				photographer = image.details.photographer || "Local Asset";
			} else if (image.src?.large) {
				// Pexels format
				imageSrc = image.src.large;
				imageName = image.alt || "Stock Image";
				photographer = image.photographer || "Pexels";
			} else {
				console.error("Unsupported image format:", image);
				showSuccessMessage("Rasm formatini qo'llab-quvvatlanmaydi!");
				return;
			}

			const imageItem = {
				id: generateId(),
				type: "image" as const,
				name: imageName,
				display: {
					from: 0,
					to: 5000,
				},
				trim: {
					from: 0,
					to: 5000,
				},
				duration: 5000,
				details: {
					src: imageSrc,
				},
				metadata: {
					photographer: photographer,
					url: image.url,
				},
			};

			console.log("Adding image to timeline:", imageItem);

			await new Promise<void>((resolve, reject) => {
				try {
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: [imageItem],
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			showSuccessMessage("Rasm timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Stock rasm qo'shishda xato:", error);
			showSuccessMessage("Rasm qo'shishda xato yuz berdi!");
		}
	}, []);

	// Add stock video to timeline with proper format (supports both stock and local videos)
	const handleAddStockVideo = useCallback(async (video: any) => {
		try {
			let srcVideo: string;
			let duration: number;
			let previewUrl: string;
			let videoName: string;
			let authorName: string;

			if (video.details?.src) {
				// Local media format
				srcVideo = video.details.src;
				duration = (video.details.duration || 10) * 1000; // Convert to milliseconds
				previewUrl = video.preview || srcVideo;
				videoName = `Local Video - ${video.metadata?.photographer || "Local Asset"}`;
				authorName = video.metadata?.photographer || "Local Asset";
			} else if (video.video_files) {
				// Pexels format
				const videoFile =
					video.video_files.find(
						(file: any) => file.quality === "hd" || file.quality === "sd",
					) || video.video_files[0];

				if (!videoFile || !videoFile.link) {
					console.error("No valid video file found:", video);
					showSuccessMessage("Video fayl topilmadi!");
					return;
				}

				srcVideo = videoFile.link;
				duration = (video.duration || 10) * 1000; // Convert to milliseconds

				// Get preview image
				previewUrl = video.image;
				if (
					!previewUrl &&
					video.video_pictures &&
					video.video_pictures.length > 0
				) {
					previewUrl = video.video_pictures[0].picture;
				}
				if (!previewUrl) {
					previewUrl = srcVideo; // Fallback to video URL
				}

				videoName = `Stock Video - ${video.user?.name || "Pexels"}`;
				authorName = video.user?.name || "Pexels";
			} else {
				console.error("Unsupported video format:", video);
				showSuccessMessage("Video formatini qo'llab-quvvatlanmaydi!");
				return;
			}

			const videoItem = {
				id: generateId(),
				type: "video" as const,
				name: videoName,
				display: {
					from: 0,
					to: duration,
				},
				trim: {
					from: 0,
					to: duration,
				},
				duration: duration,
				details: {
					src: srcVideo,
				},
				metadata: {
					previewUrl: previewUrl,
					originalDuration: duration / 1000,
					volume: 1,
					author: authorName,
					url: video.url,
				},
				aspectRatio:
					video.details?.width && video.details?.height
						? video.details.width / video.details.height
						: video.width && video.height
							? video.width / video.height
							: 16 / 9,
			};

			console.log("Adding video to timeline:", videoItem);

			await new Promise<void>((resolve, reject) => {
				try {
					dispatch(ADD_ITEMS, {
						payload: {
							trackItems: [videoItem],
						},
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			showSuccessMessage("Video timeline'ga qo'shildi!");
		} catch (error) {
			console.error("Error adding stock video:", error);
			showSuccessMessage("Video qo'shishda xato yuz berdi!");
		}
	}, []);

	// Show success message
	const showSuccessMessage = (message: string) => {
		const successDiv = document.createElement("div");
		successDiv.className =
			"fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-none z-50  ";
		successDiv.textContent = message;
		document.body.appendChild(successDiv);
		setTimeout(() => successDiv.remove(), 3000);
	};

	// Search handlers
	const handleSearchImages = async () => {
		if (!searchQuery.trim()) {
			if (loadPopularImages) {
				loadPopularImages();
			}
			return;
		}
		if (searchImages) {
			searchImages(searchQuery);
		}
	};

	const handleSearchVideos = async () => {
		if (!videoSearchQuery.trim()) {
			if (loadPopularVideos) {
				loadPopularVideos();
			}
			return;
		}
		if (searchVideos) {
			searchVideos(videoSearchQuery);
		}
	};

	const hasUploads = uploads.length > 0;
	const hasActivity = pendingUploads.length > 0 || activeUploads.length > 0;
	const stockImages = pexelsImages || [];
	const stockVideos = pexelsVideos || [];

	// Debug logging
	console.log(`[UI] Uploads state:`, {
		totalUploads: uploads.length,
		uploadsData: uploads.map((u) => ({
			type: u.type,
			contentType: u.contentType,
			fileName: u.file?.name || u.fileName,
			url: u.url || u.metadata?.uploadedUrl,
		})),
		filteredVideos: videos.length,
		filteredImages: images.length,
		filteredAudios: audios.length,
		hasUploads,
		hasActivity,
	});

	return (
		<div className="flex flex-1 flex-col h-full overflow-hidden">
			<div className="flex h-12 flex-none items-center px-4 text-xs sm:text-sm font-medium border-b bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent">
				<FileIcon className="h-4 w-4 mr-2 text-blue-500" />
				Media va Fayllar
			</div>

			{serviceStatus === "offline" && (
				<div className="px-2 sm:px-4">
					<Alert className="mt-2 sm:mt-4 border-destructive bg-destructive/10">
						<XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
						<AlertDescription className="text-xs sm:text-sm text-destructive">
							<strong>Storage xizmati ishlamayapti!</strong>
							<br />
							Fayl yuklash xizmati hozirda mavjud emas.
						</AlertDescription>
					</Alert>
				</div>
			)}

			<ModalUpload />

			<Tabs
				defaultValue="uploads"
				className="flex-1 flex flex-col overflow-hidden"
			>
				<div className="flex-shrink-0 border-b px-4 py-2">
					<TabsList className="w-full h-auto rounded-none bg-transparent border-0 p-0 flex flex-wrap gap-2">
						<TabsTrigger
							value="uploads"
							className="text-xs flex-1 min-w-[90px]"
						>
							<UploadIcon className="h-3.5 w-3.5 mr-1.5" />
							Yuklangan
						</TabsTrigger>
						<TabsTrigger value="images" className="text-xs flex-1 min-w-[90px]">
							<FileImage className="h-3.5 w-3.5 mr-1.5" />
							Stock Rasmlar
						</TabsTrigger>
						<TabsTrigger value="videos" className="text-xs flex-1 min-w-[90px]">
							<Film className="h-3.5 w-3.5 mr-1.5" />
							Stock Videolar
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="uploads"
					className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
				>
					<ScrollArea className="flex-1 h-full">
						<div className="p-2 sm:p-4 space-y-3">
							{/* Upload Button */}
							<Button
								onClick={() => setShowUploadModal(true)}
								className="w-full h-12 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-xs sm:text-sm"
								variant="outline"
							>
								<UploadIcon className="w-4 h-4 mr-2" />
								Fayl yuklash
							</Button>

							{/* Upload Progress */}
							{hasActivity && (
								<Card className="bg-blue-500/5 border-blue-500/20">
									<CardContent className="p-4 space-y-3">
										<div className="flex items-center gap-2">
											<Loader2 className="w-4 h-4  text-blue-500" />
											<span className="text-xs sm:text-sm font-medium">
												Yuklanmoqda...
											</span>
										</div>

										{pendingUploads.map((upload) => (
											<div key={upload.id} className="space-y-1">
												<div className="flex items-center justify-between">
													<span className="text-xs truncate flex-1">
														{upload.file?.name || "Fayl"}
													</span>
													<Badge variant="secondary" className="text-xs">
														Kutilmoqda
													</Badge>
												</div>
												<Progress value={0} className="h-1" />
											</div>
										))}

										{activeUploads.map((upload) => (
											<div key={upload.id} className="space-y-1">
												<div className="flex items-center justify-between">
													<span className="text-xs truncate flex-1">
														{upload.file?.name || "Fayl"}
													</span>
													<span className="text-xs text-blue-500 font-medium">
														{upload.progress ?? 0}%
													</span>
												</div>
												<Progress
													value={upload.progress ?? 0}
													className="h-1"
												/>
											</div>
										))}
									</CardContent>
								</Card>
							)}

							{/* Uploaded Files */}
							{hasUploads ? (
								<div className="space-y-6">
									{/* Videos Section */}
									{videos.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<VideoIcon className="w-4 h-4 text-purple-500" />
													<span className="text-xs sm:text-sm font-medium">
														Videolar
													</span>
													<Badge variant="secondary" className="text-xs">
														{videos.length}
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
												{videos.map((video, idx) => (
													<Card
														key={video.id || idx}
														className="group overflow-hidden cursor-pointer hover:shadow-none  border-purple-500/10 hover:border-purple-500/30"
														onClick={() => handleAddVideo(video)}
													>
														<div className="aspect-video relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
															{video.metadata?.uploadedUrl || video.url ? (
																<video
																	src={video.metadata?.uploadedUrl || video.url}
																	className="object-cover w-full h-full"
																	muted
																	preload="metadata"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center">
																	<VideoIcon className="w-8 h-8 text-purple-500/50" />
																</div>
															)}

															{/* Overlay */}
															<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent  ">
																<div className="absolute bottom-2 left-2 right-2">
																	<p className="text-white text-xs font-medium truncate">
																		{video.file?.name?.replace(
																			/\.[^/.]+$/,
																			"",
																		) || "Video"}
																	</p>
																	<div className="flex items-center gap-2 mt-1">
																		<Badge className="text-[10px] px-1 py-0 h-4 bg-white/20 text-white border-0">
																			{getFileExtension(video.file?.name || "")}
																		</Badge>
																		{video.file?.size && (
																			<span className="text-[10px] text-white/80">
																				{formatFileSize(video.file.size)}
																			</span>
																		)}
																	</div>
																</div>

																{/* Play button */}
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center  ">
																		<Play className="w-5 h-5 text-purple-600 ml-1" />
																	</div>
																</div>
															</div>
														</div>
													</Card>
												))}
											</div>
										</div>
									)}

									{/* Images Section */}
									{images.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<ImageIcon className="w-4 h-4 text-blue-500" />
													<span className="text-xs sm:text-sm font-medium">
														Rasmlar
													</span>
													<Badge variant="secondary" className="text-xs">
														{images.length}
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
												{images.map((image, idx) => (
													<Card
														key={image.id || idx}
														className="group overflow-hidden cursor-pointer hover:shadow-none  border-blue-500/10 hover:border-blue-500/30"
														onClick={() => handleAddImage(image)}
													>
														<div className="aspect-square relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
															{image.metadata?.uploadedUrl || image.url ? (
																<img
																	src={image.metadata?.uploadedUrl || image.url}
																	alt={image.file?.name || "Image"}
																	className="object-cover w-full h-full  "
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center">
																	<ImageIcon className="w-8 h-8 text-blue-500/50" />
																</div>
															)}

															{/* Overlay */}
															<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent  ">
																<div className="absolute bottom-2 left-2 right-2">
																	<p className="text-white text-xs font-medium truncate">
																		{image.file?.name?.replace(
																			/\.[^/.]+$/,
																			"",
																		) || "Rasm"}
																	</p>
																	<Badge className="text-[10px] px-1 py-0 h-4 bg-white/20 text-white border-0 mt-1">
																		{getFileExtension(image.file?.name || "")}
																	</Badge>
																</div>

																{/* Add button */}
																<div className="absolute top-2 right-2">
																	<div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center  ">
																		<Plus className="w-4 h-4 text-blue-600" />
																	</div>
																</div>
															</div>
														</div>
													</Card>
												))}
											</div>
										</div>
									)}

									{/* Audio Section */}
									{audios.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Music className="w-4 h-4 text-green-500" />
													<span className="text-xs sm:text-sm font-medium">
														Audio fayllar
													</span>
													<Badge variant="secondary" className="text-xs">
														{audios.length}
													</Badge>
												</div>
											</div>

											<div className="space-y-2">
												{audios.map((audio, idx) => (
													<Card
														key={audio.id || idx}
														className="cursor-pointer hover:shadow-none  border-green-500/10 hover:border-green-500/30"
														onClick={() => handleAddAudio(audio)}
													>
														<CardContent className="p-3">
															<div className="flex items-center gap-3">
																<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
																	<FileAudio className="w-6 h-6 text-green-600" />
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center gap-2">
																		<p className="text-sm font-medium truncate">
																			{audio.file?.name?.replace(
																				/\.[^/.]+$/,
																				"",
																			) || "Audio fayl"}
																		</p>
																		<Badge
																			variant="outline"
																			className="text-[10px] px-1 py-0 h-4"
																		>
																			{getFileExtension(audio.file?.name || "")}
																		</Badge>
																	</div>
																	<div className="flex items-center gap-3 mt-1">
																		{audio.file?.size && (
																			<span className="text-xs text-muted-foreground">
																				{formatFileSize(audio.file.size)}
																			</span>
																		)}
																		{audio.metadata?.duration && (
																			<span className="text-xs text-muted-foreground">
																				{formatDuration(
																					audio.metadata.duration,
																				)}
																			</span>
																		)}
																	</div>
																</div>
																<Button size="sm" variant="ghost" className=" ">
																	<Plus className="h-4 w-4" />
																</Button>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
										<UploadIcon className="w-8 h-8 text-blue-500" />
									</div>
									<p className="text-sm font-medium mb-2">
										Hali fayl yuklanmagan
									</p>
									<p className="text-xs text-muted-foreground">
										Yuqoridagi tugmani bosib fayl yuklang
									</p>
								</div>
							)}
						</div>
					</ScrollArea>
				</TabsContent>

				{/* Stock Images Tab */}
				<TabsContent
					value="images"
					className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
				>
					<div className="flex flex-col flex-1 h-full overflow-hidden">
						<div className="p-2 sm:p-4 space-y-3 flex-none">
							<div className="relative">
								<Input
									placeholder="Stock rasmlarni qidirish..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSearchImages()}
									className="pr-20"
								/>
								<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
									{searchQuery && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												setSearchQuery("");
												loadPopularImages?.();
											}}
											className="h-7 w-7 p-0"
										>
											<X className="h-3.5 w-3.5" />
										</Button>
									)}
									<Button
										size="sm"
										onClick={handleSearchImages}
										className="h-7"
									>
										<Search className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						</div>

						<div className="flex-1 overflow-hidden">
							<ScrollArea className="h-full">
								<div className="p-2 sm:p-4 pt-0">
									{pexelsLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="w-6 h-6  text-primary" />
										</div>
									) : stockImages.length > 0 ? (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{stockImages.map((image: any) => (
												<Card
													key={image.id}
													className="group overflow-hidden cursor-pointer hover:shadow-none "
													onClick={() => handleAddStockImage(image)}
												>
													<div className="aspect-square relative overflow-hidden">
														<img
															src={
																image.preview ||
																image.src?.medium ||
																image.src?.original ||
																""
															}
															alt={
																image.alt || image.details?.alt || "Stock image"
															}
															className="object-cover w-full h-full  "
															loading="lazy"
															onError={(e) => {
																console.error(
																	"Image failed to load:",
																	e.currentTarget.src,
																);
																e.currentTarget.style.display = "none";
															}}
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent  ">
															<div className="absolute bottom-2 left-2 right-2">
																<p className="text-white text-xs truncate">
																	{image.alt || "Stock Image"}
																</p>
																<p className="text-white/80 text-[10px]">
																	by {image.photographer}
																</p>
															</div>
															<div className="absolute top-2 right-2">
																<div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
																	<Plus className="w-4 h-4 text-blue-600" />
																</div>
															</div>
														</div>
													</div>
												</Card>
											))}
										</div>
									) : (
										<div className="text-center py-8">
											<p className="text-sm text-muted-foreground">
												Rasmlar topilmadi
											</p>
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					</div>
				</TabsContent>

				{/* Stock Videos Tab */}
				<TabsContent
					value="videos"
					className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
				>
					<div className="flex flex-col flex-1 h-full overflow-hidden">
						<div className="p-2 sm:p-4 space-y-3 flex-none">
							<div className="relative">
								<Input
									placeholder="Stock videolarni qidirish..."
									value={videoSearchQuery}
									onChange={(e) => setVideoSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSearchVideos()}
									className="pr-20"
								/>
								<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
									{videoSearchQuery && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												setVideoSearchQuery("");
												loadPopularVideos?.();
											}}
											className="h-7 w-7 p-0"
										>
											<X className="h-3.5 w-3.5" />
										</Button>
									)}
									<Button
										size="sm"
										onClick={handleSearchVideos}
										className="h-7"
									>
										<Search className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						</div>

						<div className="flex-1 overflow-hidden">
							<ScrollArea className="h-full">
								<div className="p-2 sm:p-4 pt-0">
									{pexelsVideosLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="w-6 h-6  text-primary" />
										</div>
									) : stockVideos.length > 0 ? (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{stockVideos.map((video: any) => (
												<Card
													key={video.id}
													className="group overflow-hidden cursor-pointer hover:shadow-none "
													onClick={() => handleAddStockVideo(video)}
												>
													<div className="aspect-video relative overflow-hidden bg-black">
														{video.preview || video.image ? (
															<img
																src={video.preview || video.image}
																alt={`Video by ${video.metadata?.user || video.user?.name || "Local Asset"}`}
																className="object-cover w-full h-full  "
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
																<VideoIcon className="w-8 h-8 text-purple-500/50" />
															</div>
														)}

														{/* Overlay */}
														<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
															<div className="absolute bottom-2 left-2 right-2">
																<p className="text-white text-xs font-medium truncate">
																	Stock Video
																</p>
																<div className="flex items-center gap-2 mt-1">
																	<span className="text-white/80 text-[10px]">
																		by {video.user?.name || "Pexels"}
																	</span>
																	{video.duration && (
																		<Badge className="text-[10px] px-1 py-0 h-4 bg-white/20 text-white border-0">
																			{formatDuration(video.duration)}
																		</Badge>
																	)}
																</div>
															</div>

															{/* Play button */}
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center  ">
																	<Play className="w-5 h-5 text-purple-600 ml-1" />
																</div>
															</div>
														</div>
													</div>
												</Card>
											))}
										</div>
									) : (
										<div className="text-center py-8">
											<p className="text-sm text-muted-foreground">
												Videolar topilmadi
											</p>
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};
