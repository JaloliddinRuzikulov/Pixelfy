import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React, { useState, useEffect } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, PlusIcon, Video as VideoIcon } from "lucide-react";
import { usePexelsVideos } from "@/hooks/use-pexels-videos";
import { ImageLoading } from "@/components/ui/image-loading";
import { useTranslations } from "next-intl";

export const Videos = () => {
	const t = useTranslations("media");
	const isDraggingOverTimeline = useIsDraggingOverTimeline();
	const [searchQuery, setSearchQuery] = useState("");

	const {
		videos: pexelsVideos,
		loading: pexelsLoading,
		error: pexelsError,
		currentPage,
		hasNextPage,
		searchVideos,
		loadPopularVideos,
		searchVideosAppend,
		loadPopularVideosAppend,
		clearVideos,
	} = usePexelsVideos();

	// Load popular videos on component mount
	useEffect(() => {
		const loadInitialVideos = async () => {
			try {
				await loadPopularVideos();
			} catch (error) {
				console.error("Error loading initial videos:", error);
			}
		};
		loadInitialVideos();
	}, [loadPopularVideos]);

	const handleAddVideo = (payload: Partial<IVideo>) => {
		try {
			// Default duration validation and metadata handling
			const defaultDuration = 10000; // 10 seconds default for videos
			const duration =
				payload.duration ||
				(payload.details as any)?.duration ||
				defaultDuration;

			// Ensure duration is in milliseconds
			const durationInMs =
				typeof duration === "number" && duration < 1000
					? duration * 1000
					: duration;

			const videoItem = {
				id: generateId(),
				type: "video" as const,
				display: {
					from: 0,
					to: durationInMs,
				},
				trim: {
					from: 0,
					to: durationInMs,
				},
				duration: durationInMs,
				details: {
					src: payload.details?.src || "",
				},
				metadata: {
					previewUrl: payload.preview || payload.metadata?.previewUrl,
					originalDuration: payload.duration,
					...payload.metadata,
				},
			};

			console.log("Dispatching ADD_ITEMS for video:", videoItem);
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [videoItem],
				},
			});
			console.log("ADD_ITEMS dispatched for video");
		} catch (error) {
			console.error("Error dispatching ADD_ITEMS for video:", error);
		}
	};

	const handleTestVideo = () => {
		console.log("=== TESTING VIDEO ADD ===");
		const testVideo = {
			id: generateId(),
			details: {
				src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			} as any,
			type: "video" as const,
			preview:
				"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
			duration: 10000,
		};

		console.log("Test video object:", testVideo);
		handleAddVideo(testVideo);
		console.log("=== TEST VIDEO ADD COMPLETED ===");
	};

	const handleSearch = async () => {
		try {
			if (!searchQuery.trim()) {
				await loadPopularVideos();
				return;
			}

			await searchVideos(searchQuery);
		} catch (error) {
			console.error("Error searching videos:", error);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleLoadMore = async () => {
		try {
			if (hasNextPage) {
				if (searchQuery.trim()) {
					await searchVideosAppend(searchQuery, currentPage + 1);
				} else {
					await loadPopularVideosAppend(currentPage + 1);
				}
			}
		} catch (error) {
			console.error("Error loading more videos:", error);
		}
	};

	const handleClearSearch = async () => {
		try {
			setSearchQuery("");
			clearVideos();
			await loadPopularVideos();
		} catch (error) {
			console.error("Error clearing search:", error);
		}
	};

	// Use Pexels videos if available, otherwise fall back to empty array
	const displayVideos = pexelsVideos || [];

	return (
		<div className="flex flex-1 flex-col h-full overflow-hidden">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border/20">
				{t("stockVideos")}
			</div>

			<div className="p-4 space-y-4 flex-none">
				{/* Search Bar */}
				<div className="relative">
					<Input
						placeholder={t("searchVideos")}
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
							onClick={handleSearch}
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
								{t("clear")}
							</Button>
						)}
					</div>
				</div>

				{/* Test Button for Debugging */}
				<Button
					onClick={handleTestVideo}
					variant="outline"
					className="w-full"
					size="sm"
				>
					🧪 Test Add Video (Debug)
				</Button>

				{/* Error Message */}
				{pexelsError && (
					<div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
						<p className="text-xs text-destructive">{pexelsError}</p>
					</div>
				)}
			</div>

			{/* Video Grid */}
			<ScrollArea className="flex-1 overflow-auto">
				<div className="p-4 pt-0">
					{displayVideos.length > 0 ? (
						<div className="grid grid-cols-2 gap-3">
							{displayVideos.map((video, index) => (
								<VideoItem
									key={video.id || index}
									video={video}
									shouldDisplayPreview={!isDraggingOverTimeline}
									handleAddVideo={handleAddVideo}
								/>
							))}
						</div>
					) : !pexelsLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
								<VideoIcon className="w-8 h-8 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								{searchQuery ? t("noVideosFound") : t("searchForStockVideos")}
							</p>
							<p className="text-xs text-muted-foreground/70">
								{searchQuery ? t("tryDifferentSearch") : t("enterKeywords")}
							</p>
						</div>
					) : null}

					{pexelsLoading && <ImageLoading message={t("searchingForVideos")} />}

					{/* Load More Button */}
					{hasNextPage && displayVideos.length > 0 && (
						<div className="flex justify-center mt-6">
							<Button
								variant="outline"
								onClick={handleLoadMore}
								disabled={pexelsLoading}
								className="w-full max-w-xs"
							>
								{pexelsLoading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										{t("loading")}
									</>
								) : (
									t("loadMoreVideos")
								)}
							</Button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

const VideoItem = ({
	handleAddVideo,
	video,
	shouldDisplayPreview,
}: {
	handleAddVideo: (payload: Partial<IVideo>) => void;
	video: Partial<IVideo>;
	shouldDisplayPreview: boolean;
}) => {
	const style = React.useMemo(
		() => ({
			backgroundImage: `url(${video.preview})`,
			backgroundSize: "cover",
			width: "100px",
			height: "100px",
		}),
		[video.preview],
	);

	return (
		<Draggable
			data={{
				...video,
				metadata: {
					previewUrl: video.preview,
				},
			}}
			renderCustomPreview={
				<div style={style} className="draggable rounded-lg" />
			}
			shouldDisplayPreview={shouldDisplayPreview}
		>
			<div
				onClick={() =>
					handleAddVideo({
						id: generateId(),
						details: {
							src: video.details?.src,
						},
						preview: video.preview,
						duration: (video.details as any)?.duration,
						metadata: {
							previewUrl: video.preview,
							...(video.metadata || {}),
						},
					} as any)
				}
				className="relative group cursor-pointer overflow-hidden rounded-lg bg-card hover:bg-muted/30"
			>
				<div className="aspect-video w-full overflow-hidden">
					<img
						draggable={false}
						src={video.preview}
						className="h-full w-full object-cover"
						alt="Video preview"
					/>
				</div>

				{/* Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
					<div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
						<PlusIcon className="h-4 w-4 text-white" />
					</div>
				</div>

				{/* Duration badge */}
				{(video.details as any)?.duration && (
					<div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
						{Math.round((video.details as any).duration)}s
					</div>
				)}
			</div>
		</Draggable>
	);
};
