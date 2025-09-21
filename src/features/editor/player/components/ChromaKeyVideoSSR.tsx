import React from "react";
import { Video, OffthreadVideo } from "remotion";

interface ChromaKeySettings {
	enabled: boolean;
	keyColor: string;
	similarity: number;
	smoothness: number;
	spill: number;
	contrast: number;
	brightness: number;
}

interface ChromaKeyVideoSSRProps {
	src: string;
	chromaKey?: ChromaKeySettings;
	style?: React.CSSProperties;
	startFrom?: number;
	endAt?: number;
	volume?: number;
	playbackRate?: number;
}

/**
 * Server-side compatible ChromaKey video component
 * Uses CSS filters and SVG filters for chroma key effect
 */
export const ChromaKeyVideoSSR: React.FC<ChromaKeyVideoSSRProps> = ({
	src,
	chromaKey,
	style,
	startFrom,
	endAt,
	volume = 1,
	playbackRate = 1,
}) => {
	if (!chromaKey?.enabled) {
		// No chroma key - render normal video
		return (
			<OffthreadVideo
				src={src}
				startFrom={startFrom}
				endAt={endAt}
				volume={volume}
				playbackRate={playbackRate}
				style={style}
			/>
		);
	}

	// Convert hex color to RGB
	const hex = chromaKey.keyColor.replace("#", "");
	const keyR = parseInt(hex.substr(0, 2), 16) / 255;
	const keyG = parseInt(hex.substr(2, 2), 16) / 255;
	const keyB = parseInt(hex.substr(4, 2), 16) / 255;

	// Create SVG filter for chroma key effect
	const filterId = `chromakey-${Math.random().toString(36).substr(2, 9)}`;

	// Calculate filter values based on settings
	const tolerance = chromaKey.similarity;
	const softness = chromaKey.smoothness;
	const spillAmount = chromaKey.spill;

	return (
		<>
			<svg width="0" height="0" style={{ position: "absolute" }}>
				<defs>
					<filter id={filterId}>
						{/* Color matrix to isolate the key color */}
						<feColorMatrix
							type="matrix"
							values={`
								1 0 0 0 0
								0 1 0 0 0
								0 0 1 0 0
								${-keyR} ${-keyG} ${-keyB} 1 0
							`}
						/>

						{/* Gaussian blur for smoothness */}
						{softness > 0 && <feGaussianBlur stdDeviation={softness * 2} />}

						{/* Component transfer for threshold */}
						<feComponentTransfer>
							<feFuncA type="discrete" tableValues={`0 ${1 - tolerance} 1`} />
						</feComponentTransfer>

						{/* Spill suppression */}
						{spillAmount > 0 && (
							<feColorMatrix
								type="matrix"
								values={`
									${1 - spillAmount * keyR} 0 0 0 0
									0 ${1 - spillAmount * keyG} 0 0 0
									0 0 ${1 - spillAmount * keyB} 0 0
									0 0 0 1 0
								`}
							/>
						)}

						{/* Apply contrast and brightness */}
						<feComponentTransfer>
							<feFuncR
								type="linear"
								slope={chromaKey.contrast}
								intercept={chromaKey.brightness}
							/>
							<feFuncG
								type="linear"
								slope={chromaKey.contrast}
								intercept={chromaKey.brightness}
							/>
							<feFuncB
								type="linear"
								slope={chromaKey.contrast}
								intercept={chromaKey.brightness}
							/>
						</feComponentTransfer>
					</filter>
				</defs>
			</svg>

			<div
				style={{
					...style,
					filter: `url(#${filterId})`,
				}}
			>
				<OffthreadVideo
					src={src}
					startFrom={startFrom}
					endAt={endAt}
					volume={volume}
					playbackRate={playbackRate}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
			</div>
		</>
	);
};

export default ChromaKeyVideoSSR;
