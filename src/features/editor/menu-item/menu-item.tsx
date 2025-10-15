import useLayoutStore from "../store/use-layout-store";
import { Texts } from "./texts";
import { Audios } from "./audios";
import { Elements } from "./elements";
import { Images } from "./images";
import { Videos } from "./videos";
import { VoiceOver } from "./voice-over";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { Uploads } from "./uploads";
import { Presentations } from "./presentations";
import SinxronMenuItem from "./wav2lip";
import { Office } from "./office";
import { Recording } from "./recording";
import { ContentLibrary } from "./content-library";
import { PresentAIMenuItem } from "./presentai-menu-item";

const ActiveMenuItem = () => {
	const { activeMenuItem } = useLayoutStore();

	if (!activeMenuItem) {
		return null;
	}

	if (activeMenuItem === "media") {
		return <Uploads />;
	}

	if (activeMenuItem === "presentai") {
		return <PresentAIMenuItem />;
	}

	if (activeMenuItem === "texts") {
		return <Texts />;
	}

	if (activeMenuItem === "uploads") {
		return <Uploads />;
	}

	if (activeMenuItem === "videos") {
		return <Videos />;
	}

	if (activeMenuItem === "images") {
		return <Images />;
	}

	if (activeMenuItem === "audios") {
		return <Audios />;
	}

	if (activeMenuItem === "elements") {
		return <Elements />;
	}

	if (activeMenuItem === "voiceOver") {
		return <VoiceOver />;
	}

	if (activeMenuItem === "presentations") {
		return <Presentations />;
	}

	if (activeMenuItem === "office") {
		return <Office />;
	}

	if (activeMenuItem === "recording") {
		return <Recording />;
	}

	if (activeMenuItem === "content-library") {
		return <ContentLibrary />;
	}

	if (activeMenuItem === "wav2lip") {
		return <SinxronMenuItem />;
	}

	return null;
};

export const MenuItem = () => {
	const isLargeScreen = useIsLargeScreen();
	const { activeMenuItem, showMenuItem } = useLayoutStore();

	// Don't render anything if no menu item is active or showMenuItem is false
	if (!activeMenuItem || (isLargeScreen && !showMenuItem)) {
		return null;
	}

	return (
		<div
			className={`${isLargeScreen ? "w-[300px] border-r-2 border-border bg-background/95" : "w-full"} flex-1 flex flex-col overflow-hidden`}
		>
			<ActiveMenuItem />
		</div>
	);
};
