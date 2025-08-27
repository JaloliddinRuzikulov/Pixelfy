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
} from "lucide-react";
import { generateId } from "@designcombo/timeline";
import { Button } from "@/components/ui/button";
import useUploadStore from "../store/use-upload-store";
import ModalUpload from "@/components/modal-upload";
import { useTranslations } from "next-intl";

export const Uploads = () => {
	const t = useTranslations("media");
	const { setShowUploadModal, uploads, pendingUploads, activeUploads } =
		useUploadStore();

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
		dispatch(ADD_VIDEO, {
			payload: {
				id: generateId(),
				details: { src: srcVideo },
				metadata: { previewUrl: srcVideo },
			},
			options: { resourceId: "main", scaleMode: "fit" },
		});
	};

	const handleAddImage = (image: any) => {
		const srcImage = image.metadata?.uploadedUrl || image.url;
		dispatch(ADD_ITEMS, {
			payload: {
				trackItems: [
					{
						id: generateId(),
						type: "image",
						display: { from: 0, to: 5000 },
						details: { src: srcImage },
						metadata: {},
					},
				],
			},
			options: {},
		});
	};

	const handleAddAudio = (audio: any) => {
		const srcAudio = audio.metadata?.uploadedUrl || audio.url;
		dispatch(ADD_AUDIO, {
			payload: {
				id: generateId(),
				type: "audio",
				details: { src: srcAudio },
				metadata: {},
			},
			options: {},
		});
	};

	const hasUploads = uploads.length > 0;
	const hasActivity = pendingUploads.length > 0 || activeUploads.length > 0;

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex h-12 flex-none items-center px-4 text-sm font-medium">
				{t("yourUploads")}
			</div>

			<ModalUpload />

			<ScrollArea className="flex-1">
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
									<div className="grid grid-cols-3 gap-2">
										{videos.map((video, idx) => (
											<Card
												key={video.id || idx}
												className="cursor-pointer hover:bg-muted/50"
												onClick={() => handleAddVideo(video)}
											>
												<CardContent className="p-3">
													<div className="flex flex-col items-center gap-1">
														<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
															<VideoIcon className="w-4 h-4 text-primary" />
														</div>
														<div className="text-xs text-center truncate w-full">
															{video.file?.name || t("video")}
														</div>
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
									<div className="grid grid-cols-3 gap-2">
										{images.map((image, idx) => (
											<Card
												key={image.id || idx}
												className="cursor-pointer hover:bg-muted/50"
												onClick={() => handleAddImage(image)}
											>
												<CardContent className="p-3">
													<div className="flex flex-col items-center gap-1">
														<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
															<ImageIcon className="w-6 h-6 text-primary" />
														</div>
														<div className="text-xs text-center truncate w-full">
															{image.file?.name || t("image")}
														</div>
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
									<div className="grid grid-cols-3 gap-2">
										{audios.map((audio, idx) => (
											<Card
												key={audio.id || idx}
												className="cursor-pointer hover:bg-muted/50"
												onClick={() => handleAddAudio(audio)}
											>
												<CardContent className="p-3">
													<div className="flex flex-col items-center gap-1">
														<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
															<Music className="w-6 h-6 text-primary" />
														</div>
														<div className="text-xs text-center truncate w-full">
															{audio.file?.name || t("audio")}
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
		</div>
	);
};
