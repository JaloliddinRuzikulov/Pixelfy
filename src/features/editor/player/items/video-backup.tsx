import { IVideo } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateMediaStyles } from "../styles";
import {
	OffthreadVideo,
	useCurrentFrame,
	Video as RemotionVideo,
	AbsoluteFill,
} from "remotion";
import { useEffect, useRef, useState } from "react";
import useChromaKeyStore from "../../store/use-chroma-key-store";

export const Video = ({
	item,
	options,
}: {
	item: IVideo;
	options: SequenceItemOptions;
}) => {
	const { fps } = options;
	const { details, animations } = item;
	const playbackRate = item.playbackRate || 1;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const frame = useCurrentFrame();
	const { getChromaKey } = useChromaKeyStore();
	const chromaKey = getChromaKey(item.id);

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	useEffect(() => {
		console.log("Chroma key effect running:", {
			enabled: chromaKey?.enabled,
			hasCanvas: !!canvasRef.current,
			hasVideo: !!videoRef.current,
			chromaKey,
		});

		if (!chromaKey?.enabled || !canvasRef.current || !videoRef.current) return;

		const canvas = canvasRef.current;
		const video = videoRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });

		if (!ctx) {
			console.error("Could not get canvas context");
			return;
		}

		const processFrame = () => {
			console.log("Processing frame...");
			// Set canvas size to match video
			if (
				canvas.width !== video.videoWidth ||
				canvas.height !== video.videoHeight
			) {
				canvas.width = video.videoWidth || details.width;
				canvas.height = video.videoHeight || details.height;
			}

			// Draw video frame to canvas
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			// Get image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			// Parse key color
			const keyColor = chromaKey.keyColor || "#00FF00";
			const hex = keyColor.replace("#", "");
			const keyR = parseInt(hex.substr(0, 2), 16);
			const keyG = parseInt(hex.substr(2, 2), 16);
			const keyB = parseInt(hex.substr(4, 2), 16);

			const threshold = (1 - (chromaKey.similarity || 0.4)) * 255;
			const smoothness = (chromaKey.smoothness || 0.1) * 255;

			// Process each pixel
			for (let i = 0; i < data.length; i += 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];

				// Calculate color distance
				const distance = Math.sqrt(
					Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2),
				);

				// Make pixel transparent if it matches key color
				if (distance < threshold) {
					data[i + 3] = 0; // Full transparency
				} else if (distance < threshold + smoothness) {
					// Smooth edge with partial transparency
					const alpha = (distance - threshold) / smoothness;
					data[i + 3] = Math.floor(alpha * 255);
				}
			}

			// Put processed image back
			ctx.putImageData(imageData, 0, 0);
		};

		// Process frame on each React render
		processFrame();
	}, [frame, chromaKey, details]);

	const videoElement = chromaKey?.enabled ? (
		<>
			<RemotionVideo
				ref={videoRef as any}
				startFrom={(item.trim?.from! / 1000) * fps}
				endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
				playbackRate={playbackRate}
				src={details.src}
				volume={(details.volume || 0) / 100}
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					opacity: 0,
					pointerEvents: "none",
				}}
			/>
			<canvas
				ref={canvasRef}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
			/>
		</>
	) : (
		<OffthreadVideo
			startFrom={(item.trim?.from! / 1000) * fps}
			endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
			playbackRate={playbackRate}
			src={details.src}
			volume={(details.volume || 0) / 100}
		/>
	);

	const children = (
		<div style={calculateMediaStyles(details, crop)}>{videoElement}</div>
	);

	return BaseSequence({ item, options, children });
};

export default Video;
