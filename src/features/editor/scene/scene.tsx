import { Player } from "../player";
import { useRef, useImperativeHandle, forwardRef } from "react";
import useStore from "../store/use-store";
import StateManager from "@designcombo/state";
import SceneEmpty from "./empty";
import Board from "./board";
import useZoom from "../hooks/use-zoom";
import { SceneInteractions } from "./interactions";
import { SceneRef } from "./scene.types";

const Scene = forwardRef<
	SceneRef,
	{
		stateManager: StateManager;
	}
>(({ stateManager }, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { size, trackItemIds, background } = useStore();
	const { zoom, handlePinch, recalculateZoom } = useZoom(
		containerRef as React.RefObject<HTMLDivElement>,
		size,
	);

	// Expose the recalculateZoom function to parent
	useImperativeHandle(ref, () => ({
		recalculateZoom,
	}));

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				flex: 1,
				overflow: "hidden",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
			className="bg-gradient-to-br from-background via-muted/5 to-muted/20 border-2 border-border rounded-sm"
			ref={containerRef}
		>
			{trackItemIds.length === 0 && <SceneEmpty />}
			<div
				style={{
					width: size.width,
					height: size.height,
					transform: `scale(${zoom})`,
					position: "absolute",
					backgroundColor: background.value,
				}}
				className="player-container rounded-sm border-2 border-border/50"
			>
				<div
					style={{
						position: "absolute",
						zIndex: 100,
						pointerEvents: "none",
						width: size.width,
						height: size.height,
						background: "transparent",
					}}
					className="shadow-[0_0_0_5000px_var(--background)] border-2 border-primary/20 rounded-sm"
				/>
				<Board size={size}>
					<Player />
					<SceneInteractions
						stateManager={stateManager}
						containerRef={containerRef as React.RefObject<HTMLDivElement>}
						zoom={zoom}
						size={size}
					/>
				</Board>
			</div>
		</div>
	);
});

Scene.displayName = "Scene";

export default Scene;
