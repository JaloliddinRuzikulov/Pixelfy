import { ADD_ITEMS, ADD_VIDEO, ADD_AUDIO } from "@designcombo/state";
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
} from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUploadStore from "../store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { useTranslations } from "next-intl";
import { usePexelsImages } from "@/hooks/use-pexels-images";
import { usePexelsVideos } from "@/hooks/use-pexels-videos";
import { ImageLoading } from "@/components/ui/image-loading";
import { useState, useEffect } from "react";

export const Uploads = () => {
	const t = useTranslations("media");
	const { setShowUploadModal, uploads, pendingUploads, activeUploads } =
		useUploadStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [videoSearchQuery, setVideoSearchQuery] = useState("");

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

	const handleAddVideo = (video: any) => {
		const srcVideo = video.metadata?.uploadedUrl || video.url;
		console.log("Dispatching ADD_VIDEO event for:", video);
		console.log("Video source:", srcVideo);
		const payload = {
			id: generateId(),
			details: { src: srcVideo },
			metadata: { previewUrl: srcVideo },
		};
		const options = { resourceId: "main", scaleMode: "fit" };
		console.log("ADD_VIDEO payload:", payload);
		console.log("ADD_VIDEO options:", options);
		dispatch(ADD_VIDEO, {
			payload,
			options,
		});
		console.log("ADD_VIDEO event dispatched");
	};

	const handleAddImage = (image: any) => {
		const srcImage = image.metadata?.uploadedUrl || image.url;
		console.log("Dispatching ADD_ITEMS event for image:", image);
		console.log("Image source:", srcImage);
		const payload = {
			trackItems: [
				{
					id: generateId(),
					type: "image",
					display: { from: 0, to: 5000 },
					details: { src: srcImage },
					metadata: {},
				},
			],
		};
		console.log("ADD_ITEMS payload:", payload);
		dispatch(ADD_ITEMS, {
			payload,
			options: {},
		});
		console.log("ADD_ITEMS event dispatched for image");
	};

	const handleAddAudio = (audio: any) => {
		const srcAudio = audio.metadata?.uploadedUrl || audio.url;
		console.log("Dispatching ADD_AUDIO event for:", audio);
		console.log("Audio source:", srcAudio);
		const payload = {
			id: generateId(),
			type: "audio",
			details: { src: srcAudio },
			metadata: {},
		};
		console.log("ADD_AUDIO payload:", payload);
		dispatch(ADD_AUDIO, {
			payload,
			options: {},
		});
		console.log("ADD_AUDIO event dispatched");
	};

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

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearchImages();
		}
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		if (loadPopularImages) {
			loadPopularImages();
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

	const handleVideoKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearchVideos();
		}
	};

	const handleClearVideoSearch = () => {
		setVideoSearchQuery("");
		if (loadPopularVideos) {
			loadPopularVideos();
		}
	};

	const handleAddStockImage = (image: any) => {
		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [
					{
						id: generateId(),
						type: "image",
						display: { from: 0, to: 5000 },
						details: { src: image.src.large },
						metadata: {},
					},
				],
			},
			options: {},
		});
	};

	const handleAddStockVideo = (video: any) => {
		const srcVideo = video.video_files?.[0]?.link || video.url;
		dispatch(ADD_VIDEO, {
			payload: {
				id: generateId(),
				details: { src: srcVideo },
				metadata: { previewUrl: video.image },
			},
			options: { resourceId: "main", scaleMode: "fit" },
		});
	};

	const hasUploads = uploads.length > 0;
	const hasActivity = pendingUploads.length > 0 || activeUploads.length > 0;
	const stockImages = pexelsImages || [];
	const stockVideos = pexelsVideos || [];

	return (
		<div className="flex flex-1 flex-col h-full overflow-hidden">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border">
				Media
			</div>

			<ModalUpload />

			<Tabs
				defaultValue="uploads"
				className="flex-1 flex flex-col overflow-hidden"
			>
				<TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
					<TabsTrigger value="uploads">Your Files</TabsTrigger>
					<TabsTrigger value="images">Images</TabsTrigger>
					<TabsTrigger value="videos">Videos</TabsTrigger>
				</TabsList>

				<TabsContent value="uploads" className="flex-1 overflow-hidden mt-0">
					<ScrollArea className="flex-1 overflow-auto">
						<div className="p-4 space-y-4">
							{/* Upload Button */}
							<Button
								onClick={() => setShowUploadModal(true)}
								className="w-full h-10 border border-dashed border-border/50 bg-transparent hover:bg-muted/50 hover:border-primary/30"
								variant="outline"
							>
								<UploadIcon className="w-4 h-4 mr-2" />
								{t("uploadFile")}
							</Button>

							{/* Upload Progress */}
							{hasActivity && (
								<div className="space-y-3">
									<div className="flex items-center gap-2 text-sm font-medium">
										<Loader2 className="w-4 h-4 animate-spin" />
										{t("uploading")}
									</div>
									<div className="space-y-2">
										{pendingUploads.map((upload) => (
											<div
												key={upload.id}
												className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
											>
												<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
												<span className="text-xs flex-1 truncate">
													{upload.file?.name || t("unknownFile")}
												</span>
												<span className="text-xs text-muted-foreground">
													{t("pending")}
												</span>
											</div>
										))}
										{activeUploads.map((upload) => (
											<div
												key={upload.id}
												className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
											>
												<Loader2 className="w-3 h-3 animate-spin" />
												<span className="text-xs flex-1 truncate">
													{upload.file?.name || t("unknownFile")}
												</span>
												<span className="text-xs text-primary">
													{upload.progress ?? 0}%
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Uploaded Files */}
							{hasUploads ? (
								<div className="space-y-6">
									{videos.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<VideoIcon className="w-4 h-4 text-primary" />
												<span className="text-sm font-medium">
													{t("videosCount")} ({videos.length})
												</span>
											</div>
											<div className="grid grid-cols-2 gap-3">
												{videos.map((video, idx) => (
													<Card
														key={video.id || idx}
														className="cursor-pointer hover:bg-muted/50 transition-colors"
														onClick={() => handleAddVideo(video)}
													>
														<CardContent className="p-2">
															<div className="aspect-video relative overflow-hidden rounded-md bg-muted mb-2">
																{video.metadata?.uploadedUrl || video.url ? (
																	<video
																		src={
																			video.metadata?.uploadedUrl || video.url
																		}
																		className="object-cover w-full h-full"
																		muted
																		preload="metadata"
																	/>
																) : (
																	<div className="w-full h-full flex items-center justify-center">
																		<VideoIcon className="w-8 h-8 text-muted-foreground" />
																	</div>
																)}
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
																		<VideoIcon className="w-3 h-3 text-white" />
																	</div>
																</div>
															</div>
															<div className="text-xs text-center truncate font-medium">
																{video.file?.name?.replace(/\.[^/.]+$/, "") ||
																	t("video")}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									)}

									{images.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<ImageIcon className="w-4 h-4 text-primary" />
												<span className="text-sm font-medium">
													{t("imagesCount")} ({images.length})
												</span>
											</div>
											<div className="grid grid-cols-2 gap-3">
												{images.map((image, idx) => (
													<Card
														key={image.id || idx}
														className="cursor-pointer hover:bg-muted/50 transition-colors"
														onClick={() => handleAddImage(image)}
													>
														<CardContent className="p-2">
															<div className="aspect-square relative overflow-hidden rounded-md bg-muted mb-2">
																{image.metadata?.uploadedUrl || image.url ? (
																	<img
																		src={
																			image.metadata?.uploadedUrl || image.url
																		}
																		alt={image.file?.name || "Uploaded image"}
																		className="object-cover w-full h-full"
																	/>
																) : (
																	<div className="w-full h-full flex items-center justify-center">
																		<ImageIcon className="w-8 h-8 text-muted-foreground" />
																	</div>
																)}
															</div>
															<div className="text-xs text-center truncate font-medium">
																{image.file?.name?.replace(/\.[^/.]+$/, "") ||
																	t("image")}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									)}

									{audios.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<Music className="w-4 h-4 text-primary" />
												<span className="text-sm font-medium">
													{t("audioCount")} ({audios.length})
												</span>
											</div>
											<div className="grid grid-cols-1 gap-3">
												{audios.map((audio, idx) => (
													<Card
														key={audio.id || idx}
														className="cursor-pointer hover:bg-muted/50 transition-colors"
														onClick={() => handleAddAudio(audio)}
													>
														<CardContent className="p-3">
															<div className="flex items-center gap-3">
																<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
																	<Music className="w-6 h-6 text-purple-600" />
																</div>
																<div className="flex-1 min-w-0">
																	<div className="text-sm font-medium truncate">
																		{audio.file?.name?.replace(
																			/\.[^/.]+$/,
																			"",
																		) || t("audio")}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		Audio file
																	</div>
																</div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
										<UploadIcon className="w-6 h-6 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{t("noUploadsYet")}
									</p>
									<p className="text-xs text-muted-foreground/70">
										{t("uploadToGetStarted")}
									</p>
								</div>
							)}
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="images" className="flex-1 overflow-hidden mt-0">
					<div className="p-4 space-y-4 flex-none">
						{/* Search Bar */}
						<div className="relative">
							<Input
								placeholder="Search stock images..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyPress={handleKeyPress}
								className="pr-20"
							/>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
								<Button
									size="sm"
									variant="ghost"
									className="h-7 w-7 p-0"
									onClick={handleSearchImages}
									disabled={pexelsLoading}
								>
									{pexelsLoading ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										<Search className="h-3 w-3" />
									)}
								</Button>
								{searchQuery && (
									<Button
										size="sm"
										variant="ghost"
										className="h-7 px-2 text-xs"
										onClick={handleClearSearch}
										disabled={pexelsLoading}
									>
										Clear
									</Button>
								)}
							</div>
						</div>
					</div>

					<ScrollArea className="flex-1 overflow-auto">
						<div className="p-4 pt-0">
							{stockImages.length > 0 ? (
								<div className="grid grid-cols-2 gap-3">
									{stockImages.map((image, index) => (
										<Card
											key={image.id || index}
											className="cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleAddStockImage(image)}
										>
											<CardContent className="p-2">
												<div className="aspect-square relative overflow-hidden rounded-md bg-muted">
													<img
														src={
															image.details?.src ||
															image.metadata?.original_url ||
															""
														}
														alt={"Stock image"}
														className="object-cover w-full h-full"
													/>
												</div>
												<div className="text-xs text-center mt-2 text-muted-foreground truncate">
													Stock Image
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : !pexelsLoading ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
										<ImageIcon className="w-8 h-8 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{searchQuery
											? "No images found"
											: "Search for stock images"}
									</p>
									<p className="text-xs text-muted-foreground/70">
										Try different keywords
									</p>
								</div>
							) : (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							)}
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="videos" className="flex-1 overflow-hidden mt-0">
					<div className="p-4 space-y-4 flex-none">
						{/* Video Search Bar */}
						<div className="relative">
							<Input
								placeholder="Search stock videos..."
								value={videoSearchQuery}
								onChange={(e) => setVideoSearchQuery(e.target.value)}
								onKeyPress={handleVideoKeyPress}
								className="pr-20"
							/>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
								<Button
									size="sm"
									variant="ghost"
									className="h-7 w-7 p-0"
									onClick={handleSearchVideos}
									disabled={pexelsVideosLoading}
								>
									{pexelsVideosLoading ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										<Search className="h-3 w-3" />
									)}
								</Button>
								{videoSearchQuery && (
									<Button
										size="sm"
										variant="ghost"
										className="h-7 px-2 text-xs"
										onClick={handleClearVideoSearch}
										disabled={pexelsVideosLoading}
									>
										Clear
									</Button>
								)}
							</div>
						</div>
					</div>

					<ScrollArea className="flex-1 overflow-auto">
						<div className="p-4 pt-0">
							{stockVideos.length > 0 ? (
								<div className="grid grid-cols-1 gap-3">
									{stockVideos.map((video, index) => (
										<Card
											key={video.id || index}
											className="cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleAddStockVideo(video)}
										>
											<CardContent className="p-2">
												<div className="aspect-video relative overflow-hidden rounded-md bg-muted">
													<img
														src={
															video.preview ||
															video.metadata?.video_pictures?.[0]?.picture ||
															""
														}
														alt={"Stock video"}
														className="object-cover w-full h-full"
													/>
													<div className="absolute inset-0 flex items-center justify-center">
														<div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
															<VideoIcon className="w-4 h-4 text-white" />
														</div>
													</div>
												</div>
												<div className="text-xs text-center mt-2 text-muted-foreground truncate">
													Stock Video
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : !pexelsVideosLoading ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
										<VideoIcon className="w-8 h-8 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{videoSearchQuery
											? "No videos found"
											: "Search for stock videos"}
									</p>
									<p className="text-xs text-muted-foreground/70">
										Try different keywords
									</p>
								</div>
							) : (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							)}
						</div>
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</div>
	);
};
