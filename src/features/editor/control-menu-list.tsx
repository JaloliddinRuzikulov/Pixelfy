import React, { memo, useCallback, useMemo, useState } from "react";
import useStore from "./store/use-store";
import useLayoutStore from "./store/use-layout-store";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Type,
	Palette,
	Layout,
	Layers,
	Eye,
	Sliders,
	Sparkles,
	Square,
	Droplet,
	Image as ImageIcon,
	Film,
	Music,
	Settings,
} from "lucide-react";
import BasicText from "./control-item/basic-text";
import BasicImage from "./control-item/basic-image";
import BasicVideo from "./control-item/basic-video";
import BasicAudio from "./control-item/basic-audio";
import {
	ITrackItem,
	IText,
	IImage,
	IVideo,
	IAudio,
} from "@designcombo/types";

// Define control menu items configuration
const CONTROL_MENU_CONFIG = {
	text: [
		{
			id: "textSettings",
			icon: Type,
			labelKey: "editor.addText",
			type: "textControls",
		},
		{
			id: "textStyles",
			icon: Sparkles,
			labelKey: "media.texts",
			type: "textPreset",
		},
		{
			id: "textBorder",
			icon: Square,
			labelKey: "editor.addText",
			type: "fontStroke",
		},
		{
			id: "textShadow",
			icon: Droplet,
			labelKey: "editor.addText",
			type: "fontShadow",
		},
	],
	image: [
		{
			id: "imageSettings",
			icon: ImageIcon,
			labelKey: "editor.addImage",
			type: "basic",
		},
		{
			id: "imageFilters",
			icon: Sliders,
			labelKey: "editor.addImage",
			type: "filters",
		},
		{
			id: "imageAppearance",
			icon: Eye,
			labelKey: "editor.opacity",
			type: "appearance",
		},
	],
	video: [
		{
			id: "videoSettings",
			icon: Film,
			labelKey: "editor.addVideo",
			type: "basic",
		},
		{
			id: "videoEffects",
			icon: Sparkles,
			labelKey: "editor.addEffect",
			type: "effects",
		},
		{
			id: "videoAudio",
			icon: Music,
			labelKey: "editor.addAudio",
			type: "audio",
		},
	],
	audio: [
		{
			id: "audioSettings",
			icon: Music,
			labelKey: "editor.addAudio",
			type: "basic",
		},
		{
			id: "audioEffects",
			icon: Sparkles,
			labelKey: "editor.addEffect",
			type: "effects",
		},
	],
};

// Menu button component
const ControlMenuButton = memo(
	({
		item,
		isActive,
		onClick,
	}: {
		item: any;
		isActive: boolean;
		onClick: (menuItem: string) => void;
	}) => {
		const IconComponent = item.icon;

		return (
			<button
				onClick={() => onClick(item.id)}
				className={cn(
					"relative flex flex-col items-center justify-center gap-0.5 w-16 h-16 py-1.5 rounded-lg transition-all duration-200 group",
					isActive
						? "bg-muted/60 text-primary shadow-sm"
						: "hover:bg-muted/30 text-muted-foreground hover:text-foreground",
				)}
				aria-label={item.ariaLabel || item.label}
				aria-pressed={isActive}
				role="button"
			>
				{isActive && (
					<div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full shadow-glow" />
				)}

				<div
					className={cn(
						"p-1.5 rounded-md",
						isActive ? "text-primary" : "group-hover:text-foreground",
					)}
				>
					{IconComponent ? (
						<IconComponent
							className="w-[18px] h-[18px]"
							strokeWidth={isActive ? 2.2 : 1.8}
						/>
					) : null}
				</div>
				<span
					className={cn(
						"text-[10px] font-medium",
						isActive
							? "text-primary font-semibold"
							: "text-muted-foreground/80 group-hover:text-muted-foreground",
					)}
				>
					{item.label}
				</span>
			</button>
		);
	},
);

ControlMenuButton.displayName = "ControlMenuButton";

// Control content component
const ControlContent = ({
	trackItem,
	activeSection,
}: { trackItem: ITrackItem; activeSection: string }) => {
	const getContent = () => {
		switch (trackItem.type) {
			case "text":
				return (
					<BasicText
						trackItem={trackItem as ITrackItem & IText}
						type={activeSection}
					/>
				);
			case "image":
				if (activeSection === "basic") {
					return <BasicImage trackItem={trackItem as ITrackItem & IImage} />;
				}
				return (
					<div className="p-4 text-sm text-muted-foreground">Tez kunda...</div>
				);
			case "video":
				if (activeSection === "basic") {
					return <BasicVideo trackItem={trackItem as ITrackItem & IVideo} />;
				}
				return (
					<div className="p-4 text-sm text-muted-foreground">Tez kunda...</div>
				);
			case "audio":
				if (activeSection === "basic") {
					return <BasicAudio trackItem={trackItem as ITrackItem & IAudio} />;
				}
				return (
					<div className="p-4 text-sm text-muted-foreground">Tez kunda...</div>
				);
			default:
				return null;
		}
	};

	return (
		<ScrollArea className="flex-1 min-w-[200px] bg-background">
			<div className="p-3">{getContent()}</div>
		</ScrollArea>
	);
};

// Main control menu list component
function ControlMenuList() {
	const t = useTranslations();
	const { activeIds, trackItemsMap } = useStore();
	const [activeSection, setActiveSection] = useState<string>("");
	const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);

	// Get the selected track item
	React.useEffect(() => {
		if (activeIds.length === 1) {
			const [id] = activeIds;
			const item = trackItemsMap[id];
			if (item) {
				setTrackItem(item);
				// Set default active section based on item type
				if (!activeSection) {
					const config =
						CONTROL_MENU_CONFIG[item.type as keyof typeof CONTROL_MENU_CONFIG];
					if (config && config[0]) {
						setActiveSection(config[0].type);
					}
				}
			}
		} else {
			setTrackItem(null);
			setActiveSection("");
		}
	}, [activeIds, trackItemsMap]);

	// Get menu items based on track item type
	const menuItems = useMemo(() => {
		if (!trackItem) return [];

		const config =
			CONTROL_MENU_CONFIG[trackItem.type as keyof typeof CONTROL_MENU_CONFIG];
		if (!config) return [];

		return config.map((item) => ({
			...item,
			label: t(item.labelKey),
		}));
	}, [trackItem, t]);

	const handleMenuItemClick = useCallback(
		(menuItem: string) => {
			const item = menuItems.find((m) => m.id === menuItem);
			if (item) {
				setActiveSection(item.type);
			}
		},
		[menuItems],
	);

	// Don't show if no item is selected
	if (!trackItem || menuItems.length === 0) {
		return null;
	}

	return (
		<div className="hidden lg:flex h-[calc(100vh-58px)] border-l-2 border-border">
			{/* Content area - now on the left */}
			<ControlContent trackItem={trackItem} activeSection={activeSection} />

			{/* Icon menu - now on the right */}
			<nav
				className="flex w-20 flex-col items-center gap-0.5 border-l-2 border-border bg-muted/30 py-2 px-1.5"
				role="toolbar"
				aria-label="Control tools"
			>
				{menuItems.map((item, index) => {
					const isActive = activeSection === item.type;
					const showDivider = index > 0 && index % 2 === 0;

					return (
						<React.Fragment key={item.id}>
							{showDivider && (
								<div className="w-16 h-[2px] bg-border/80 my-2 mx-auto rounded-full" />
							)}
							<ControlMenuButton
								item={item}
								isActive={isActive}
								onClick={handleMenuItemClick}
							/>
						</React.Fragment>
					);
				})}
			</nav>
		</div>
	);
}

export default ControlMenuList;
