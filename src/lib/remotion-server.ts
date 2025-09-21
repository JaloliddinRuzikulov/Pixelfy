/**
 * Server-only Remotion rendering functions
 * This file should only be imported in API routes, never in client code
 */

import type { IDesign } from "@designcombo/types";

export async function renderWithRemotion(
	jobId: string,
	design: IDesign,
	chromaKeySettings: any,
	onProgress: (progress: number) => void,
): Promise<string> {
	// Dynamically import Remotion packages only when this function is called
	const { bundle } = await import("@remotion/bundler");
	const { renderMedia, selectComposition } = await import("@remotion/renderer");

	const path = await import("path");
	const fs = await import("fs/promises");
	const os = await import("os");

	console.log("Starting Remotion render for job:", jobId);

	// Create temp directory for this render
	const tempDir = path.join(os.tmpdir(), `remotion-${jobId}`);
	await fs.mkdir(tempDir, { recursive: true });

	// Create entry point file with the design data
	const entryPoint = path.join(tempDir, "index.tsx");
	const entryContent = `
import React from 'react';
import { registerRoot, Composition } from 'remotion';

// Mock composition for server-side rendering
const MockComposition = () => {
	return React.createElement('div', {
		style: {
			width: '100%',
			height: '100%',
			backgroundColor: '#000',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: '#fff',
			fontSize: '48px'
		}
	}, 'Rendering...');
};

export const RemotionVideo = () => {
	const duration = ${design.duration || 10000};
	const fps = ${design.fps || 30};
	const durationInFrames = Math.round((duration / 1000) * fps) || 1;

	return React.createElement(Composition, {
		id: 'main',
		component: MockComposition,
		durationInFrames: durationInFrames,
		fps: fps,
		width: ${design.size?.width || 1920},
		height: ${design.size?.height || 1080}
	});
};

registerRoot(RemotionVideo);
`;

	await fs.writeFile(entryPoint, entryContent);

	// Update progress
	onProgress(20);

	// Bundle the video
	console.log("Bundling composition...");
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
	console.log("Rendering video...");
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

	console.log(`Render completed: ${outputFile}`);
	return `/renders/${jobId}.mp4`;
}
