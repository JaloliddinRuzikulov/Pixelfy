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

const ActiveMenuItem = () => {
	const { activeMenuItem } = useLayoutStore();

	if (!activeMenuItem) {
		return null;
	}

	if (activeMenuItem === "texts") {
		return <Texts />;
	}
	if (activeMenuItem === "shapes") {
		return <Elements />;
	}
	if (activeMenuItem === "videos") {
		return <Videos />;
	}

	if (activeMenuItem === "audios") {
		return <Audios />;
	}

	if (activeMenuItem === "images") {
		return <Images />;
	}

	if (activeMenuItem === "voiceOver") {
		return <VoiceOver />;
	}
	if (activeMenuItem === "elements") {
		return <Elements />;
	}
	if (activeMenuItem === "uploads") {
		return <Uploads />;
	}

	if (activeMenuItem === "presentations") {
		return <Presentations />;
	}

	return null;
};

export const MenuItem = () => {
	const isLargeScreen = useIsLargeScreen();

	return (
		<div className={`${isLargeScreen ? "w-[300px] border-r-2 border-border bg-background/95" : "w-full"} flex-1 flex`}>
			<ActiveMenuItem />
		</div>
	);
};
