import React, { useEffect, useRef, useState } from "react";
import { useCurrentFrame } from "remotion";

interface ChromaKeySettings {
	enabled: boolean;
	keyColor: string;
	similarity: number;
	smoothness: number;
	spill: number;
	contrast: number;
	brightness: number;
}

interface ChromaKeyVideoProps {
	src: string;
	chromaKey?: ChromaKeySettings;
	style?: React.CSSProperties;
	onVideoReady?: (video: HTMLVideoElement) => void;
	onError?: (error: any) => void;
}

export const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
	src,
	chromaKey,
	style,
	onVideoReady,
	onError,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const frame = useCurrentFrame();
	const [isReady, setIsReady] = useState(false);
	const animationFrameRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		if (!chromaKey?.enabled || !videoRef.current || !canvasRef.current) {
			return;
		}

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", {
			willReadFrequently: true,
			alpha: true,
		});

		if (!ctx) {
			console.error("Failed to get canvas context");
			return;
		}

		// Set canvas size to match video
		const updateCanvasSize = () => {
			if (video.videoWidth && video.videoHeight) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				setIsReady(true);
			}
		};

		const processFrame = () => {
			if (
				!video.paused &&
				!video.ended &&
				video.videoWidth &&
				video.videoHeight
			) {
				// Update canvas size if needed
				if (
					canvas.width !== video.videoWidth ||
					canvas.height !== video.videoHeight
				) {
					updateCanvasSize();
				}

				// Draw video frame to canvas
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				// Get image data
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const pixels = imageData.data;

				// Parse key color from hex
				const hex = chromaKey.keyColor.replace("#", "");
				const keyR = parseInt(hex.substr(0, 2), 16);
				const keyG = parseInt(hex.substr(2, 2), 16);
				const keyB = parseInt(hex.substr(4, 2), 16);

				// Calculate thresholds
				const maxDistance = 441.67; // Max possible distance in RGB space (sqrt(255^2 * 3))
				const threshold = (1 - chromaKey.similarity) * maxDistance;
				const smoothRange = chromaKey.smoothness * maxDistance;

				// Process each pixel
				for (let i = 0; i < pixels.length; i += 4) {
					const r = pixels[i];
					const g = pixels[i + 1];
					const b = pixels[i + 2];

					// Calculate Euclidean distance in RGB space
					const distance = Math.sqrt(
						Math.pow(r - keyR, 2) +
							Math.pow(g - keyG, 2) +
							Math.pow(b - keyB, 2),
					);

					// Calculate alpha based on distance
					let alpha = 255;

					if (distance < threshold) {
						// Within key color range - make transparent
						alpha = 0;
					} else if (distance < threshold + smoothRange) {
						// In smoothing range - partial transparency
						const factor = (distance - threshold) / smoothRange;
						alpha = Math.floor(factor * 255);
					}

					// Apply spill suppression (reduce key color influence)
					if (chromaKey.spill > 0 && alpha > 0) {
						const spillFactor =
							Math.max(0, 1 - distance / threshold) * chromaKey.spill;

						// Identify dominant channel of key color
						if (keyG > keyR && keyG > keyB) {
							// Green screen - reduce green
							pixels[i + 1] = Math.max(
								pixels[i],
								pixels[i + 2],
								g * (1 - spillFactor),
							);
						} else if (keyB > keyR && keyB > keyG) {
							// Blue screen - reduce blue
							pixels[i + 2] = Math.max(
								pixels[i],
								pixels[i + 1],
								b * (1 - spillFactor),
							);
						} else if (keyR > keyG && keyR > keyB) {
							// Red screen - reduce red
							pixels[i] = Math.max(
								pixels[i + 1],
								pixels[i + 2],
								r * (1 - spillFactor),
							);
						}
					}

					// Apply contrast and brightness adjustments
					if (
						(alpha > 0 && chromaKey.contrast !== 1) ||
						chromaKey.brightness !== 0
					) {
						const contrast = chromaKey.contrast;
						const brightness = chromaKey.brightness * 255;

						pixels[i] = Math.min(
							255,
							Math.max(0, (pixels[i] - 128) * contrast + 128 + brightness),
						);
						pixels[i + 1] = Math.min(
							255,
							Math.max(0, (pixels[i + 1] - 128) * contrast + 128 + brightness),
						);
						pixels[i + 2] = Math.min(
							255,
							Math.max(0, (pixels[i + 2] - 128) * contrast + 128 + brightness),
						);
					}

					// Set alpha channel
					pixels[i + 3] = alpha;
				}

				// Put processed image back to canvas
				ctx.putImageData(imageData, 0, 0);
			}

			// Continue processing
			animationFrameRef.current = requestAnimationFrame(processFrame);
		};

		// Handle video ready
		const handleLoadedMetadata = () => {
			updateCanvasSize();
			if (onVideoReady) {
				onVideoReady(video);
			}
			processFrame();
		};

		const handlePlay = () => {
			processFrame();
		};

		const handleError = (e: Event) => {
			console.error("ChromaKey video error:", e);
			if (onError) {
				onError(e);
			}
		};

		// Set up event listeners
		video.addEventListener("loadedmetadata", handleLoadedMetadata);
		video.addEventListener("play", handlePlay);
		video.addEventListener("error", handleError);

		// Start processing if video is already ready
		if (video.readyState >= 2) {
			handleLoadedMetadata();
		}

		// Cleanup
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			video.removeEventListener("loadedmetadata", handleLoadedMetadata);
			video.removeEventListener("play", handlePlay);
			video.removeEventListener("error", handleError);
		};
	}, [chromaKey, src, onVideoReady, onError]);

	// Trigger reprocess when frame changes
	useEffect(() => {
		if (chromaKey?.enabled && videoRef.current && !videoRef.current.paused) {
			// Force a repaint for the current frame
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");

			if (ctx && video.videoWidth && video.videoHeight) {
				ctx.drawImage(video, 0, 0);
			}
		}
	}, [frame, chromaKey?.enabled]);

	if (chromaKey?.enabled) {
		return (
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					...style,
				}}
			>
				<video
					ref={videoRef}
					src={src}
					onError={onError}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						visibility: "hidden",
					}}
					autoPlay
					muted
					playsInline
				/>
				<canvas
					ref={canvasRef}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "contain",
					}}
				/>
			</div>
		);
	}

	// No chroma key - render normal video
	return (
		<video
			ref={videoRef}
			src={src}
			onError={onError}
			style={{
				width: "100%",
				height: "100%",
				objectFit: "contain",
				...style,
			}}
			autoPlay
			muted
			playsInline
		/>
	);
};

export default ChromaKeyVideo;
