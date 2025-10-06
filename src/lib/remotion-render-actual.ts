/**
 * Actual Remotion rendering that uses the same composition as UI
 */

import type { IDesign } from "@designcombo/types";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function renderWithActualComposition(
	jobId: string,
	design: IDesign,
	chromaKeySettings: any,
	onProgress: (progress: number) => void,
): Promise<string> {
	// This will only be imported server-side
	const { bundle } = await import("@remotion/bundler");
	const { renderMedia, selectComposition } = await import("@remotion/renderer");

	console.log(
		"Starting Remotion render with actual composition for job:",
		jobId,
	);

	// Create temp directory for this render
	const tempDir = path.join(os.tmpdir(), `remotion-${jobId}`);
	await fs.mkdir(tempDir, { recursive: true });

	// Selective asset copying - only copy required assets to reduce disk I/O
	const publicDir = path.join(process.cwd(), "public");
	const tempPublicDir = path.join(tempDir, "public");
	await fs.mkdir(tempPublicDir, { recursive: true });

	// Collect unique asset paths from design
	const requiredAssets = new Set<string>();
	const httpAssets = new Set<string>(); // Track HTTP/HTTPS URLs separately

	if (design.trackItemsMap) {
		Object.values(design.trackItemsMap).forEach((item: any) => {
			const src = item.details?.src;
			if (!src) return;

			// Handle different types of URLs
			if (src.startsWith("/uploads/")) {
				requiredAssets.add(src);
			} else if (src.startsWith("uploads/")) {
				requiredAssets.add("/" + src);
			} else if (src.startsWith("/api/local-upload/")) {
				// Local uploaded files via API
				requiredAssets.add(src);
			} else if (src.startsWith("/storage/")) {
				// Storage service files - these will be fetched via HTTP
				httpAssets.add(src);
			} else if (src.startsWith("http://") || src.startsWith("https://")) {
				// External URLs (like stock videos from Pexels)
				httpAssets.add(src);
			} else if (src.startsWith("/") && !src.startsWith("/uploads/")) {
				// Other local files
				requiredAssets.add(src);
			}

			// Also check for preview URLs in metadata
			const previewUrl = item.metadata?.previewUrl;
			if (previewUrl && previewUrl.startsWith("/uploads/")) {
				requiredAssets.add(previewUrl);
			}
		});
	}

	// Copy only required assets
	const tempUploadsDir = path.join(tempPublicDir, "uploads");
	await fs.mkdir(tempUploadsDir, { recursive: true });

	// Also create api directory for local-upload files
	const tempApiDir = path.join(tempPublicDir, "api", "local-upload");
	await fs.mkdir(tempApiDir, { recursive: true });

	let copiedCount = 0;
	for (const assetPath of requiredAssets) {
		try {
			let sourceFile = path.join(publicDir, assetPath);
			let targetFile = path.join(tempPublicDir, assetPath);

			// Handle API uploaded files differently
			if (assetPath.startsWith("/api/local-upload/")) {
				// These files might be in uploads directory
				const filename = assetPath.split("/").pop();
				sourceFile = path.join(publicDir, "uploads", filename);

				// Check if file exists in uploads directory
				try {
					await fs.access(sourceFile);
				} catch {
					// Try without extension or with different path
					console.warn(`Asset not found at expected location: ${sourceFile}`);
					continue;
				}
			}

			// Ensure target directory exists
			const targetDir = path.dirname(targetFile);
			await fs.mkdir(targetDir, { recursive: true });

			// Copy individual file
			await fs.copyFile(sourceFile, targetFile);
			copiedCount++;
		} catch (error) {
			console.warn(`Could not copy asset ${assetPath}:`, error.message);
		}
	}

	console.log(
		`Copied ${copiedCount} assets (${httpAssets.size} external URLs will be fetched directly)`,
	);

	// Create entry point that imports actual composition
	const entryPoint = path.join(tempDir, "index.tsx");

	// We need to serialize the store data properly
	const storeData = {
		trackItemIds: design.trackItemIds || [],
		trackItemsMap: design.trackItemsMap || {},
		transitionsMap: design.transitionsMap || {},
		size: design.size || { width: 1920, height: 1080 },
		fps: design.fps || 30,
		duration: design.duration || 10000,
		background: design.background || { type: "color", value: "#000000" },
		activeIds: [],
		structure: design.structure || "sequence",
	};

	// Create a wrapper composition that uses the exact same structure as the UI
	const entryContent = `
import React from 'react';
import { registerRoot, Composition, AbsoluteFill, Sequence, OffthreadVideo, Audio, Img, staticFile } from 'remotion';

// Serialized data from the server
const designData = ${JSON.stringify(storeData)};
const chromaKeyData = ${JSON.stringify(chromaKeySettings || {})};

// Helper to resolve asset URLs
const resolveAssetUrl = (src) => {
	if (!src) return src;

	// Handle blob URLs - these need to be converted to actual files
	if (src.startsWith('blob:')) {
		console.warn('Blob URL detected:', src, '- blob URLs cannot be used in Remotion render');
		// Return a placeholder or skip rendering this item
		return null;
	}

	// Handle data URLs (base64 encoded images/videos)
	if (src.startsWith('data:')) {
		// Data URLs can be used directly
		return src;
	}

	// Handle storage service URLs - convert to full URL
	if (src.startsWith('/storage/')) {
		// Convert to full localhost URL during development
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
		return baseUrl + src;
	}

	// Handle HTTP/HTTPS URLs
	if (src.startsWith('http://') || src.startsWith('https://')) {
		return src;
	}

	// Handle API uploaded files
	if (src.startsWith('/api/local-upload/')) {
		// Extract filename and use staticFile
		const filename = src.split('/').pop();
		return staticFile('uploads/' + filename);
	}

	// Use staticFile for bundled assets - this will work with the temp directory
	if (src.startsWith('/uploads/')) {
		// Remove leading slash for staticFile
		return staticFile(src.substring(1));
	}

	if (src.startsWith('uploads/')) {
		return staticFile(src);
	}

	// For other paths, try staticFile
	if (src.startsWith('/')) {
		return staticFile(src.substring(1));
	}

	return src;
};

// Frame calculation utility (copied from UI)
const calculateFrames = (display, fps) => {
	const from = Math.round((display.from / 1000) * fps);
	const durationInFrames = Math.round(((display.to - display.from) / 1000) * fps) || 1;
	return { from, durationInFrames };
};

// Crop styles calculation (copied exactly from UI)
const calculateCropStyles = (details, crop) => ({
	width: details.width || "100%",
	height: details.height || "auto", 
	top: -crop.y || 0,
	left: -crop.x || 0,
	position: "absolute",
	borderRadius: \`\${Math.min(crop.width || details.width || 0, crop.height || details.height || 0) * ((details.borderRadius || 0) / 100)}px\`,
});

// Media styles calculation (copied exactly from UI)
const calculateMediaStyles = (details, crop) => {
	return {
		pointerEvents: "none",
		boxShadow: [
			\`0 0 0 \${details.borderWidth || 0}px \${details.borderColor || '#000000'}\`,
			details.boxShadow
				? \`\${details.boxShadow.x || 0}px \${details.boxShadow.y || 0}px \${details.boxShadow.blur || 0}px \${details.boxShadow.color || '#000000'}\`
				: "",
		]
			.filter(Boolean)
			.join(", "),
		...calculateCropStyles(details, crop),
		overflow: "hidden",
		objectFit: "cover",
	};
};

// Text styles calculation (with ALL text properties from UI)
const calculateTextStyles = (details) => ({
	position: "relative",
	textDecoration: details.textDecoration || "none",
	WebkitTextStroke: \`\${details.borderWidth || 0}px \${details.borderColor || 'transparent'}\`,
	paintOrder: "stroke fill",
	textShadow: details.boxShadow
		? \`\${details.boxShadow.x || 0}px \${details.boxShadow.y || 0}px \${details.boxShadow.blur || 0}px \${details.boxShadow.color || '#000000'}\`
		: "",
	fontFamily: details.fontFamily || "Arial",
	fontWeight: details.fontWeight || "normal",
	fontStyle: details.fontStyle || "normal",
	lineHeight: details.lineHeight || "normal",
	letterSpacing: details.letterSpacing || "normal",
	wordSpacing: details.wordSpacing || "normal",
	wordWrap: details.wordWrap || "break-word",
	wordBreak: details.wordBreak || "normal",
	textTransform: details.textTransform || "none",
	fontSize: details.fontSize || "16px",
	textAlign: details.textAlign || "left",
	color: details.color || "#000000",
	backgroundColor: details.backgroundColor || "transparent",
	borderRadius: \`\${Math.min(details.width || 0, details.height || 0) * ((details.borderRadius || 0) / 100)}px\`,
	// Additional text properties
	textIndent: details.textIndent || "0px",
	whiteSpace: details.whiteSpace || "pre-wrap",
	overflowWrap: details.overflowWrap || "break-word",
	hyphens: details.hyphens || "none",
	direction: details.direction || "ltr",
	unicodeBidi: details.unicodeBidi || "normal",
});

// Container styles calculation (with ALL properties from UI)
const calculateContainerStyles = (details, crop = {}, overrides = {}) => {
	// Handle flip transforms
	let flipTransforms = [];
	if (details.flipX) flipTransforms.push('scaleX(-1)');
	if (details.flipY) flipTransforms.push('scaleY(-1)');
	
	// Combine all transforms
	const allTransforms = [
		...flipTransforms,
		details.transform || 'none'
	].filter(t => t !== 'none').join(' ') || 'none';
	
	return {
		pointerEvents: "auto",
		top: details.top || 0,
		left: details.left || 0,
		width: crop.width || details.width || "100%",
		height: crop.height || details.height || "auto",
		transform: allTransforms,
		opacity: details.opacity !== undefined ? details.opacity / 100 : 1,
		transformOrigin: details.transformOrigin || "center center",
		filter: \`brightness(\${details.brightness || 100}%) blur(\${details.blur || 0}px)\`,
		rotate: details.rotate || "0deg",
		position: 'absolute',
		visibility: details.visibility || 'visible',
		...overrides,
	};
};

// BaseSequence component (copied from UI structure)
const BaseSequence = ({ item, children }) => {
	const fps = designData.fps || 30;
	const { from, durationInFrames } = calculateFrames(item.display, fps);
	const crop = item.details.crop || {
		x: 0,
		y: 0,
		width: item.details.width,
		height: item.details.height,
	};

	return React.createElement(Sequence, {
		key: item.id,
		from: from,
		durationInFrames: durationInFrames,
	}, React.createElement(AbsoluteFill, {
		id: item.id,
		style: calculateContainerStyles(item.details, crop)
	}, children));
};

// Video component (matching UI exactly)
const VideoComponent = ({ item }) => {
	const { details } = item;
	const fps = designData.fps || 30;
	const playbackRate = item.playbackRate || 1;
	const chromaKey = chromaKeyData[item.id];

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	// Use helper to resolve asset URLs
	const videoSrc = resolveAssetUrl(details.src);

	// Skip rendering if no valid URL
	if (!videoSrc) {
		console.warn('Skipping video item due to invalid URL:', item.id, details.src);
		return null;
	}

	// Use OffthreadVideo for now (chroma key support can be added later)
	const videoElement = React.createElement(OffthreadVideo, {
		startFrom: (item.trim?.from || 0) / 1000 * fps,
		endAt: (item.trim?.to || item.display.to - item.display.from) / 1000 * fps,
		playbackRate: playbackRate,
		src: videoSrc,
		volume: (details.volume || 0) / 100,
		style: {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
		}
	});

	const children = React.createElement('div', {
		style: calculateMediaStyles(details, crop)
	}, videoElement);

	return BaseSequence({ item, children });
};

// Audio component (matching UI)
const AudioComponent = ({ item }) => {
	const { details } = item;
	const playbackRate = item.playbackRate || 1;

	// Use helper to resolve asset URLs
	const audioSrc = resolveAssetUrl(details.src);

	// Skip rendering if no valid URL
	if (!audioSrc) {
		console.warn('Skipping audio item due to invalid URL:', item.id, details.src);
		return null;
	}

	const audioElement = React.createElement(Audio, {
		startFrom: (item.trim?.from || 0) / 1000 * (designData.fps || 30),
		endAt: (item.trim?.to || item.display.to - item.display.from) / 1000 * (designData.fps || 30),
		playbackRate: playbackRate,
		src: audioSrc,
		volume: (details.volume || 100) / 100,
	});

	return BaseSequence({ item, children: audioElement });
};

// Image component (matching UI exactly)
const ImageComponent = ({ item }) => {
	const { details } = item;
	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	// Use helper to resolve asset URLs
	const imageSrc = resolveAssetUrl(details.src);

	// Skip rendering if no valid URL
	if (!imageSrc) {
		console.warn('Skipping image item due to invalid URL:', item.id, details.src);
		return null;
	}

	const imageElement = React.createElement(Img, {
		src: imageSrc,
		style: calculateMediaStyles(details, crop)
	});

	const children = React.createElement('div', {
		style: calculateMediaStyles(details, crop)
	}, imageElement);

	return BaseSequence({ item, children });
};

// Text component (matching UI exactly)
const TextComponent = ({ item }) => {
	const { details } = item;

	const textElement = React.createElement('div', {
		style: {
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: details.textAlign === 'center' ? 'center' : details.textAlign === 'right' ? 'flex-end' : 'flex-start',
			...calculateTextStyles(details)
		}
	}, details.text || '');

	return BaseSequence({ item, children: textElement });
};

// Track items grouping logic (copied from UI)
const groupTrackItems = (data) => {
	const { trackItemIds, transitionsMap, trackItemsMap } = data;

	// Create a map to track which items are part of transitions
	const itemTransitionMap = new Map();

	// Initialize transition maps
	Object.values(transitionsMap).forEach((transition) => {
		const { fromId, toId, kind } = transition;
		if (kind === "none") return; // Skip transitions of kind 'none'
		if (!itemTransitionMap.has(fromId)) itemTransitionMap.set(fromId, []);
		if (!itemTransitionMap.has(toId)) itemTransitionMap.set(toId, []);
		itemTransitionMap.get(fromId)?.push(transition);
		itemTransitionMap.get(toId)?.push(transition);
	});

	const groups = [];
	const processed = new Set();

	// Helper function to build a connected group starting from an item
	const buildGroup = (startItemId) => {
		const group = [];
		let currentId = startItemId;

		while (currentId) {
			if (processed.has(currentId)) break;

			processed.add(currentId);
			const currentItem = trackItemsMap[currentId];
			group.push(currentItem);

			// Find transition from this item
			const transition = Object.values(transitionsMap).find(
				(t) => t.fromId === currentId && t.kind !== "none"
			);
			if (!transition) break;

			group.push(transition);
			currentId = transition.toId;
		}

		return group;
	};

	// Process all items
	for (const itemId of trackItemIds) {
		if (processed.has(itemId)) continue;

		// If item is not part of any transition or is the start of a sequence
		if (
			!itemTransitionMap.has(itemId) ||
			!Object.values(transitionsMap).some((t) => t.toId === itemId)
		) {
			const group = buildGroup(itemId);
			if (group.length > 0) {
				groups.push(group);
			}
		}
	}

	// Sort items within each group by display.from
	groups.forEach((group) => {
		group.sort((a, b) => {
			if (a.display && b.display) {
				return a.display.from - b.display.from;
			}
			return 0;
		});
	});

	return groups;
};

// Main composition component (matching UI structure)
const ServerComposition = () => {
	const { trackItemIds, trackItemsMap, transitionsMap, size, background } = designData;
	
	// Group track items using the exact same logic as UI
	const groupedItems = groupTrackItems({
		trackItemIds,
		transitionsMap,
		trackItemsMap,
	});
	
	const renderItem = (item) => {
		if (!item || !item.type) return null;
		
		switch (item.type) {
			case 'video':
				return VideoComponent({ item });
			case 'audio':
				return AudioComponent({ item });
			case 'image':
				return ImageComponent({ item });
			case 'text':
				return TextComponent({ item });
			default:
				return null;
		}
	};

	return React.createElement('div', {
		style: {
			width: size.width,
			height: size.height,
			backgroundColor: background.value,
			position: 'absolute',
			top: 0,
			left: 0,
		}
	}, groupedItems.map((group, index) => {
		if (group.length === 1) {
			const item = group[0];
			return React.createElement(React.Fragment, {
				key: item.id
			}, renderItem(item));
		}
		return null;
	}));
};

export const RemotionVideo = () => {
	const duration = ${design.duration || 10000};
	const fps = ${design.fps || 30};
	const durationInFrames = Math.round((duration / 1000) * fps) || 1;

	return React.createElement(Composition, {
		id: 'main',
		component: ServerComposition,
		durationInFrames: durationInFrames,
		fps: fps,
		width: ${design.size?.width || 1920},
		height: ${design.size?.height || 1080}
	});
};

registerRoot(RemotionVideo);
`;

	await fs.writeFile(entryPoint, entryContent);

	onProgress(20);

	// Bundle the video with public dir access
	console.log("Bundling composition...");
	const bundleLocation = await bundle({
		entryPoint,
		publicDir: tempPublicDir, // Provide the public directory with assets
		onProgress: (progress) => {
			// Bundle progress is 0-1 (percentage as decimal)
			const percentProgress = Math.floor(progress * 100);
			onProgress(20 + (percentProgress * 20) / 100); // 20-40%
		},
		webpackOverride: (config) => {
			// Ensure webpack can serve static files
			return {
				...config,
				resolve: {
					...config.resolve,
					alias: {
						...config.resolve?.alias,
						"@public": tempPublicDir,
					},
				},
			};
		},
	});

	onProgress(40);

	// Get composition details
	const composition = await selectComposition({
		serveUrl: bundleLocation,
		id: "main",
	});

	// Create output directory
	const outputDir = path.join(process.cwd(), "public", "renders");
	await fs.mkdir(outputDir, { recursive: true });

	// Generate output filename
	const outputFile = path.join(outputDir, `${jobId}.mp4`);

	// Optimize concurrency based on available CPU cores
	const cpuCount = os.cpus().length;
	const optimalConcurrency = Math.min(4, Math.max(1, Math.floor(cpuCount / 2)));
	console.log(
		`Using concurrency ${optimalConcurrency} (CPU cores: ${cpuCount})`,
	);

	// Ensure temp directories exist for audio mixing
	const audioMixingDir = path.join(os.tmpdir(), `remotion-audio-${jobId}`);
	await fs.mkdir(audioMixingDir, { recursive: true });

	// Render the video
	console.log("Rendering video...");
	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: "h264",
		outputLocation: outputFile,
		concurrency: optimalConcurrency, // Use optimal concurrency instead of 1
		envVariables: {
			// Pass temp directory path for asset resolution
			REMOTION_TEMP_DIR: tempDir,
			TMPDIR: os.tmpdir(), // Ensure temp directory is available
		},
		chromiumOptions: {
			// Chrome memory optimizations handled differently in newer versions
		} as any,
		onProgress: ({ renderedFrames, encodedFrames, encodedDoneIn, renderedDoneIn }) => {
			// Calculate progress based on encoded frames (more accurate for final progress)
			const totalFrames = composition.durationInFrames;
			const frameProgress = encodedFrames / totalFrames;
			const percentProgress = Math.floor(frameProgress * 100);

			console.log(`Render progress: ${percentProgress}% (${encodedFrames}/${totalFrames} frames)`);
			onProgress(40 + (percentProgress * 60) / 100); // 40-100%

			// Don't clean up temp files during render - it causes audio mixing failures
			// The temp cleanup will happen after render completes
		},
	});

	// Clean up current temp files
	try {
		await fs.rm(tempDir, { recursive: true, force: true });
		console.log("Cleaned up temporary files successfully");
	} catch (cleanupError) {
		console.error("Failed to clean up temp files:", cleanupError);
	}

	console.log(`Render completed: ${outputFile}`);
	return `/renders/${jobId}.mp4`;
}
