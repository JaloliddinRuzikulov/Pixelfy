import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";
import Draggable from "@/components/shared/draggable";
import { IImage } from "@designcombo/types";
import React, { useState, useEffect } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { ADD_ITEMS } from "@designcombo/state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ImageIcon, Plus } from "lucide-react";
import { usePexelsImages } from "@/hooks/use-pexels-images";
import { ImageLoading } from "@/components/ui/image-loading";
import { useTranslations } from "next-intl";

export const Images = () => {
	const t = useTranslations("media");
	const isDraggingOverTimeline = useIsDraggingOverTimeline();
	const [searchQuery, setSearchQuery] = useState("");

	const {
		images: pexelsImages,
		loading: pexelsLoading,
		error: pexelsError,
		currentPage,
		hasNextPage,
		searchImages,
		loadCuratedImages,
		searchImagesAppend,
		loadCuratedImagesAppend,
		clearImages,
	} = usePexelsImages();

	// Load curated images on component mount
	useEffect(() => {
		const loadInitialImages = async () => {
			try {
				await loadCuratedImages();
			} catch (error) {
				console.error("Error loading initial images:", error);
			}
		};
		loadInitialImages();
	}, [loadCuratedImages]);

	const handleAddImage = (payload: Partial<IImage>) => {
		try {
			const defaultDuration = 5000; // 5 seconds default for images
			const duration = payload.duration || defaultDuration;

			const imageItem = {
				id: generateId(),
				type: "image" as const,
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
					src: payload.details?.src || "",
				},
				metadata: {
					previewUrl: payload.preview || payload.metadata?.previewUrl,
					originalDimensions: payload.metadata?.originalDimensions,
					photographer: payload.metadata?.photographer,
					...payload.metadata,
				},
			};

			console.log("Dispatching ADD_ITEMS for image:", imageItem);
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [imageItem],
				},
			});
			console.log("ADD_ITEMS dispatched for image");
		} catch (error) {
			console.error("Error dispatching ADD_ITEMS for image:", error);
		}
	};

	const handleSearch = async () => {
		try {
			if (!searchQuery.trim()) {
				await loadCuratedImages();
				return;
			}

			await searchImages(searchQuery);
		} catch (error) {
			console.error("Error searching images:", error);
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
					await searchImagesAppend(searchQuery, currentPage + 1);
				} else {
					await loadCuratedImagesAppend(currentPage + 1);
				}
			}
		} catch (error) {
			console.error("Error loading more images:", error);
		}
	};

	const handleClearSearch = async () => {
		try {
			setSearchQuery("");
			clearImages();
			await loadCuratedImages();
		} catch (error) {
			console.error("Error clearing search:", error);
		}
	};

	// Use Pexels images if available, otherwise fall back to empty array
	const displayImages = pexelsImages || [];

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium border-b border-border/20">
				{t("stockImages")}
			</div>

			<div className="p-4 space-y-4">
				{/* Search Bar */}
				<div className="relative">
					<Input
						placeholder="Search images..."
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
								Clear
							</Button>
						)}
					</div>
				</div>

				{/* Error Message */}
				{pexelsError && (
					<div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
						<p className="text-xs text-destructive">{pexelsError}</p>
					</div>
				)}
			</div>

			{/* Image Grid */}
			<ScrollArea className="flex-1">
				<div className="p-4 pt-0">
					{displayImages.length > 0 ? (
						<div className="masonry-sm gap-3">
							{displayImages.map((image, index) => (
								<ImageItem
									key={image.id || index}
									image={image}
									shouldDisplayPreview={!isDraggingOverTimeline}
									handleAddImage={handleAddImage}
								/>
							))}
						</div>
					) : !pexelsLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
								<ImageIcon className="w-8 h-8 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								{searchQuery ? "No images found" : "Search for stock images"}
							</p>
							<p className="text-xs text-muted-foreground/70">
								{searchQuery
									? "Try a different search term"
									: "Enter keywords to find images from Pexels"}
							</p>
						</div>
					) : null}

					{pexelsLoading && <ImageLoading message="Searching for images..." />}

					{/* Load More Button */}
					{hasNextPage && displayImages.length > 0 && (
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
										Loading...
									</>
								) : (
									"Load More Images"
								)}
							</Button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

const ImageItem = ({
	handleAddImage,
	image,
	shouldDisplayPreview,
}: {
	handleAddImage: (payload: Partial<IImage>) => void;
	image: Partial<IImage>;
	shouldDisplayPreview: boolean;
}) => {
	const style = React.useMemo(
		() => ({
			backgroundImage: `url(${image.preview})`,
			backgroundSize: "cover",
			width: "120px",
			height: "120px",
		}),
		[image.preview],
	);

	return (
		<Draggable
			data={image}
			renderCustomPreview={
				<div style={style} className="draggable rounded-lg" />
			}
			shouldDisplayPreview={shouldDisplayPreview}
		>
			<div
				onClick={() =>
					handleAddImage({
						id: generateId(),
						type: "image",
						name: image.name || "Untitled Image",
						display: { from: 0, to: 5000 },
						details: {
							src: image.details?.src || "",
						} as any,
						preview: image.preview,
						metadata: {
							previewUrl: image.preview,
							...(image.metadata || {}),
						},
					})
				}
				className="relative group cursor-pointer overflow-hidden rounded-lg bg-card hover:bg-muted/30 break-inside-avoid mb-3"
			>
				<img
					draggable={false}
					src={image.preview}
					className="w-full object-cover"
					alt="Visual content"
					loading="lazy"
				/>

				{/* Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
					<div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
						<Plus className="h-4 w-4 text-white" />
					</div>
				</div>
			</div>
		</Draggable>
	);
};
