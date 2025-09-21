import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export interface RenderOptions {
	width: number;
	height: number;
	fps: number;
	duration: number;
	format: "mp4" | "webm" | "mov";
}

/**
 * Creates a simple test video using FFmpeg
 * In production, this would use the actual project data to compose the video
 */
export async function renderVideoWithFFmpeg(
	projectData: any,
	outputPath: string,
	options: RenderOptions,
	onProgress?: (progress: number) => void,
): Promise<void> {
	try {
		// Log full project data to understand structure
		console.log("===== FULL PROJECT DATA =====");
		console.log(JSON.stringify(projectData, null, 2));
		console.log("===== END PROJECT DATA =====");

		// Check if FFmpeg is installed with correct library path
		try {
			await execAsync(
				"env -i PATH=/usr/bin:/bin LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH /usr/bin/ffmpeg -version",
			);
			console.log("FFmpeg found and working, proceeding with render");
		} catch (error) {
			console.error("FFmpeg check failed:", error);
			// Try without library path override
			try {
				await execAsync("/usr/bin/ffmpeg -version");
				console.log("FFmpeg working without library path override");
			} catch (fallbackError) {
				console.error("FFmpeg not working at all:", fallbackError);
				throw new Error("FFmpeg is not available");
			}
		}

		const { width, height, fps, format, duration } = options;

		// Extract tracks from project data
		const design = projectData.design || projectData;

		console.log("Project data keys:", Object.keys(design));

		// Get all track items from the timeline
		let allTrackItems: any[] = [];

		// Use trackItemsMap if available (this is where the actual items are)
		if (design.trackItemsMap && typeof design.trackItemsMap === "object") {
			allTrackItems = Object.values(design.trackItemsMap);
			console.log("Found items in trackItemsMap:", allTrackItems.length);
		}
		// Fallback: Check if we have tracks with items inside them
		else if (design.tracks && Array.isArray(design.tracks)) {
			design.tracks.forEach((track: any) => {
				if (track.items && Array.isArray(track.items)) {
					// Get items from trackItemsMap using IDs
					track.items.forEach((itemId: string) => {
						if (design.trackItemsMap && design.trackItemsMap[itemId]) {
							allTrackItems.push(design.trackItemsMap[itemId]);
						}
					});
				}
			});
		}

		console.log("Total track items found:", allTrackItems.length);

		// Filter media track items by type
		const videoTracks = allTrackItems.filter(
			(item: any) => item.type === "video",
		);
		const imageTracks = allTrackItems.filter(
			(item: any) => item.type === "image",
		);
		const audioTracks = allTrackItems.filter(
			(item: any) => item.type === "audio",
		);
		const textTracks = allTrackItems.filter(
			(item: any) => item.type === "text",
		);

		console.log("Video items:", videoTracks.length);
		console.log("Image items:", imageTracks.length);
		console.log("Audio items:", audioTracks.length);
		console.log("Text items:", textTracks.length);

		if (videoTracks.length > 0) {
			console.log("First video item:", JSON.stringify(videoTracks[0], null, 2));
		}

		// Use ffmpeg with clean environment to avoid library conflicts
		let ffmpegCommand =
			"env -i PATH=/usr/bin:/bin LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu /usr/bin/ffmpeg -y ";
		let inputs: string[] = [];
		let filterComplex = "";
		let hasVideo = false;
		let inputIndex = 0;

		// Process all video tracks
		for (const videoTrack of videoTracks) {
			const videoSrc = videoTrack.details?.src;
			console.log(`Video ${inputIndex} source:`, videoSrc);

			if (videoSrc) {
				// Handle different path formats
				let videoPath = videoSrc;

				// If it starts with /uploads/, it's already in public
				if (videoSrc.startsWith("/uploads/")) {
					videoPath = path.join(process.cwd(), "public", videoSrc);
				} else if (videoSrc.startsWith("/")) {
					videoPath = path.join(process.cwd(), "public", videoSrc);
				} else if (videoSrc.startsWith("http")) {
					// For URLs, we might need to download first or use directly
					console.log("URL source detected:", videoSrc);
					continue;
				}

				console.log("Video path to use:", videoPath);

				// Check if file exists
				try {
					const fs = require("fs");
					if (fs.existsSync(videoPath)) {
						console.log("Video file exists at:", videoPath);

						// Handle trim if specified
						const trim = videoTrack.trim || {};
						const trimStart = (trim.from || 0) / 1000; // Convert to seconds
						const trimEnd = trim.to ? trim.to / 1000 : null;

						let inputStr = "";
						if (trimStart > 0) {
							inputStr += `-ss ${trimStart} `;
						}
						inputStr += `-i "${videoPath}"`;
						if (trimEnd) {
							const trimDuration = trimEnd - trimStart;
							inputStr += ` -t ${trimDuration}`;
						}

						inputs.push(inputStr);
						hasVideo = true;
						inputIndex++;
					} else {
						console.error("Video file not found at:", videoPath);
					}
				} catch (err) {
					console.error("Error checking video file:", err);
				}
			}
		}

		// Process all image tracks (can overlay on video)
		for (const imageTrack of imageTracks) {
			const imageSrc = imageTrack.details?.src;
			console.log(`Image ${inputIndex} source:`, imageSrc);

			if (imageSrc) {
				let imagePath = imageSrc;

				if (imageSrc.startsWith("/uploads/")) {
					imagePath = path.join(process.cwd(), "public", imageSrc);
				} else if (imageSrc.startsWith("/")) {
					imagePath = path.join(process.cwd(), "public", imageSrc);
				}

				console.log("Image path to use:", imagePath);

				// Check if file exists
				try {
					const fs = require("fs");
					if (fs.existsSync(imagePath)) {
						console.log("Image file exists at:", imagePath);
						// For images, we need to loop them for the duration
						const display = imageTrack.display || {};
						const imgDuration = display.to
							? (display.to - display.from) / 1000
							: duration;
						inputs.push(`-loop 1 -t ${imgDuration} -i "${imagePath}"`);
						inputIndex++;
					} else {
						console.error("Image file not found at:", imagePath);
					}
				} catch (err) {
					console.error("Error checking image file:", err);
				}
			}
		}

		// Process all audio tracks
		let audioInputIndex = inputIndex;
		for (const audioTrack of audioTracks) {
			const audioSrc = audioTrack.details?.src;
			console.log(`Audio ${audioInputIndex} source:`, audioSrc);

			if (audioSrc) {
				let audioPath = audioSrc;

				if (audioSrc.startsWith("/uploads/")) {
					audioPath = path.join(process.cwd(), "public", audioSrc);
				} else if (audioSrc.startsWith("/")) {
					audioPath = path.join(process.cwd(), "public", audioSrc);
				}

				console.log("Audio path to use:", audioPath);

				// Check if file exists
				try {
					const fs = require("fs");
					if (fs.existsSync(audioPath)) {
						console.log("Audio file exists at:", audioPath);
						inputs.push(`-i "${audioPath}"`);
						audioInputIndex++;
					} else {
						console.error("Audio file not found at:", audioPath);
					}
				} catch (err) {
					console.error("Error checking audio file:", err);
				}
			}
		}

		// Build FFmpeg command with all inputs
		if (inputs.length > 0) {
			// Add all inputs to command
			ffmpegCommand += inputs.join(" ") + " ";

			// If we have multiple video/image inputs, create overlay filter
			if (inputIndex > 1) {
				// Create filter complex for overlaying
				filterComplex = '-filter_complex "';

				// Process each input based on its properties
				let videoIndex = -1;
				let overlayInputs: any[] = [];

				for (let i = 0; i < inputIndex; i++) {
					const item = allTrackItems[i];
					const details = item.details || {};

					if (item.type === "video") {
						// Parse video properties
						const videoOpacity = (details.opacity || 100) / 100;
						const videoTop = parseFloat(details.top || "0") || 0;
						const videoLeft = parseFloat(details.left || "0") || 0;
						const videoRotate =
							parseFloat((details.rotate || "0deg").replace("deg", "")) || 0;
						const videoBlur = details.blur || 0;
						const videoBrightness = (details.brightness || 100) / 100;

						// Check for chroma key settings - passed from client
						const chromaKey = projectData.chromaKeySettings?.[item.id];

						// Parse scale from transform
						const transform = details.transform || "scale(1)";
						const scaleMatch = transform.match(/scale\(([\d.]+)\)/);
						const videoScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

						// Get original video dimensions
						const origWidth = details.width || width;
						const origHeight = details.height || height;

						// Calculate scaled dimensions
						const scaledWidth = Math.round(origWidth * videoScale);
						const scaledHeight = Math.round(origHeight * videoScale);

						// Build video filter chain
						let videoFilter = `[${i}:v]`;

						// Apply chroma key if enabled
						if (chromaKey && chromaKey.enabled) {
							const keyColor = chromaKey.keyColor || "#00FF00";
							// FFmpeg similarity works opposite - lower values = more selective
							const similarity = Math.max(
								0.01,
								Math.min(1, 1 - (chromaKey.similarity || 0.6)),
							);
							const blend = Math.max(
								0,
								Math.min(1, chromaKey.smoothness || 0.1),
							);

							// Convert hex to 0xRRGGBB format for FFmpeg
							const colorHex = keyColor.toUpperCase().replace("#", "0x");

							console.log(
								`Applying chromakey: color=${colorHex}, similarity=${similarity}, blend=${blend}`,
							);

							// Apply colorkey filter with proper format conversion
							videoFilter += `colorkey=${colorHex}:${similarity}:${blend},`;
						}

						// First scale to the intended size
						videoFilter += `scale=${scaledWidth}:${scaledHeight}:force_original_aspect_ratio=decrease,`;

						// Apply opacity
						if (videoOpacity < 1) {
							videoFilter += `format=rgba,colorchannelmixer=aa=${videoOpacity},`;
						}

						// Apply brightness
						if (videoBrightness !== 1) {
							videoFilter += `eq=brightness=${videoBrightness - 1},`;
						}

						// Apply blur
						if (videoBlur > 0) {
							videoFilter += `boxblur=${videoBlur}:${videoBlur},`;
						}

						// Apply rotation
						if (videoRotate !== 0) {
							videoFilter += `rotate=${videoRotate}*PI/180,`;
						}

						// Apply flip
						if (details.flipX) {
							videoFilter += `hflip,`;
						}
						if (details.flipY) {
							videoFilter += `vflip,`;
						}

						// Pad to canvas size and handle position
						// If position is negative, we need to crop; if positive, we pad
						if (videoLeft < 0 || videoTop < 0) {
							// Calculate crop if needed
							const cropX = Math.abs(Math.min(0, videoLeft));
							const cropY = Math.abs(Math.min(0, videoTop));
							if (cropX > 0 || cropY > 0) {
								videoFilter += `crop=${scaledWidth - cropX}:${scaledHeight - cropY}:${cropX}:${cropY},`;
							}
							// Then pad to canvas
							const padX = Math.max(0, videoLeft);
							const padY = Math.max(0, videoTop);
							videoFilter += `pad=${width}:${height}:${padX}:${padY}:black@0,`;
						} else {
							// Just pad with position
							videoFilter += `pad=${width}:${height}:${Math.round(videoLeft)}:${Math.round(videoTop)}:black@0,`;
						}

						// Remove trailing comma and set output
						videoFilter = videoFilter.replace(/,$/, "") + `[v${i}]`;

						filterComplex += videoFilter + ";";
						videoIndex = i;
					} else if (item.type === "image") {
						// Parse image properties
						const imgOpacity = (details.opacity || 100) / 100;
						const imgRotate =
							parseFloat((details.rotate || "0deg").replace("deg", "")) || 0;
						const imgBlur = details.blur || 0;
						const imgBrightness = (details.brightness || 100) / 100;

						// Parse scale from transform (can have two values)
						const transform = details.transform || "scale(1)";
						const scaleMatch = transform.match(
							/scale\(([\d.]+)(?:,\s*([\d.]+))?\)/,
						);
						let scaleX = 1,
							scaleY = 1;
						if (scaleMatch) {
							scaleX = parseFloat(scaleMatch[1]);
							scaleY = scaleMatch[2] ? parseFloat(scaleMatch[2]) : scaleX;
						}

						const imgWidth = Math.round((details.width || width) * scaleX);
						const imgHeight = Math.round((details.height || height) * scaleY);

						// Parse position (can be negative) - handle both string and number
						let top = 0;
						let left = 0;

						if (typeof details.top === "string") {
							top = parseFloat(details.top.replace("px", "")) || 0;
						} else if (typeof details.top === "number") {
							top = details.top;
						}

						if (typeof details.left === "string") {
							left = parseFloat(details.left.replace("px", "")) || 0;
						} else if (typeof details.left === "number") {
							left = details.left;
						}

						// Build image filter chain
						let imgFilter = `[${i}:v]scale=${imgWidth}:${imgHeight}`;

						// Apply opacity
						if (imgOpacity < 1) {
							imgFilter += `,format=rgba,colorchannelmixer=aa=${imgOpacity}`;
						}

						// Apply brightness
						if (imgBrightness !== 1) {
							imgFilter += `,eq=brightness=${imgBrightness - 1}`;
						}

						// Apply blur
						if (imgBlur > 0) {
							imgFilter += `,boxblur=${imgBlur}:${imgBlur}`;
						}

						// Apply rotation
						if (imgRotate !== 0) {
							imgFilter += `,rotate=${imgRotate}*PI/180`;
						}

						// Apply flip
						if (details.flipX) {
							imgFilter += `,hflip`;
						}
						if (details.flipY) {
							imgFilter += `,vflip`;
						}

						imgFilter += `[img${i}]`;
						filterComplex += imgFilter + ";";

						overlayInputs.push({
							index: i,
							type: "image",
							x: Math.round(left),
							y: Math.round(top),
							startTime: (item.display?.from || 0) / 1000,
							endTime: (item.display?.to || duration * 1000) / 1000,
						});
					}
				}

				// Build overlay chain - video first, then overlay images
				if (videoIndex >= 0 && overlayInputs.length > 0) {
					let lastOutput = `v${videoIndex}`;

					for (let i = 0; i < overlayInputs.length; i++) {
						const overlay = overlayInputs[i];
						const outputName =
							i === overlayInputs.length - 1 ? "" : `[out${i}]`;

						// Handle negative positions (allow content to be partially off-screen)
						let xPos = overlay.x;
						let yPos = overlay.y;

						// Apply overlay with time constraints and exact position
						filterComplex += `[${lastOutput}][img${overlay.index}]overlay=`;
						filterComplex += `x=${xPos}:y=${yPos}:`;
						filterComplex += `enable='between(t,${overlay.startTime},${overlay.endTime})'`;
						filterComplex += outputName;

						if (i < overlayInputs.length - 1) {
							filterComplex += ";";
							lastOutput = `out${i}`;
						}
					}
				} else if (videoIndex >= 0) {
					// Single video, use it directly
					filterComplex = filterComplex.replace(/;$/, "");
				} else if (inputIndex === 2) {
					// Simple overlay for 2 inputs
					filterComplex += "[v0][v1]overlay=0:0";
				} else {
					// Single or multiple without proper video base
					for (let i = 0; i < inputIndex; i++) {
						filterComplex += `[${i}:v]scale=${width}:${height}[v${i}];`;
					}
					if (inputIndex === 1) {
						filterComplex = filterComplex.replace(/;$/, "");
					} else {
						filterComplex += "[v0][v1]overlay=0:0";
					}
				}

				filterComplex += '" ';
				ffmpegCommand += filterComplex;
			} else if (inputIndex === 1) {
				// Single input, just scale
				ffmpegCommand += `-vf "scale=${width}:${height}" `;
			}

			// Add audio mapping if we have audio or video with audio
			if (audioInputIndex > inputIndex) {
				ffmpegCommand += `-map ${inputIndex}:a? `;
			} else if (videoTracks.length > 0) {
				// Check if video has audio and apply volume
				const videoWithAudio = videoTracks.find(
					(v: any) => v.details?.volume !== undefined,
				);
				if (videoWithAudio) {
					const volume = (videoWithAudio.details.volume || 100) / 100;
					if (volume !== 1) {
						ffmpegCommand += `-af "volume=${volume}" `;
					}
				}
			}
		} else {
			// No inputs found, create black video
			console.log("No media inputs found, creating black video");
			ffmpegCommand += `-f lavfi -i color=c=black:s=${width}x${height}:d=${duration} `;
		}

		// Output settings for MP4 with quality options
		const exportSettings =
			projectData.exportSettings || projectData.design?.exportSettings || {};
		const quality = exportSettings.quality || "high";

		// Map quality to CRF values (lower = better quality)
		const crfMap: Record<string, number> = {
			low: 35,
			medium: 28,
			high: 23,
			ultra: 18,
		};

		const crf = crfMap[quality] || 23;
		const preset =
			quality === "ultra"
				? "slow"
				: quality === "high"
					? "medium"
					: "ultrafast";

		ffmpegCommand += `-c:v libx264 -preset ${preset} -crf ${crf} -pix_fmt yuv420p -r ${fps} -t ${duration} "${outputPath}"`;

		console.log("Running FFmpeg command:", ffmpegCommand);

		// Execute FFmpeg command
		try {
			const { stdout, stderr } = await execAsync(ffmpegCommand);

			console.log("FFmpeg stdout:", stdout);
			console.log("FFmpeg stderr:", stderr);

			// Check if output file was created
			const fs = require("fs");
			if (!fs.existsSync(outputPath)) {
				throw new Error("FFmpeg did not create output file");
			}

			const stats = fs.statSync(outputPath);
			console.log(
				`Output file created: ${outputPath}, size: ${stats.size} bytes`,
			);

			if (stats.size < 1000) {
				throw new Error("Output file is too small, likely corrupted");
			}
		} catch (execError) {
			console.error("FFmpeg execution failed:", execError);
			throw execError;
		}

		// Simulate progress (in production, parse FFmpeg output for real progress)
		if (onProgress) {
			for (let i = 0; i <= 100; i += 20) {
				onProgress(i);
				await new Promise((resolve) => setTimeout(resolve, 200));
			}
		}
	} catch (error) {
		console.error("FFmpeg render error:", error);
		throw error;
	}
}

/**
 * Compose video from timeline data
 * This is a placeholder for the actual video composition logic
 */
export async function composeVideoFromTimeline(
	timeline: any,
	outputPath: string,
	options: RenderOptions,
): Promise<void> {
	// In a real implementation, this would:
	// 1. Parse timeline tracks and items
	// 2. Generate FFmpeg filter complex for overlays, transitions, etc.
	// 3. Apply effects, text, audio mixing
	// 4. Render the final video

	// For now, just create a test video
	await renderVideoWithFFmpeg(timeline, outputPath, options);
}
