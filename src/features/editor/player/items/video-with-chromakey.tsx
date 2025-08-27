import { IVideo } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateMediaStyles } from "../styles";
import { OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";
import { useEffect, useRef, useState } from "react";

interface ChromaKeySettings {
	enabled: boolean;
	keyColor: string;
	similarity: number;
	smoothness: number;
	spill: number;
	contrast: number;
	brightness: number;
}

export const VideoWithChromaKey = ({
	item,
	options,
}: {
	item: IVideo & { chromaKey?: ChromaKeySettings };
	options: SequenceItemOptions;
}) => {
	const { fps } = options;
	const { details, animations, chromaKey } = item;
	const playbackRate = item.playbackRate || 1;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const frame = useCurrentFrame();
	const { fps: videoFps } = useVideoConfig();

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	useEffect(() => {
		if (!chromaKey?.enabled || !canvasRef.current || !videoRef.current) return;

		const canvas = canvasRef.current;
		const video = videoRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });

		if (!ctx) return;

		const processFrame = () => {
			if (video.paused || video.ended) return;

			// Set canvas size to match video
			if (
				canvas.width !== video.videoWidth ||
				canvas.height !== video.videoHeight
			) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
			}

			// Draw video frame to canvas
			ctx.drawImage(video, 0, 0);

			// Get image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			// Parse key color
			const keyColor = chromaKey.keyColor || "#00FF00";
			const hex = keyColor.replace("#", "");
			const keyR = parseInt(hex.substr(0, 2), 16);
			const keyG = parseInt(hex.substr(2, 2), 16);
			const keyB = parseInt(hex.substr(4, 2), 16);

			const similarity = chromaKey.similarity * 255 || 100;
			const smoothness = chromaKey.smoothness * 255 || 25;
			const spill = chromaKey.spill || 0.1;
			const contrast = chromaKey.contrast || 1;
			const brightness = chromaKey.brightness * 255 || 0;

			// Process each pixel
			for (let i = 0; i < data.length; i += 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];

				// Calculate color distance
				const distance = Math.sqrt(
					Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2),
				);

				// Calculate alpha based on distance
				let alpha = 255;
				if (distance < similarity) {
					alpha = 0;
				} else if (distance < similarity + smoothness) {
					// Smooth edge
					alpha = ((distance - similarity) / smoothness) * 255;
				}

				// Apply spill suppression
				if (spill > 0 && alpha > 0) {
					const spillAmount = Math.max(0, 1 - distance / similarity) * spill;
					data[i] = r * (1 - spillAmount) + 128 * spillAmount;
					data[i + 1] = g * (1 - spillAmount) + 128 * spillAmount;
					data[i + 2] = b * (1 - spillAmount) + 128 * spillAmount;
				}

				// Apply contrast and brightness
				if (alpha > 0) {
					data[i] = Math.min(
						255,
						Math.max(0, (data[i] - 128) * contrast + 128 + brightness),
					);
					data[i + 1] = Math.min(
						255,
						Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness),
					);
					data[i + 2] = Math.min(
						255,
						Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness),
					);
				}

				// Set alpha
				data[i + 3] = alpha;
			}

			// Put processed image back
			ctx.putImageData(imageData, 0, 0);

			requestAnimationFrame(processFrame);
		};

		// Start processing when video plays
		const handlePlay = () => {
			processFrame();
		};

		video.addEventListener("play", handlePlay);

		// Process first frame if video is already playing
		if (!video.paused && !video.ended) {
			processFrame();
		}

		return () => {
			video.removeEventListener("play", handlePlay);
		};
	}, [chromaKey, frame]);

	const videoElement = (
		<OffthreadVideo
			startFrom={(item.trim?.from! / 1000) * fps}
			endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
			playbackRate={playbackRate}
			src={details.src}
			volume={details.volume || 0 / 100}
			style={{
				width: "100%",
				height: "100%",
				display: chromaKey?.enabled ? "none" : "block",
			}}
		/>
	);

	const children = (
		<div style={calculateMediaStyles(details, crop)}>
			{videoElement}
			{chromaKey?.enabled && (
				<canvas
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
			)}
		</div>
	);

	return BaseSequence({ item, options, children });
};

export default VideoWithChromaKey;
