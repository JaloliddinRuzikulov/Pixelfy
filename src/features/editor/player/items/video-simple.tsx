import { IVideo } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateMediaStyles } from "../styles";
import { OffthreadVideo } from "remotion";
import useChromaKeyStore from "../../store/use-chroma-key-store";
import ChromaKeyVideo from "../components/ChromaKeyVideo";

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

	const crop = details?.crop || {
		x: 0,
		y: 0,
		width: details.width,
		height: details.height,
	};

	console.log("Video component render:", {
		itemId: item.id,
		hasChromaKey: !!chromaKey,
		chromaKeyEnabled: chromaKey?.enabled,
		src: details.src,
	});

	// Use ChromaKeyVideo component if chroma key is enabled
	if (chromaKey?.enabled) {
		const children = (
			<div style={calculateMediaStyles(details, crop)}>
				<ChromaKeyVideo
					src={details.src}
					chromaKey={chromaKey}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
			</div>
		);

		return BaseSequence({ item, options, children });
	}

	// Default video rendering without chroma key
	const children = (
		<div style={calculateMediaStyles(details, crop)}>
			<OffthreadVideo
				startFrom={(item.trim?.from! / 1000) * fps}
				endAt={(item.trim?.to! / 1000) * fps || 1 / fps}
				playbackRate={playbackRate}
				src={details.src}
				volume={(details.volume || 0) / 100}
			/>
		</div>
	);

	return BaseSequence({ item, options, children });
};

export default Video;
