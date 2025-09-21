import React, { useState } from "react";
import {
	IAudio,
	IImage,
	IText,
	ITrackItem,
	ITrackItemAndDetails,
	IVideo,
	IBoxShadow,
} from "@designcombo/types";
import { useEffect } from "react";
import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import {
	LassoSelect,
	Type,
	Palette,
	Layout,
	Layers,
	Eye,
	ChevronDown,
	ChevronRight,
	Settings,
	Image as ImageIcon,
	Film,
	Music,
	Sliders,
	Sparkles,
	Square,
	Droplet,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import { useTranslations } from "next-intl";

interface CollapsibleSectionProps {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
}

const CollapsibleSection = ({
	title,
	icon,
	children,
	defaultOpen = false,
}: CollapsibleSectionProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-border/30 last:border-b-0">
			<Button
				variant="ghost"
				className="w-full justify-between px-3 py-2.5 h-auto font-medium text-xs hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex items-center gap-2">
					<div className="text-muted-foreground/70">{icon}</div>
					<span>{title}</span>
				</div>
				{isOpen ? (
					<ChevronDown className="h-3.5 w-3.5" />
				) : (
					<ChevronRight className="h-3.5 w-3.5" />
				)}
			</Button>
			{isOpen && (
				<div className="px-2 py-2 bg-background/30 border-t border-border/20">
					{children}
				</div>
			)}
		</div>
	);
};

const TextControlSections = ({
	trackItem,
}: { trackItem: ITrackItem & IText }) => {
	const t = useTranslations("editor");
	return (
		<>
			<CollapsibleSection
				title={t("addText")}
				icon={<Type className="h-4 w-4" />}
				defaultOpen={true}
			>
				<BasicText trackItem={trackItem} type="textControls" />
			</CollapsibleSection>

			<CollapsibleSection
				title="Matn stillari"
				icon={<Sparkles className="h-4 w-4" />}
			>
				<BasicText trackItem={trackItem} type="textPreset" />
			</CollapsibleSection>

			<CollapsibleSection
				title="Chegaralar"
				icon={<Square className="h-4 w-4" />}
			>
				<BasicText trackItem={trackItem} type="fontStroke" />
			</CollapsibleSection>

			<CollapsibleSection title="Soya" icon={<Droplet className="h-4 w-4" />}>
				<BasicText trackItem={trackItem} type="fontShadow" />
			</CollapsibleSection>
		</>
	);
};

const ImageControlSections = ({
	trackItem,
}: { trackItem: ITrackItem & IImage }) => {
	const t = useTranslations("editor");
	return (
		<>
			<CollapsibleSection
				title={t("addImage")}
				icon={<ImageIcon className="h-4 w-4" />}
				defaultOpen={true}
			>
				<BasicImage trackItem={trackItem} />
			</CollapsibleSection>

			<CollapsibleSection
				title="Filtrlash"
				icon={<Sliders className="h-4 w-4" />}
			>
				<div className="p-2 text-sm text-muted-foreground">Tez kunda...</div>
			</CollapsibleSection>

			<CollapsibleSection title="Ko'rinish" icon={<Eye className="h-4 w-4" />}>
				<div className="p-2 text-sm text-muted-foreground">
					Shaffoflik va blend sozlamalari
				</div>
			</CollapsibleSection>
		</>
	);
};

const VideoControlSections = ({
	trackItem,
}: { trackItem: ITrackItem & IVideo }) => {
	const t = useTranslations("editor");
	return (
		<>
			<CollapsibleSection
				title={t("addVideo")}
				icon={<Film className="h-4 w-4" />}
				defaultOpen={true}
			>
				<BasicVideo trackItem={trackItem} />
			</CollapsibleSection>

			<CollapsibleSection
				title="Effektlar"
				icon={<Sparkles className="h-4 w-4" />}
			>
				<div className="p-2 text-sm text-muted-foreground">
					Video effektlar tez kunda...
				</div>
			</CollapsibleSection>

			<CollapsibleSection title="Audio" icon={<Music className="h-4 w-4" />}>
				<div className="p-2 text-sm text-muted-foreground">
					Audio sozlamalari
				</div>
			</CollapsibleSection>
		</>
	);
};

const AudioControlSections = ({
	trackItem,
}: { trackItem: ITrackItem & IAudio }) => {
	const t = useTranslations("editor");
	return (
		<>
			<CollapsibleSection
				title={t("addAudio")}
				icon={<Music className="h-4 w-4" />}
				defaultOpen={true}
			>
				<BasicAudio trackItem={trackItem} />
			</CollapsibleSection>

			<CollapsibleSection
				title="Effektlar"
				icon={<Sparkles className="h-4 w-4" />}
			>
				<div className="p-2 text-sm text-muted-foreground">
					Audio effektlar tez kunda...
				</div>
			</CollapsibleSection>
		</>
	);
};

const ActiveControlItem = ({
	trackItem,
}: {
	trackItem?: ITrackItemAndDetails;
}) => {
	// Container already checks if trackItem exists
	if (!trackItem) {
		return null;
	}

	const getControlSections = () => {
		switch (trackItem.type) {
			case "text":
				return (
					<TextControlSections trackItem={trackItem as ITrackItem & IText} />
				);
			case "image":
				return (
					<ImageControlSections trackItem={trackItem as ITrackItem & IImage} />
				);
			case "video":
				return (
					<VideoControlSections trackItem={trackItem as ITrackItem & IVideo} />
				);
			case "audio":
				return (
					<AudioControlSections trackItem={trackItem as ITrackItem & IAudio} />
				);
			default:
				return null;
		}
	};

	const getItemTypeTitle = () => {
		switch (trackItem.type) {
			case "text":
				return "Matn tahrirlash";
			case "image":
				return "Rasm tahrirlash";
			case "video":
				return "Video tahrirlash";
			case "audio":
				return "Audio tahrirlash";
			default:
				return "Element tahrirlash";
		}
	};

	const getItemTypeIcon = () => {
		switch (trackItem.type) {
			case "text":
				return <Type className="h-4 w-4" />;
			case "image":
				return <ImageIcon className="h-4 w-4" />;
			case "video":
				return <Film className="h-4 w-4" />;
			case "audio":
				return <Music className="h-4 w-4" />;
			default:
				return <Settings className="h-4 w-4" />;
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-58px)]">
			{/* Header */}
			<div className="px-3 py-2.5 border-b border-border/40 bg-muted/20">
				<div className="flex items-center gap-2">
					<div className="text-muted-foreground">{getItemTypeIcon()}</div>
					<span className="text-sm font-medium text-foreground/90">
						{getItemTypeTitle()}
					</span>
				</div>
			</div>

			{/* Scrollable content */}
			<ScrollArea className="flex-1 bg-background/5">
				<div className="pb-4">{getControlSections()}</div>
			</ScrollArea>
		</div>
	);
};

const Container = ({ children }: { children: React.ReactNode }) => {
	const { activeIds, trackItemsMap, transitionsMap } = useStore();
	const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
	const { setTrackItem: setLayoutTrackItem, showMenuItem } = useLayoutStore();

	useEffect(() => {
		if (activeIds.length === 1) {
			const [id] = activeIds;
			const trackItem = trackItemsMap[id];
			if (trackItem) {
				setTrackItem(trackItem);
				setLayoutTrackItem(trackItem);
			} else console.log(transitionsMap[id]);
		} else {
			setTrackItem(null);
			setLayoutTrackItem(null);
		}
	}, [activeIds, trackItemsMap]);

	// Only show when an item is selected
	if (!trackItem) {
		return null;
	}

	return (
		<div className="flex w-[272px] flex-none border-l border-border/40 bg-card/50 hidden lg:block">
			{React.cloneElement(children as React.ReactElement<any>, {
				trackItem,
			})}
		</div>
	);
};

export const ControlItemV2 = () => {
	return (
		<Container>
			<ActiveControlItem />
		</Container>
	);
};
