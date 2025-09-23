import React, { memo, useCallback, useMemo } from "react";
import useLayoutStore from "./store/use-layout-store";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
	Mic,
	Presentation,
	UserCheck,
	FileSpreadsheet,
	PenTool,
	Library,
	Type,
	Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { MenuItem } from "./menu-item/menu-item";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { useTranslations } from "next-intl";

// Define menu items configuration for better maintainability
// Labels will be translated dynamically
const MENU_ITEMS_CONFIG = [
	{
		id: "media",
		icon: Upload,
		labelKey: "media.media",
		ariaLabelKey: "media.mediaAria",
	},
	{
		id: "wav2lip",
		icon: UserCheck,
		labelKey: "media.wav2lip",
		ariaLabelKey: "media.wav2lipAria",
	},
	{
		id: "office",
		icon: FileSpreadsheet,
		labelKey: "media.office",
		ariaLabelKey: "media.officeAria",
	},
	{
		id: "recording",
		icon: PenTool,
		labelKey: "media.recording",
		ariaLabelKey: "media.recordingAria",
	},
	{
		id: "content-library",
		icon: Library,
		labelKey: "media.contentLibrary",
		ariaLabelKey: "media.contentLibraryAria",
	},
	{
		id: "texts",
		icon: Type,
		labelKey: "media.texts",
		ariaLabelKey: "media.textsAria",
	},
] as const;

// Memoized menu button component for better performance
const MenuButton = memo<{
	item: {
		id: string;
		icon: any;
		label: string;
		ariaLabel: string;
	};
	isActive: boolean;
	onClick: (menuItem: string) => void;
}>(({ item, isActive, onClick }) => {
	const handleClick = useCallback(() => {
		onClick(item.id);
	}, [item.id, onClick]);

	const IconComponent = item.icon;

	return (
		<button
			onClick={handleClick}
			className={cn(
				"flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg w-full group relative",
				isActive
					? "bg-primary/15 text-primary border border-primary/20"
					: "text-muted-foreground hover:text-foreground hover:bg-muted/40",
			)}
			aria-label={item.ariaLabel}
			aria-pressed={isActive}
		>
			{/* Active state indicator */}
			{isActive && (
				<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-glow" />
			)}

			<div
				className={cn(
					"p-1.5 rounded-md",
					isActive ? "text-primary" : "group-hover:text-foreground",
				)}
			>
				{IconComponent ? (
					<IconComponent
						width={18}
						height={18}
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
});

MenuButton.displayName = "MenuButton";

// Main MenuList component
function MenuList() {
	const t = useTranslations();
	const {
		setActiveMenuItem,
		setShowMenuItem,
		activeMenuItem,
		showMenuItem,
		drawerOpen,
		setDrawerOpen,
	} = useLayoutStore();

	const isLargeScreen = useIsLargeScreen();

	// Create menu items with translations
	const MENU_ITEMS = useMemo(() => {
		return MENU_ITEMS_CONFIG.map((item) => ({
			id: item.id,
			icon: item.icon,
			label: t(item.labelKey),
			ariaLabel: t(item.ariaLabelKey),
		}));
	}, [t]);

	const handleMenuItemClick = useCallback(
		(menuItem: string) => {
			// Agar bir xil menu item ni bosgan bo'lsa, collapse qil
			if (activeMenuItem === menuItem && (showMenuItem || drawerOpen)) {
				if (isLargeScreen) {
					setShowMenuItem(false);
				} else {
					setDrawerOpen(false);
				}
				return;
			}

			setActiveMenuItem(menuItem as any);
			// Use drawer on mobile, sidebar on desktop
			if (!isLargeScreen) {
				setDrawerOpen(true);
			} else {
				setShowMenuItem(true);
			}
		},
		[
			isLargeScreen,
			setActiveMenuItem,
			setDrawerOpen,
			setShowMenuItem,
			activeMenuItem,
			showMenuItem,
			drawerOpen,
		],
	);

	const handleDrawerOpenChange = useCallback(
		(open: boolean) => {
			setDrawerOpen(open);
		},
		[setDrawerOpen],
	);

	return (
		<>
			<nav
				className="flex w-20 flex-col items-center gap-0.5 border-r-2 border-border bg-muted/30 py-2 px-1.5"
				role="toolbar"
				aria-label="Editor tools"
			>
				{MENU_ITEMS.map((item, index) => {
					const isActive =
						(drawerOpen && activeMenuItem === item.id) ||
						(showMenuItem && activeMenuItem === item.id);

					const showDivider = index === 0;

					return (
						<React.Fragment key={item.id}>
							{showDivider && index !== 0 && (
								<div className="w-16 h-[2px] bg-border/80 my-2 mx-auto rounded-full" />
							)}
							<MenuButton
								item={item}
								isActive={isActive}
								onClick={handleMenuItemClick}
							/>
						</React.Fragment>
					);
				})}
			</nav>

			{/* Drawer only on mobile/tablet - conditionally mounted */}
			{!isLargeScreen && (
				<Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
					<DrawerContent className="max-h-[80vh]">
						<DrawerHeader>
							<DrawerTitle className="capitalize">{activeMenuItem}</DrawerTitle>
						</DrawerHeader>
						<div className="flex-1 overflow-auto">
							<MenuItem />
						</div>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
}

export default memo(MenuList);
