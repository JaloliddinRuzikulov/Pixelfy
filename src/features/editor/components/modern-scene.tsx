"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import Scene from "../scene";
import { SceneRef } from "../scene/scene.types";

interface ModernSceneProps {
	stateManager: any;
	timeline: any;
	playerRef: any;
}

const ModernScene = forwardRef<SceneRef, ModernSceneProps>(
	({ stateManager, timeline, playerRef }, ref) => {
		const sceneRef = useRef<SceneRef>(null);

		useImperativeHandle(ref, () => sceneRef.current!, []);

		return (
			<div className="h-full w-full flex items-center justify-center p-8">
				<div className="relative w-full h-full max-w-2xl max-h-[80vh] bg-black rounded-lg overflow-hidden">
					<Scene ref={sceneRef} stateManager={stateManager} />

					{/* Aspect Ratio Overlay */}
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute top-0 left-0 bg-gradient-to-br from-blue-500/10 to-transparent w-32 h-32" />
						<div className="absolute bottom-0 right-0 bg-gradient-to-tl from-purple-500/10 to-transparent w-32 h-32" />
					</div>
				</div>
			</div>
		);
	},
);

ModernScene.displayName = "ModernScene";

export default ModernScene;
