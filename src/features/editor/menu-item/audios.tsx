import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS } from "@designcombo/state";
import { IAudio } from "@designcombo/types";
import { Music, Play, Clock } from "lucide-react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import React from "react";
import { generateId } from "@designcombo/timeline";
import { AUDIO_LIST as AUDIOS } from "../data/local-audio";

export const Audios = () => {
	const isDraggingOverTimeline = useIsDraggingOverTimeline();

	const handleAddAudio = (payload: Partial<IAudio>) => {
		try {
			// Convert duration from seconds to milliseconds
			const defaultDuration = 30000; // 30 seconds default for audio
			const durationInSeconds = payload.duration || 30;
			const durationInMs = durationInSeconds * 1000;

			const audioItem = {
				id: generateId(),
				type: "audio" as const,
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
					author: payload.metadata?.author || "Unknown Artist",
					mood: payload.metadata?.mood,
					originalDuration: payload.duration, // Keep original duration in seconds
					...payload.metadata,
				},
				name: payload.name || "Untitled Audio",
			};

			console.log("Dispatching ADD_ITEMS for audio:", audioItem);
			dispatch(ADD_ITEMS, {
				payload: {
					trackItems: [audioItem],
				},
			});
			console.log("ADD_ITEMS dispatched for audio");
		} catch (error) {
			console.error("Error dispatching ADD_ITEMS for audio:", error);
		}
	};

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex h-12 flex-none items-center px-4 text-xs sm:text-sm font-medium border-b border-border/20">
				Music Library
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-2">
					{AUDIOS.length > 0 ? (
						AUDIOS.map((audio, index) => (
							<AudioItem
								key={audio.id || index}
								shouldDisplayPreview={!isDraggingOverTimeline}
								handleAddAudio={handleAddAudio}
								audio={audio}
							/>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
								<Music className="w-8 h-8 text-muted-foreground" />
							</div>
							<p className="text-xs sm:text-sm text-muted-foreground mb-2">
								No audio files available
							</p>
							<p className="text-xs sm:text-sm text-muted-foreground/70">
								Check back later for music tracks
							</p>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

const AudioItem = ({
	handleAddAudio,
	audio,
	shouldDisplayPreview,
}: {
	handleAddAudio: (payload: Partial<IAudio>) => void;
	audio: Partial<IAudio>;
	shouldDisplayPreview: boolean;
}) => {
	const style = React.useMemo(
		() => ({
			backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			width: "80px",
			height: "80px",
		}),
		[],
	);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Draggable
			data={audio}
			renderCustomPreview={
				<div
					style={style}
					className="draggable rounded-lg flex items-center justify-center"
				>
					<Music className="w-6 h-6 text-white" />
				</div>
			}
			shouldDisplayPreview={shouldDisplayPreview}
		>
			<Card
				className="cursor-pointer hover:bg-muted/50"
				onClick={() => handleAddAudio(audio)}
			>
				<CardContent className="p-2.5">
					<div className="flex items-center gap-3">
						{/* Icon */}
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
							<Music className="w-4 h-4 text-primary" />
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<div className="font-medium text-xs sm:text-sm truncate">{audio.name}</div>
							<div className="text-xs sm:text-sm text-muted-foreground truncate">
								{audio.metadata?.author || "Unknown Artist"}
							</div>
							{audio.metadata?.mood && (
								<div className="inline-flex items-center gap-1 mt-1">
									<div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
										{audio.metadata.mood}
									</div>
								</div>
							)}
						</div>

						{/* Duration and Actions */}
						<div className="flex flex-col items-end gap-2">
							{audio.duration && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Clock className="w-3 h-3" />
									{formatDuration(audio.duration)}
								</div>
							)}
							<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 ">
								<Play className="w-3 h-3 text-primary fill-current" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Draggable>
	);
};
