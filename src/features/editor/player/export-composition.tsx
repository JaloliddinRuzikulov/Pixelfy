import React from "react";
import { Composition as RemotionComposition } from "remotion";
import Composition from "./composition";
import { IDesign } from "@designcombo/types";

interface ExportCompositionProps {
	design: IDesign;
	chromaKeySettings?: any;
}

/**
 * Wrapper composition for Remotion export
 * This ensures all props are properly passed during server-side rendering
 */
export const ExportComposition: React.FC<ExportCompositionProps> = ({
	design,
	chromaKeySettings,
}) => {
	const { size, duration = 0, fps = 30 } = design;
	const durationInFrames = Math.round((duration / 1000) * fps) || 1;

	return (
		<RemotionComposition
			id="main"
			component={Composition}
			durationInFrames={durationInFrames}
			fps={fps}
			width={size.width}
			height={size.height}
			defaultProps={{
				design,
				chromaKeySettings,
			}}
		/>
	);
};

export default ExportComposition;
