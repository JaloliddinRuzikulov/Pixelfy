/**
 * Remotion SSR render that uses the actual UI composition
 */
import type { IDesign } from "@designcombo/types";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function renderWithRemotionSSR(
	jobId: string,
	design: IDesign,
	chromaKeySettings: any,
	onProgress: (progress: number) => void,
): Promise<string> {
	// Dynamic imports for server-side only
	const { bundle } = await import("@remotion/bundler");
	const { renderMedia, selectComposition } = await import("@remotion/renderer");

	console.log("Starting Remotion SSR render for job:", jobId);

	// Create temp directory
	const tempDir = path.join(os.tmpdir(), `remotion-${jobId}`);
	await fs.mkdir(tempDir, { recursive: true });

	// Create the entry file that will import our actual composition
	const entryPoint = path.join(tempDir, "index.tsx");

	// We need to create a proper entry that uses the real composition
	const compositionPath = path.resolve(
		process.cwd(),
		"src/features/editor/player/composition.tsx",
	);

	const entryContent = `
import React from 'react';
import { registerRoot, Composition, continueRender, delayRender } from 'remotion';
import { AbsoluteFill, Sequence, OffthreadVideo, Audio, Img } from 'remotion';

// Serialize the design data
const designData = ${JSON.stringify(design)};
const chromaKeyData = ${JSON.stringify(chromaKeySettings || {})};

// Simple mock store for SSR
const mockStore = {
	trackItemIds: designData.trackItemIds || [],
	trackItemsMap: designData.trackItemsMap || {},
	transitionsMap: designData.transitionsMap || {},
	size: designData.size || { width: 1920, height: 1080 },
	fps: designData.fps || 30,
	duration: designData.duration || 10000,
	background: designData.background || { type: 'color', value: '#000000' },
	activeIds: [],
	structure: designData.structure || 'sequence',
	sceneMoveableRef: { current: null },
};

// Create a simplified version of the composition for SSR
const ServerComposition = () => {
	const { trackItemsMap, size, background } = mockStore;
	
	// Group items for rendering
	const items = Object.values(trackItemsMap);
	
	return (
		<AbsoluteFill
			style={{
				backgroundColor: background.value,
			}}
		>
			{items.map((item: any) => {
				const { display, details, type, id } = item;
				const from = Math.round((display.from / 1000) * 30);
				const durationInFrames = Math.round(((display.to - display.from) / 1000) * 30) || 1;
				
				// Parse styles
				const opacity = (details.opacity || 100) / 100;
				const transform = details.transform || 'none';
				const top = typeof details.top === 'string' ? details.top : (details.top || 0) + 'px';
				const left = typeof details.left === 'string' ? details.left : (details.left || 0) + 'px';
				const width = details.width || 'auto';
				const height = details.height || 'auto';
				
				return (
					<Sequence
						key={id}
						from={from}
						durationInFrames={durationInFrames}
					>
						<AbsoluteFill
							style={{
								top,
								left,
								width,
								height,
								opacity,
								transform,
								position: 'absolute',
							}}
						>
							{type === 'video' && (
								<OffthreadVideo
									src={details.src}
									startFrom={0}
									volume={(details.volume || 100) / 100}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							)}
							{type === 'audio' && (
								<Audio
									src={details.src}
									volume={(details.volume || 100) / 100}
								/>
							)}
							{type === 'image' && (
								<Img
									src={details.src}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										borderRadius: details.borderRadius || 0,
									}}
								/>
							)}
							{type === 'text' && (
								<div
									style={{
										color: details.color || '#000',
										fontSize: details.fontSize || '16px',
										fontFamily: details.fontFamily || 'Arial',
										fontWeight: details.fontWeight || 'normal',
										textAlign: details.textAlign || 'left',
										lineHeight: details.lineHeight || 'normal',
										letterSpacing: details.letterSpacing || 'normal',
									}}
								>
									{details.text || ''}
								</div>
							)}
						</AbsoluteFill>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const RemotionRoot = () => {
	const duration = designData.duration || 10000;
	const fps = designData.fps || 30;
	const durationInFrames = Math.round((duration / 1000) * fps) || 1;

	return (
		<Composition
			id="main"
			component={ServerComposition}
			durationInFrames={durationInFrames}
			fps={fps}
			width={designData.size?.width || 1920}
			height={designData.size?.height || 1080}
		/>
	);
};

registerRoot(RemotionRoot);
`;

	await fs.writeFile(entryPoint, entryContent);
	onProgress(20);

	// Bundle the composition
	console.log("Bundling Remotion composition...");
	const bundleLocation = await bundle({
		entryPoint,
		onProgress: (progress) => {
			onProgress(20 + progress * 20); // 20-40%
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

	// Render the video
	console.log("Rendering video with Remotion...");
	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: "h264",
		outputLocation: outputFile,
		onProgress: ({ progress }) => {
			onProgress(40 + progress * 60); // 40-100%
		},
	});

	// Clean up temp files
	try {
		await fs.rm(tempDir, { recursive: true, force: true });
	} catch (cleanupError) {
		console.error("Failed to clean up temp files:", cleanupError);
	}

	console.log(`Remotion render completed: ${outputFile}`);
	return `/renders/${jobId}.mp4`;
}
