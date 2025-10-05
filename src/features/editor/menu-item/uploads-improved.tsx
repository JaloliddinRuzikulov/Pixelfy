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
import useUploadStore from "../store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { useTranslations } from "next-intl";
import { usePexelsImages } from "@/hooks/use-pexels-images";
import { usePexelsVideos } from "@/hooks/use-pexels-videos";
import { ImageLoading } from "@/components/ui/image-loading";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

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

export const UploadsImproved = () => {
	const t = useTranslations("media");
	const { setShowUploadModal, uploads, pendingUploads, activeUploads } =
		useUploadStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [videoSearchQuery, setVideoSearchQuery] = useState("");
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
	const videos = uploads.filter(
		(upload) => upload.type?.startsWith("video/") || upload.type === "video",
	);
	const images = uploads.filter(
		(upload) => upload.type?.startsWith("image/") || upload.type === "image",
	);
	const audios = uploads.filter(
		(upload) => upload.type?.startsWith("audio/") || upload.type === "audio",
	);

	// Add video to timeline with proper format
	const handleAddVideo = useCallback((video: any) => {
		const srcVideo = video.metadata?.uploadedUrl || video.url;
		const duration = video.metadata?.duration || 10000; // Default 10 seconds

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
				previewUrl: srcVideo,
				originalDuration: duration / 1000,
				volume: 1,
			},
		};

		console.log("Adding video to timeline:", videoItem);
		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [videoItem],
			},
		});

		// Show success notification
		showSuccessMessage("Video timeline'ga qo'shildi!");
	}, []);

	// Add image to timeline
	const handleAddImage = useCallback((image: any) => {
		const srcImage = image.metadata?.uploadedUrl || image.url;

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

		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [imageItem],
			},
		});

		showSuccessMessage("Rasm timeline'ga qo'shildi!");
	}, []);

	// Add audio to timeline
	const handleAddAudio = useCallback((audio: any) => {
		const srcAudio = audio.metadata?.uploadedUrl || audio.url;
		const duration = audio.metadata?.duration || 10000;

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

		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [audioItem],
			},
		});

		showSuccessMessage("Audio timeline'ga qo'shildi!");
	}, []);

	// Add stock image to timeline
	const handleAddStockImage = useCallback((image: any) => {
		const imageItem = {
			id: generateId(),
			type: "image" as const,
			name: image.alt || "Stock Image",
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
				src: image.src.large,
			},
			metadata: {
				photographer: image.photographer,
				url: image.url,
			},
		};

		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [imageItem],
			},
		});

		showSuccessMessage("Stock rasm timeline'ga qo'shildi!");
	}, []);

	// Add stock video to timeline with proper format
	const handleAddStockVideo = useCallback((video: any) => {
		// Get the best quality video file
		const videoFile =
			video.video_files?.find(
				(file: any) => file.quality === "hd" || file.quality === "sd",
			) || video.video_files?.[0];

		const srcVideo = videoFile?.link || video.url;
		const duration = (video.duration || 10) * 1000; // Convert to milliseconds

		const videoItem = {
			id: generateId(),
			type: "video" as const,
			name: `Stock Video - ${video.user?.name || "Pexels"}`,
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
				previewUrl: video.image || video.video_pictures?.[0]?.picture,
				originalDuration: video.duration || 10,
				volume: 1,
				author: video.user?.name,
				url: video.url,
			},
		};

		console.log("Adding stock video to timeline:", videoItem);
		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [videoItem],
			},
		});

		showSuccessMessage("Stock video timeline'ga qo'shildi!");
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

	return (
		<div className="flex flex-1 flex-col h-full overflow-hidden">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent">
				<FileIcon className="h-4 w-4 mr-2 text-blue-500" />
				Media va Fayllar
			</div>

			<ModalUpload />

			<Tabs
				defaultValue="uploads"
				className="flex-1 flex flex-col overflow-hidden"
			>
				<TabsList className="w-full justify-start rounded-none bg-transparent border-b px-4 h-10">
					<TabsTrigger value="uploads" className="text-xs">
						<UploadIcon className="h-3.5 w-3.5 mr-1.5" />
						Yuklangan
					</TabsTrigger>
					<TabsTrigger value="images" className="text-xs">
						<FileImage className="h-3.5 w-3.5 mr-1.5" />
						Stock Rasmlar
					</TabsTrigger>
					<TabsTrigger value="videos" className="text-xs">
						<Film className="h-3.5 w-3.5 mr-1.5" />
						Stock Videolar
					</TabsTrigger>
				</TabsList>

				<TabsContent value="uploads" className="flex-1 overflow-hidden mt-0">
					<ScrollArea className="h-full">
						<div className="p-4 space-y-4">
							{/* Upload Button */}
							<Button
								onClick={() => setShowUploadModal(true)}
								className="w-full h-12 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 "
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
											<span className="text-sm font-medium">
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
													<span className="text-sm font-medium">Videolar</span>
													<Badge variant="secondary">{videos.length}</Badge>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-3">
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
													<span className="text-sm font-medium">Rasmlar</span>
													<Badge variant="secondary">{images.length}</Badge>
												</div>
											</div>

											<div className="grid grid-cols-3 gap-2">
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
													<span className="text-sm font-medium">
														Audio fayllar
													</span>
													<Badge variant="secondary">{audios.length}</Badge>
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
				<TabsContent value="images" className="flex-1 overflow-hidden mt-0">
					<div className="flex flex-col h-full">
						<div className="p-4 space-y-3 flex-none">
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

						<ScrollArea className="flex-1">
							<div className="p-4 pt-0">
								{pexelsLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="w-6 h-6  text-primary" />
									</div>
								) : stockImages.length > 0 ? (
									<div className="grid grid-cols-2 gap-3">
										{stockImages.map((image: any) => (
											<Card
												key={image.id}
												className="group overflow-hidden cursor-pointer hover:shadow-none "
												onClick={() => handleAddStockImage(image)}
											>
												<div className="aspect-square relative overflow-hidden">
													<ImageLoading
														src={image.src.medium}
														alt={image.alt || "Stock image"}
														className="object-cover w-full h-full  "
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
				</TabsContent>

				{/* Stock Videos Tab */}
				<TabsContent value="videos" className="flex-1 overflow-hidden mt-0">
					<div className="flex flex-col h-full">
						<div className="p-4 space-y-3 flex-none">
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

						<ScrollArea className="flex-1">
							<div className="p-4 pt-0">
								{pexelsVideosLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="w-6 h-6  text-primary" />
									</div>
								) : stockVideos.length > 0 ? (
									<div className="grid grid-cols-2 gap-3">
										{stockVideos.map((video: any) => (
											<Card
												key={video.id}
												className="group overflow-hidden cursor-pointer hover:shadow-none "
												onClick={() => handleAddStockVideo(video)}
											>
												<div className="aspect-video relative overflow-hidden bg-black">
													{video.image ? (
														<img
															src={video.image}
															alt={`Video by ${video.user?.name || "Pexels"}`}
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
				</TabsContent>
			</Tabs>
		</div>
	);
};
