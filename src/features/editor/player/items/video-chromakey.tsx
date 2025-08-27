import { IVideo } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateMediaStyles } from "../styles";
import { OffthreadVideo, useCurrentFrame } from "remotion";
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
	const { details } = item;
	const playbackRate = item.playbackRate || 1;
	const frame = useCurrentFrame();
	const { getChromaKey } = useChromaKeyStore();
	const chromaKey = getChromaKey(item.id);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	// Process video with chroma key
	useEffect(() => {
		if (!chromaKey?.enabled) return;

		const processVideo = () => {
			const video = videoRef.current;
			const canvas = canvasRef.current;

			if (!video || !canvas) {
				console.log("Missing video or canvas ref");
				return;
			}

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				console.error("Could not get canvas context");
				return;
			}

			// Set canvas size
			canvas.width = video.videoWidth || 1920;
			canvas.height = video.videoHeight || 1080;

			const processFrame = () => {
				if (video.paused || video.ended) return;

				// Draw current frame
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

				// Calculate threshold based on similarity
				const threshold = (1 - (chromaKey.similarity || 0.4)) * 255;
				const smoothness = (chromaKey.smoothness || 0.1) * 255;

				// Process each pixel
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					// Calculate color distance
					const distance = Math.sqrt(
						Math.pow(r - keyR, 2) +
							Math.pow(g - keyG, 2) +
							Math.pow(b - keyB, 2),
					);

					// Apply transparency
					if (distance < threshold) {
						data[i + 3] = 0; // Full transparency
					} else if (distance < threshold + smoothness) {
						// Smooth edge
						const alpha = (distance - threshold) / smoothness;
						data[i + 3] = Math.floor(alpha * 255);
					}

					// Apply spill suppression
					if (chromaKey.spill > 0 && data[i + 3] > 0) {
						const spillFactor =
							Math.max(0, 1 - distance / threshold) * chromaKey.spill;
						if (spillFactor > 0) {
							// Reduce green channel
							if (keyG > keyR && keyG > keyB) {
								data[i + 1] = Math.max(0, g - g * spillFactor);
							}
							// Reduce blue channel
							else if (keyB > keyR && keyB > keyG) {
								data[i + 2] = Math.max(0, b - b * spillFactor);
							}
						}
					}

					// Apply contrast and brightness
					if (data[i + 3] > 0) {
						const contrast = chromaKey.contrast || 1;
						const brightness = (chromaKey.brightness || 0) * 255;

						data[i] = Math.min(
							255,
							Math.max(0, (r - 128) * contrast + 128 + brightness),
						);
						data[i + 1] = Math.min(
							255,
							Math.max(0, (g - 128) * contrast + 128 + brightness),
						);
						data[i + 2] = Math.min(
							255,
							Math.max(0, (b - 128) * contrast + 128 + brightness),
						);
					}
				}

				// Put processed image back
				ctx.putImageData(imageData, 0, 0);

				// Continue processing
				requestAnimationFrame(processFrame);
			};

			// Start processing
			processFrame();
			setIsProcessing(true);
		};

		// Wait for video to be ready
		const video = videoRef.current;
		if (video) {
			if (video.readyState >= 2) {
				processVideo();
			} else {
				video.addEventListener("loadeddata", processVideo);
				return () => {
					video.removeEventListener("loadeddata", processVideo);
				};
			}
		}
	}, [chromaKey, frame]);

	// Render based on chroma key state
	if (chromaKey?.enabled) {
		return BaseSequence({
			item,
			options,
			children: (
				<div style={calculateMediaStyles(details, crop)}>
					<video
						ref={videoRef}
						src={details.src}
						style={{
							position: "absolute",
							width: "100%",
							height: "100%",
							display: isProcessing ? "none" : "block",
						}}
						autoPlay
						muted
					/>
					<canvas
						ref={canvasRef}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							display: isProcessing ? "block" : "none",
						}}
					/>
				</div>
			),
		});
	}

	// Default rendering without chroma key
	const children = (
		<div style={calculateMediaStyles(details, crop)}>
			<OffthreadVideo
				startFrom={(item.trim?.from! / 1000) * fps}
				endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
				playbackRate={playbackRate}
				src={details.src}
				volume={(details.volume || 0) / 100}
			/>
		</div>
	);

	return BaseSequence({ item, options, children });
};

export default Video;
