import { IVideo } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateMediaStyles } from "../styles";
import { OffthreadVideo } from "remotion";
import useChromaKeyStore from "../../store/use-chroma-key-store";
import ChromaKeyVideo from "../components/ChromaKeyVideo";
import { useState, useEffect } from "react";

export const Video = ({
	item,
	options,
}: {
	item: IVideo;
	options: SequenceItemOptions;
}) => {
	const { fps } = options;
	const { details } = item;
	const playbackRate = item.playbackRate || 1;
	const { getChromaKey } = useChromaKeyStore();
	const chromaKey = getChromaKey(item.id);
	const [hasError, setHasError] = useState(false);

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	useEffect(() => {
		// Reset error state when src changes
		setHasError(false);
	}, [details.src]);

	console.log("Video component render:", {
		itemId: item.id,
		hasChromaKey: !!chromaKey,
		chromaKeyEnabled: chromaKey?.enabled,
		src: details.src,
		hasError,
	});

	// Handle video loading errors
	const handleVideoError = (error: any) => {
		console.error("Video loading error:", {
			itemId: item.id,
			src: details.src,
			error,
		});
		setHasError(true);
	};

	// Show error placeholder if video fails to load
	if (hasError) {
		return BaseSequence({
			item,
			options,
			children: (
				<div style={calculateMediaStyles(details, crop)}>
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "rgba(0, 0, 0, 0.2)",
							color: "#fff",
							fontSize: "14px",
						}}
					>
						Video failed to load
					</div>
				</div>
			),
		});
	}

	// Determine which video component to use based on chroma key
	const videoElement = chromaKey?.enabled ? (
		<ChromaKeyVideo
			src={details.src}
			chromaKey={chromaKey}
			style={{
				width: "100%",
				height: "100%",
				objectFit: "cover",
			}}
			onError={handleVideoError}
		/>
	) : (
		<OffthreadVideo
			startFrom={(item.trim?.from! / 1000) * fps}
			endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
			playbackRate={playbackRate}
			src={details.src}
			volume={(details.volume || 0) / 100}
			onError={handleVideoError}
		/>
	);

	const children = (
		<div style={calculateMediaStyles(details, crop)}>{videoElement}</div>
	);

	return BaseSequence({ item, options, children });
};

export default Video;
