import { useEffect, useRef, useState } from "react";
import Header from "./header";
import Ruler from "./ruler";
import { timeMsToUnits, unitsToTimeMs } from "@designcombo/timeline";
import CanvasTimeline from "./items/timeline";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { dispatch, filter, subject } from "@designcombo/events";
import {
	TIMELINE_BOUNDING_CHANGED,
	TIMELINE_PREFIX,
} from "@designcombo/timeline";
import useStore from "../store/use-store";
import Playhead from "./playhead";
import { useCurrentPlayerFrame } from "../hooks/use-current-frame";
import { Audio, Image, Text, Video, Track } from "./items";
import StateManager, { REPLACE_MEDIA } from "@designcombo/state";
import {
	TIMELINE_OFFSET_CANVAS_LEFT,
	TIMELINE_OFFSET_CANVAS_RIGHT,
} from "../constants/constants";
import { ITrackItem } from "@designcombo/types";
import { useTimelineOffsetX } from "../hooks/use-timeline-offset";
import { useStateManagerEvents } from "../hooks/use-state-manager-events";
import { Canvas, Rect, Text as FabricText } from "fabric";

import { classRegistry } from "@designcombo/timeline";

// Register classes with the proper names (capitalized) for O.getClass to find them
classRegistry.setClass(Video, "Video");
classRegistry.setClass(Image, "Image");
classRegistry.setClass(Audio, "Audio");
classRegistry.setClass(Text, "Text");
classRegistry.setClass(Track, "Track");

// Also register lowercase versions for backward compatibility
classRegistry.setClass(Video, "video");
classRegistry.setClass(Image, "image");
classRegistry.setClass(Audio, "audio");
classRegistry.setClass(Text, "text");
classRegistry.setClass(Track, "track");

// Register with CanvasTimeline
// The vendor's cg function capitalizes types (e.g., "video" -> "Video"), so register with capitalized keys
CanvasTimeline.registerItems({
	Video, // Registers Video class with key "Video"
	Image, // Registers Image class with key "Image"
	Audio, // Registers Audio class with key "Audio"
	Text, // Registers Text class with key "Text"
	Track, // Registers Track class with key "Track"
});

const EMPTY_SIZE = { width: 0, height: 0 };
const Timeline = ({ stateManager }: { stateManager: StateManager }) => {
	// prevent duplicate scroll events
	const canScrollRef = useRef(false);
	const timelineContainerRef = useRef<HTMLDivElement>(null);
	const [scrollLeft, setScrollLeft] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);
	const canvasRef = useRef<CanvasTimeline | null>(null);
	const verticalScrollbarVpRef = useRef<HTMLDivElement>(null);
	const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
	const { scale, playerRef, fps, duration, setState, timeline } = useStore();
	const currentFrame = useCurrentPlayerFrame(playerRef);
	const [canvasSize, setCanvasSize] = useState(EMPTY_SIZE);
	const [size, setSize] = useState<{ width: number; height: number }>(
		EMPTY_SIZE,
	);
	const timelineOffsetX = useTimelineOffsetX();

	const { setTimeline } = useStore();

	// Use the extracted state manager events hook
	useStateManagerEvents(stateManager);

	const onScroll = (v: { scrollTop: number; scrollLeft: number }) => {
		if (horizontalScrollbarVpRef.current && verticalScrollbarVpRef.current) {
			verticalScrollbarVpRef.current.scrollTop = -v.scrollTop;
			horizontalScrollbarVpRef.current.scrollLeft = -v.scrollLeft;
			setScrollLeft(-v.scrollLeft);
		}
	};

	useEffect(() => {
		if (playerRef?.current) {
			canScrollRef.current = playerRef?.current.isPlaying();
		}
	}, [playerRef?.current?.isPlaying()]);

	useEffect(() => {
		const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom);
		const canvasEl = canvasElRef.current;
		const horizontalScrollbar = horizontalScrollbarVpRef.current;

		if (!canvasEl || !horizontalScrollbar) return;

		const canvasBoudingX =
			canvasEl.getBoundingClientRect().x + canvasEl.clientWidth;
		const playHeadPos = position - scrollLeft + 40;
		if (playHeadPos >= canvasBoudingX) {
			const scrollDivWidth = horizontalScrollbar.clientWidth;
			const totalScrollWidth = horizontalScrollbar.scrollWidth;
			const currentPosScroll = horizontalScrollbar.scrollLeft;
			const availableScroll =
				totalScrollWidth - (scrollDivWidth + currentPosScroll);
			const scaleScroll = availableScroll / scrollDivWidth;
			if (scaleScroll >= 0) {
				if (scaleScroll > 1)
					horizontalScrollbar.scrollTo({
						left: currentPosScroll + scrollDivWidth,
					});
				else
					horizontalScrollbar.scrollTo({
						left: totalScrollWidth - scrollDivWidth,
					});
			}
		}
	}, [currentFrame]);

	const onResizeCanvas = (payload: { width: number; height: number }) => {
		setCanvasSize({
			width: payload.width,
			height: payload.height,
		});
	};

	useEffect(() => {
		const canvasEl = canvasElRef.current;
		const timelineContainerEl = timelineContainerRef.current;

		if (!canvasEl || !timelineContainerEl) return;

		const containerWidth = timelineContainerEl.clientWidth - 40;
		const containerHeight = timelineContainerEl.clientHeight - 90;

		console.log("Creating CanvasTimeline with stateManager:", stateManager);
		console.log("CanvasTimeline constructor:", CanvasTimeline);
		console.log("CanvasTimeline prototype:", CanvasTimeline.prototype);
		console.log(
			"CanvasTimeline registeredItems:",
			(CanvasTimeline as any).registeredItems,
		);

		// Create timeline with error handling wrapper for state updates
		const wrappedStateManager = new Proxy(stateManager, {
			get(target, prop) {
				// Specific handling for getState
				if (prop === 'getState') {
					return () => {
						try {
							const state = target.getState();
							return {
								...state,
								trackItemsMap: state.trackItemsMap || {},
								trackItemIds: state.trackItemIds || [],
								tracks: state.tracks || [],
							};
						} catch (error) {
							console.error("Error getting state:", error);
							return {
								trackItemsMap: {},
								trackItemIds: [],
								tracks: [],
								duration: 0,
							};
						}
					};
				}

				// Handle subscription methods that might be missing
				if (typeof prop === 'string' && prop.startsWith('subscribeTo')) {
					const method = target[prop as keyof typeof target];
					if (typeof method === 'function') {
						return method.bind(target);
					} else {
						// Return dummy subscription for missing methods
						console.warn(`Missing subscription method: ${prop}`);
						return () => ({ unsubscribe: () => {} });
					}
				}

				// For all other properties, return the original
				const value = target[prop as keyof typeof target];
				if (typeof value === 'function') {
					return value.bind(target);
				}
				return value;
			}
		});

		// Use basic Fabric.js Canvas instead of CanvasTimeline to avoid state errors
		console.log("Creating basic Fabric.js Canvas for track resize demo");

		const canvas = new Canvas(canvasEl, {
			width: containerWidth,
			height: containerHeight,
			selection: true,
			preserveObjectStacking: true,
		});

		console.log("Basic Fabric.js canvas created");

		// Initialize transition properties to prevent undefined errors
		if (!canvas.tracks) canvas.tracks = [];
		if (!canvas.transitionIds) canvas.transitionIds = [];
		if (!canvas.transitionsMap) canvas.transitionsMap = {};

		canvasRef.current = canvas;

		// Debug: Check what methods are available on the created canvas instance
		console.log("Created canvas instance:", canvas);
		console.log("Canvas instance methods:", Object.getOwnPropertyNames(canvas));
		console.log(
			"Canvas instance prototype methods:",
			Object.getOwnPropertyNames(Object.getPrototypeOf(canvas)),
		);
		console.log("Canvas constructor name:", canvas.constructor.name);
		console.log(
			"Is addTrackItem available?",
			typeof (canvas as any).addTrackItem,
		);
		console.log(
			"Is alignItemsToTrack available?",
			typeof (canvas as any).alignItemsToTrack,
		);
		console.log(
			"Is requestRenderAll available?",
			typeof (canvas as any).requestRenderAll,
		);
		console.log("Is getObjects available?", typeof (canvas as any).getObjects);
		console.log("Canvas state after creation:", {
			tracks: canvas.tracks,
			trackItemIds: (canvas as any).trackItemIds,
			trackItemsMap: (canvas as any).trackItemsMap,
		});

		// Initialize timeline with current state items
		const currentState = stateManager.getState();
		console.log("Timeline initialization - current state:", currentState);
		console.log(
			"Timeline initialization - trackItemIds:",
			currentState.trackItemIds,
		);
		console.log(
			"Timeline initialization - trackItemsMap:",
			currentState.trackItemsMap,
		);
		console.log(
			"Timeline initialization - tracks:",
			currentState.tracks,
		);

		// Create simple Fabric.js rectangles as resizable tracks
		console.log("Creating Fabric.js track rectangles for resize testing");

		try {

			// Main track (video/image)
			const mainTrack = new Rect({
				id: "main-track",
				width: containerWidth - 80,
				height: 60,
				left: 40,
				top: 50,
				fill: "#18181b",
				stroke: "#444",
				strokeWidth: 1,
				selectable: true,
				hasControls: true,
				hasBorders: true,
				lockMovementX: false,
				lockMovementY: true,
				lockScalingX: true,  // Only vertical resize
				lockScalingY: false, // Allow vertical resize
				minScaleY: 0.5,      // Min height: 30px
				maxScaleY: 1.67,     // Max height: 100px
			});

			// Audio track
			const audioTrack = new Rect({
				id: "audio-track",
				width: containerWidth - 80,
				height: 40,
				left: 40,
				top: 120,
				fill: "#18181b",
				stroke: "#444",
				strokeWidth: 1,
				selectable: true,
				hasControls: true,
				hasBorders: true,
				lockMovementX: false,
				lockMovementY: true,
				lockScalingX: true,  // Only vertical resize
				lockScalingY: false, // Allow vertical resize
				minScaleY: 0.75,     // Min height: 30px
				maxScaleY: 2.5,      // Max height: 100px
			});

			// Add labels to tracks
			const mainLabel = new FabricText("Main Track", {
				left: 50,
				top: 65,
				fontSize: 12,
				fill: "#fff",
				selectable: false,
			});

			const audioLabel = new FabricText("Audio Track", {
				left: 50,
				top: 135,
				fontSize: 12,
				fill: "#fff",
				selectable: false,
			});

			console.log("Adding Fabric.js tracks to canvas");
			canvas.add(mainTrack);
			canvas.add(audioTrack);
			canvas.add(mainLabel);
			canvas.add(audioLabel);

			// Force canvas render
			canvas.renderAll();

			console.log("Fabric.js tracks added - fully resizable!");

		} catch (error) {
			console.error("Error creating Fabric.js tracks:", error);
		}

		// Skip manual item addition to prevent errors
		// Let the timeline handle items through state manager events instead
		console.log("Timeline state:", {
			trackItemIds: currentState.trackItemIds,
			trackItemsMap: Object.keys(currentState.trackItemsMap).length + " items",
			tracks: currentState.tracks
		});

		// Just initialize the timeline and let state events handle the rest
		if (currentState.trackItemIds && currentState.trackItemIds.length > 0) {
			console.log("Items found in state, will be handled by state manager events");
		} else {
			console.log("No track items in initial state");
		}

		setCanvasSize({ width: containerWidth, height: containerHeight });
		setSize({
			width: containerWidth,
			height: 0,
		});
		setTimeline(canvas);

		return () => {
			canvas.purge();
		};
	}, []);

	const handleOnScrollH = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		const scrollLeft = e.currentTarget.scrollLeft;
		if (canScrollRef.current) {
			const canvas = canvasRef.current;
			if (canvas) {
				// Use Fabric.js viewport transform for scrolling
				const vpt = canvas.viewportTransform;
				if (vpt) {
					vpt[4] = -scrollLeft; // Update horizontal offset
					canvas.setViewportTransform(vpt);
					canvas.renderAll();
				}
			}
		}
		setScrollLeft(scrollLeft);
	};

	const handleOnScrollV = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		const scrollTop = e.currentTarget.scrollTop;
		if (canScrollRef.current) {
			const canvas = canvasRef.current;
			if (canvas) {
				// Use Fabric.js viewport transform for vertical scrolling
				const vpt = canvas.viewportTransform;
				if (vpt) {
					vpt[5] = -scrollTop; // Update vertical offset
					canvas.setViewportTransform(vpt);
					canvas.renderAll();
				}
			}
		}
	};

	useEffect(() => {
		const addEvents = subject.pipe(
			filter(({ key }: { key: string }) => key.startsWith(TIMELINE_PREFIX)),
		);

		const subscription = addEvents.subscribe((obj: any) => {
			if (obj.key === TIMELINE_BOUNDING_CHANGED) {
				const bounding = obj.value?.payload?.bounding;
				if (bounding) {
					setSize({
						width: bounding.width,
						height: bounding.height,
					});
				}
			}
		});
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleReplaceItem = (trackItem: Partial<ITrackItem>) => {
		if (!trackItem.id) return;

		dispatch(REPLACE_MEDIA, {
			payload: {
				[trackItem.id]: {
					details: {
						src: "https://cdn.designcombo.dev/videos/demo-video-4.mp4",
					},
				},
			},
		});
	};

	const onClickRuler = (units: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const time = unitsToTimeMs(units, scale.zoom);
		playerRef?.current?.seekTo((time * fps) / 1000);
	};

	const onRulerScroll = (newScrollLeft: number) => {
		// Update the timeline canvas scroll position using Fabric.js viewport transform
		const canvas = canvasRef.current;
		if (canvas) {
			// For Fabric.js Canvas, we need to use viewport transform to handle scrolling
			const vpt = canvas.viewportTransform;
			if (vpt) {
				vpt[4] = -newScrollLeft; // Update horizontal offset
				canvas.setViewportTransform(vpt);
				canvas.renderAll();
			}
		}

		// Update the horizontal scrollbar position
		if (horizontalScrollbarVpRef.current) {
			horizontalScrollbarVpRef.current.scrollLeft = newScrollLeft;
		}

		// Update the local scroll state
		setScrollLeft(newScrollLeft);
	};

	useEffect(() => {
		const availableScroll = horizontalScrollbarVpRef.current?.scrollWidth;
		const canvas = canvasRef.current;
		if (!availableScroll || !canvas) return;
		const canvasWidth = canvasSize.width;
		if (availableScroll < canvasWidth + scrollLeft) {
			// Use Fabric.js viewport transform for auto-scrolling
			const targetScrollLeft = availableScroll - canvasWidth;
			const vpt = canvas.viewportTransform;
			if (vpt) {
				vpt[4] = -targetScrollLeft; // Update horizontal offset
				canvas.setViewportTransform(vpt);
				canvas.renderAll();
			}
		}
	}, [scale, canvasSize.width]);

	return (
		<div
			ref={timelineContainerRef}
			id={"timeline-container"}
			className="bg-muted/40 relative h-full w-full overflow-hidden border-l-2 border-border"
		>
			<Header />
			<Ruler
				onClick={onClickRuler}
				scrollLeft={scrollLeft}
				onScroll={onRulerScroll}
			/>
			<Playhead scrollLeft={scrollLeft} />
			<div className="flex">
				<div
					style={{
						width: timelineOffsetX,
					}}
					className="relative flex-none"
				/>
				<div style={{ height: canvasSize.height }} className="relative flex-1">
					<div
						style={{ height: canvasSize.height }}
						ref={containerRef}
						className="absolute top-0 w-full"
					>
						<canvas id="designcombo-timeline-canvas" ref={canvasElRef} />
					</div>
					<ScrollArea.Root
						type="always"
						style={{
							position: "absolute",
							width: "calc(100vw - 40px)",
							height: "10px",
						}}
						className="ScrollAreaRootH"
						onPointerDown={() => {
							canScrollRef.current = true;
						}}
						onPointerUp={() => {
							canScrollRef.current = false;
						}}
					>
						<ScrollArea.Viewport
							onScroll={handleOnScrollH}
							className="ScrollAreaViewport"
							id="viewportH"
							ref={horizontalScrollbarVpRef}
						>
							<div
								style={{
									width:
										size.width > canvasSize.width
											? size.width + TIMELINE_OFFSET_CANVAS_RIGHT
											: size.width,
								}}
								className="pointer-events-none h-[10px]"
							/>
						</ScrollArea.Viewport>

						<ScrollArea.Scrollbar
							className="ScrollAreaScrollbar"
							orientation="horizontal"
						>
							<ScrollArea.Thumb
								onMouseDown={() => {
									canScrollRef.current = true;
								}}
								onMouseUp={() => {
									canScrollRef.current = false;
								}}
								className="ScrollAreaThumb"
							/>
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>

					<ScrollArea.Root
						type="always"
						style={{
							position: "absolute",
							height: canvasSize.height,
							width: "10px",
						}}
						className="ScrollAreaRootV"
					>
						<ScrollArea.Viewport
							onScroll={handleOnScrollV}
							className="ScrollAreaViewport"
							ref={verticalScrollbarVpRef}
						>
							<div
								style={{
									height:
										size.height > canvasSize.height
											? size.height + 40
											: canvasSize.height,
								}}
								className="pointer-events-none w-[10px]"
							/>
						</ScrollArea.Viewport>
						<ScrollArea.Scrollbar
							className="ScrollAreaScrollbar"
							orientation="vertical"
						>
							<ScrollArea.Thumb
								onMouseDown={() => {
									canScrollRef.current = true;
								}}
								onMouseUp={() => {
									canScrollRef.current = false;
								}}
								className="ScrollAreaThumb"
							/>
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</div>
			</div>
		</div>
	);
};

export default Timeline;
